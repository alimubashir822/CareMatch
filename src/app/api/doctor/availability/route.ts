import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized. Doctors only.' }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found.' }, { status: 404 });
    }

    const { dayOfWeek, slots } = await req.json();

    if (dayOfWeek === undefined || !slots) {
      return NextResponse.json({ error: 'Day and slots are required.' }, { status: 400 });
    }

    const dayNum = Number(dayOfWeek);

    // Upsert availability
    const existing = await prisma.availability.findFirst({
      where: { doctorId: doctor.id, dayOfWeek: dayNum },
    });

    let availability;
    if (existing) {
      availability = await prisma.availability.update({
        where: { id: existing.id },
        data: { slots },
      });
    } else {
      availability = await prisma.availability.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: dayNum,
          slots,
        },
      });
    }

    return NextResponse.json({ success: true, availability });
  } catch (error) {
    console.error('Availability update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
