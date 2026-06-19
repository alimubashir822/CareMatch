import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const specialties = await prisma.specialty.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ specialties });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json({ specialties: [] }, { status: 500 });
  }
}
