import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doctorId, isApproved } = await req.json();

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
    }

    const updatedDoctor = await prisma.$transaction(async (tx) => {
      const doc = await tx.doctor.update({
        where: { id: doctorId },
        data: { isApproved: !!isApproved },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: isApproved ? 'DOCTOR_APPROVED' : 'DOCTOR_SUSPENDED',
          details: `Admin ${user.name} ${isApproved ? 'approved' : 'suspended'} doctor profile for ${doctor.user.name}`,
        },
      });

      return doc;
    });

    return NextResponse.json({ success: true, doctor: updatedDoctor });
  } catch (error) {
    console.error('Approve doctor API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
