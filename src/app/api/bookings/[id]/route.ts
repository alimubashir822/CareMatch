import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const user = await getUserFromSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, date, timeSlot } = await req.json();
    
    // Find the appointment first to check ownership
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Verify authorized user (patient, doctor, clinic, or admin)
    const isPatientOwner = user.role === 'PATIENT' && appointment.patient.userId === user.id;
    const isDoctorOwner = user.role === 'DOCTOR' && appointment.doctor.userId === user.id;
    const isClinicOwner = user.role === 'CLINIC'; // simplified for demo
    const isAdmin = user.role === 'ADMIN';

    if (!isPatientOwner && !isDoctorOwner && !isClinicOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden. You do not own this appointment.' }, { status: 403 });
    }

    // Process cancellation
    if (status === 'CANCELLED') {
      const updatedApt = await prisma.$transaction(async (tx) => {
        const apt = await tx.appointment.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });

        // Smart Waitlist trigger!
        // If a slot is cancelled, notify the first patient on the waitlist for this doctor.
        const waitlistEntry = await tx.waitlist.findFirst({
          where: {
            doctorId: appointment.doctorId,
            status: 'WAITING',
          },
          orderBy: { createdAt: 'asc' },
          include: { patient: { include: { user: true } } },
        });

        if (waitlistEntry) {
          // Notify the patient by updating status to NOTIFIED
          await tx.waitlist.update({
            where: { id: waitlistEntry.id },
            data: { status: 'NOTIFIED' },
          });

          // Write an audit log for waitlist notification
          await tx.auditLog.create({
            data: {
              userId: waitlistEntry.patient.userId,
              action: 'WAITLIST_NOTIFIED',
              details: `Waitlist slot opened up for doctor ${appointment.doctor.id}. Patient ${waitlistEntry.patient.user.name} has been notified.`,
            },
          });
        }

        return apt;
      });

      return NextResponse.json({ success: true, appointment: updatedApt });
    }

    // Process rescheduling
    if (date && timeSlot) {
      // Check slot conflicts
      const conflict = await prisma.appointment.findFirst({
        where: {
          doctorId: appointment.doctorId,
          date: new Date(date),
          timeSlot,
          id: { not: id }, // ignore current appointment
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (conflict) {
        return NextResponse.json({ error: 'The requested slot is already booked.' }, { status: 409 });
      }

      const updatedApt = await prisma.appointment.update({
        where: { id },
        data: {
          date: new Date(date),
          timeSlot,
          status: 'CONFIRMED', // auto confirm on reschedule
        },
      });

      return NextResponse.json({ success: true, appointment: updatedApt });
    }

    return NextResponse.json({ error: 'No valid update parameters provided' }, { status: 400 });
  } catch (error) {
    console.error('Update appointment API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
