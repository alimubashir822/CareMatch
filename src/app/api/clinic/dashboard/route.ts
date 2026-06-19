import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== 'CLINIC') {
      return NextResponse.json({ error: 'Unauthorized. Clinic admins only.' }, { status: 401 });
    }

    const clinic = await prisma.clinic.findUnique({
      where: { userId: user.id },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic profile not found.' }, { status: 404 });
    }

    // 1. Fetch doctors associated with this clinic
    const doctors = await prisma.doctor.findMany({
      where: { clinicId: clinic.id },
      include: {
        user: { select: { name: true, email: true, image: true } },
        specialty: true,
      },
    });

    const doctorIds = doctors.map((d) => d.id);

    // 2. Fetch appointments for these doctors
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: { in: doctorIds } },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
        payment: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      success: true,
      clinic,
      doctors,
      appointments,
    });
  } catch (error) {
    console.error('Clinic dashboard fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
