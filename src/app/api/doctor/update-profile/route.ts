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
      return NextResponse.json({ error: 'Doctor not found.' }, { status: 404 });
    }

    const { bio } = await req.json();

    if (!bio || !bio.trim()) {
      return NextResponse.json({ error: 'Bio is required.' }, { status: 400 });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctor.id },
      data: { bio },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DOCTOR_PROFILE_OPTIMIZED',
        details: `Doctor ${doctor.id} optimized their profile bio using the AI Coach.`,
      },
    });

    return NextResponse.json({ success: true, doctor: updatedDoctor });
  } catch (error) {
    console.error('Update doctor profile API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
