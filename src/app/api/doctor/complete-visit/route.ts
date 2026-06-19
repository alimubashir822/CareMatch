import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const { appointmentId, notes, prescriptionName } = await req.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.doctorId !== doctor.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this appointment.' }, { status: 403 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Complete the appointment
      const updatedApt = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'COMPLETED',
          notes: notes || '',
        },
      });

      // 2. Add Prescription PDF to patient Health Passport
      if (prescriptionName && prescriptionName.trim()) {
        await tx.document.create({
          data: {
            patientId: appointment.patientId,
            doctorId: doctor.id,
            name: `${prescriptionName.replace('.pdf', '')}.pdf`,
            type: 'PRESCRIPTION',
            url: '#',
          },
        });
      }

      // 3. Log Audit
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'APPOINTMENT_COMPLETED',
          details: `Doctor ${doctor.id} completed appointment ${appointmentId} and created a prescription.`,
        },
      });

      return updatedApt;
    });

    return NextResponse.json({ success: true, appointment: result });
  } catch (error) {
    console.error('Complete visit API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
