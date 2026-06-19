import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 401 });
    }

    // 1. Fetch all doctors
    const doctors = await prisma.doctor.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        specialty: true,
        clinic: true,
      },
      orderBy: { user: { name: 'asc' } },
    });

    // 2. Fetch all patients
    const patients = await prisma.patient.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { user: { name: 'asc' } },
    });

    // 3. Fetch all appointments
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: { include: { user: { select: { name: true } } } },
        patient: { include: { user: { select: { name: true } } } },
        payment: true,
      },
      orderBy: { date: 'desc' },
    });

    // 4. Fetch audit logs
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      doctors,
      patients,
      appointments,
      auditLogs,
    });
  } catch (error) {
    console.error('Admin dashboard fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
