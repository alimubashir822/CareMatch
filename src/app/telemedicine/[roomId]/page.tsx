import React from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import prisma from '@/lib/db';
import TelemedicineRoomClient from '@/components/TelemedicineRoomClient';

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function TelemedicineRoomPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { roomId } = resolvedParams;

  // Find the appointment using videoRoomId
  const appointment = await prisma.appointment.findFirst({
    where: { videoRoomId: roomId },
    include: {
      patient: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      doctor: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          specialty: true,
        },
      },
    },
  });

  if (!appointment) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-400 font-extrabold text-sm">
            🩺 CareMatch Telemedicine Clinic
          </div>
          <div className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            PHI Encrypted • Session ID: {roomId.substring(0, 8).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <TelemedicineRoomClient appointment={appointment} />
      </main>
    </div>
  );
}
