import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized. Patients only.' }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found.' }, { status: 404 });
    }

    // 1. Fetch appointments
    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: {
            user: { select: { name: true, image: true, email: true } },
            specialty: true,
          },
        },
        payment: true,
        review: true,
      },
      orderBy: { date: 'asc' },
    });

    // 2. Fetch documents (Healthcare Passport)
    const documents = await prisma.document.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    // 3. Fetch payments
    const payments = await prisma.payment.findMany({
      where: {
        appointment: {
          patientId: patient.id,
        },
      },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Fetch waitlists
    const waitlists = await prisma.waitlist.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: {
            user: { select: { name: true, image: true } },
            specialty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 5. Fetch doctors the patient can message (doctors they have booked with)
    const bookedDoctors = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      select: {
        doctor: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            specialty: true,
          },
        },
      },
      distinct: ['doctorId'],
    });

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      patient,
      appointments,
      documents,
      payments,
      waitlists,
      chatContacts: bookedDoctors.map((d) => d.doctor),
      messages,
    });
  } catch (error) {
    console.error('Patient dashboard fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
