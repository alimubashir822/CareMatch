import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromSession();
    return NextResponse.json({ user });
  } catch (error) {
    console.error('API /auth/me error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
