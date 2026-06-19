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

    const { appointmentId, rating, comment } = await req.json();

    if (!appointmentId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing review parameters' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.patientId !== patient.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this appointment.' }, { status: 403 });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        appointmentId,
        patientId: patient.id,
        doctorId: appointment.doctorId,
        rating: Number(rating),
        comment,
      },
    });

    // Recalculate average doctor rating
    const allReviews = await prisma.review.findMany({
      where: { doctorId: appointment.doctorId },
      select: { rating: true },
    });

    const averageRating = 
      allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;

    await prisma.doctor.update({
      where: { id: appointment.doctorId },
      data: { rating: parseFloat(averageRating.toFixed(2)) },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Review submit API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
