import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const user = await getUserFromSession();

    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized. Doctors only.' }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const { reply } = await req.json();

    if (!reply || !reply.trim()) {
      return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.doctorId !== doctor.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this review.' }, { status: 403 });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { reply },
    });

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error) {
    console.error('Review reply submit API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
