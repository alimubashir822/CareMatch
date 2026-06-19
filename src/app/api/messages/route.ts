import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, content } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Receiver ID and content are required' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
