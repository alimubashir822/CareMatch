import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized. Doctors only.' }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
      include: { specialty: true, clinic: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found.' }, { status: 404 });
    }

    // 1. Fetch appointments
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          include: {
            user: { select: { name: true, image: true, email: true } },
          },
        },
        payment: true,
      },
      orderBy: { date: 'asc' },
    });

    // 2. Fetch unique patient list
    const patients = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      select: {
        patient: {
          include: {
            user: { select: { name: true, email: true, image: true } },
            documents: true,
          },
        },
      },
      distinct: ['patientId'],
    });

    // 3. Fetch availability
    const availabilities = await prisma.availability.findMany({
      where: { doctorId: doctor.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    // 4. Fetch reviews
    const reviews = await prisma.review.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 5. Fetch doctor analytics (growth tools)
    const analytics = await prisma.analytics.findFirst({
      where: { doctorId: doctor.id },
      orderBy: { month: 'desc' },
    });

    // 6. Fetch subscription status
    const subscription = await prisma.subscription.findFirst({
      where: { doctorId: doctor.id },
      orderBy: { createdAt: 'desc' },
    });

    // 7. Messages
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
      doctor,
      appointments,
      patients: patients.map((p) => p.patient),
      availabilities,
      reviews,
      analytics: analytics || { profileViews: 0, bookingsCount: 0, conversions: 0.0 },
      subscription,
      messages,
    });
  } catch (error) {
    console.error('Doctor dashboard fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
