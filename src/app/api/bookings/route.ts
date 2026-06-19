import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized. Patients only can book appointments.' }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found.' }, { status: 404 });
    }

    const { doctorId, serviceName, price, date, timeSlot, type, notes } = await req.json();

    if (!doctorId || !serviceName || !price || !date || !timeSlot) {
      return NextResponse.json({ error: 'Missing required booking fields.' }, { status: 400 });
    }

    const bookingDate = new Date(date);

    // 1. Check for double booking conflicts
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: bookingDate,
        timeSlot,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: 'This time slot has already been booked. Please choose another slot.' },
        { status: 409 }
      );
    }

    // 2. Create the appointment and payment record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId,
          date: bookingDate,
          timeSlot,
          status: 'CONFIRMED', // auto confirm for demo, normal might be PENDING
          type: type || 'VIDEO',
          serviceName,
          price: parseFloat(price),
          notes: notes || '',
          videoRoomId: type === 'VIDEO' ? crypto.randomUUID() : null,
        },
      });

      // Create Payment
      await tx.payment.create({
        data: {
          appointmentId: apt.id,
          amount: parseFloat(price),
          status: 'PAID',
          transactionId: `ch_mock_${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
          invoiceUrl: '#',
        },
      });

      // Write to audit logs
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'APPOINTMENT_BOOKED',
          details: `Patient ${patient.id} booked doctor ${doctorId} for ${date} at ${timeSlot}`,
        },
      });

      return apt;
    });

    return NextResponse.json({
      success: true,
      appointment: result,
    });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json({ error: 'An error occurred during booking. Please try again.' }, { status: 500 });
  }
}
