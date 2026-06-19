import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
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

    const { doctorId, preferredDay } = await req.json();

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is required.' }, { status: 400 });
    }

    // Check if patient is already on the waitlist for this doctor
    const existing = await prisma.waitlist.findFirst({
      where: {
        patientId: patient.id,
        doctorId,
        status: 'WAITING',
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'You are already on the waitlist for this doctor.' }, { status: 409 });
    }

    const entry = await prisma.waitlist.create({
      data: {
        patientId: patient.id,
        doctorId,
        preferredDay: Number(preferredDay) || 1, // Default Monday
        status: 'WAITING',
      },
    });

    return NextResponse.json({
      success: true,
      waitlist: entry,
    });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: user.id },
      });
      if (!patient) return NextResponse.json({ waitlist: [] });

      const entries = await prisma.waitlist.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: {
            include: {
              user: {
                select: { name: true, image: true },
              },
              specialty: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ waitlist: entries });
    }

    if (user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });
      if (!doctor) return NextResponse.json({ waitlist: [] });

      const entries = await prisma.waitlist.findMany({
        where: { doctorId: doctor.id },
        include: {
          patient: {
            include: {
              user: {
                select: { name: true, email: true, image: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({ waitlist: entries });
    }

    return NextResponse.json({ waitlist: [] });
  } catch (error) {
    console.error('Fetch waitlist error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
