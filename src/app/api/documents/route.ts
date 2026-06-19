import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const { name, type, url } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 });
    }

    const doc = await prisma.document.create({
      data: {
        patientId: patient.id,
        name,
        type,
        url: url || '#',
      },
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
