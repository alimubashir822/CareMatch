'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Monitor, 
  PhoneOff, 
  Send, 
  FileText, 
  ShieldAlert, 
  User, 
  Sparkles,
  Award,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface TelemedicineRoomClientProps {
  appointment: any;
}

interface RoomMessage {
  id: string;
  senderName: string;
  content: string;
  isSystem?: boolean;
}

export default function TelemedicineRoomClient({ appointment }: TelemedicineRoomClientProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Call Control states
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'video' | 'chat'>('video');

  // Chat states
  const [messages, setMessages] = useState<RoomMessage[]>([
    { id: 'sys1', senderName: 'CareMatch Safe', content: 'Connection established. Audio/video feeds are fully encrypted end-to-end.', isSystem: true },
    { id: 'sys2', senderName: 'Patient Symptom Log', content: `Reason for consultation: "${appointment.notes || 'Routine general checkup.'}"`, isSystem: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Prescription states (Doctor only)
  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [prescriptionShared, setPrescriptionShared] = useState(false);

  // Determine participant roles
  const isDoctor = user?.role === 'DOCTOR';
  const remoteParticipantName = isDoctor ? appointment.patient.user.name : appointment.doctor.user.name;
  const remoteParticipantRole = isDoctor ? 'Patient' : 'Healthcare Provider';
  const remoteParticipantImage = isDoctor ? appointment.patient.user.image : appointment.doctor.user.image;

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        senderName: user?.name || 'User',
        content: chatInput,
      }
    ]);
    setChatInput('');
  };

  const handleSharePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescriptionInput.trim()) return;

    const name = prescriptionInput;
    setPrescriptionInput('');

    try {
      // Save the prescription to patient documents
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${name.replace('.pdf', '')}.pdf`,
          type: 'PRESCRIPTION',
          // Associated with appointment patient
          url: '#',
        }),
      });

      if (res.ok) {
        setPrescriptionShared(true);
        // Post notice to chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            senderName: 'CareMatch Safe',
            content: `Doctor shared prescription: "${name.replace('.pdf', '')}.pdf". File registered to Patient's Health Passport.`,
            isSystem: true,
          }
        ]);
        setTimeout(() => setPrescriptionShared(false), 3000);
      }
    } catch (err) {
      console.error('Prescription sharing issue:', err);
    }
  };

  const handleHangUp = () => {
    setCallEnded(true);
  };

  if (callEnded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-4">
        <div className="inline-flex p-4 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20">
          <PhoneOff size={36} />
        </div>
        <h2 className="text-xl font-extrabold text-white">Consultation Concluded</h2>
        <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
          Your telemedicine connection has been terminated. You can safely return to your platform dashboard portal.
        </p>
        <button
          onClick={() => router.push(`/dashboard/${user?.role.toLowerCase()}`)}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-lg cursor-pointer"
        >
          Return to Portal Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden h-[calc(100dvh-4rem)] lg:h-[calc(100vh-4rem)]">
      
      {/* Mobile view tab bar switcher */}
      <div className="flex lg:hidden bg-slate-900 border-b border-slate-800 shrink-0">
        <button
          onClick={() => setActiveMobileTab('video')}
          className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeMobileTab === 'video'
              ? 'border-teal-500 text-teal-400 bg-slate-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Video Feed
        </button>
        <button
          onClick={() => setActiveMobileTab('chat')}
          className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeMobileTab === 'chat'
              ? 'border-teal-500 text-teal-400 bg-slate-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Chat Room {messages.length > 2 && (
            <span className="ml-1 px-1.5 py-0.5 bg-teal-600 text-white text-[9px] rounded-full">
              {messages.length - 2}
            </span>
          )}
        </button>
      </div>

      {/* Left: Video Feeds area */}
      <div className={`lg:col-span-8 flex flex-col bg-slate-950 p-4 relative justify-between flex-1 ${
        activeMobileTab === 'video' ? 'flex' : 'hidden lg:flex'
      }`}>
        
        {/* Connection status banner */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl text-[10px] font-bold text-teal-400">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span>CONNECTED • SECURE CALL</span>
        </div>

        {/* Video stream viewport */}
        <div className="flex-1 grid gap-4 items-center justify-center relative w-full h-full max-h-[70vh] lg:max-h-[80vh] min-h-[250px] lg:min-h-[400px]">
          
          {/* Main Feed: Remote participant */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full h-full relative overflow-hidden flex items-center justify-center group shadow-xl">
            {videoActive ? (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-500">
                {/* Simulated live video */}
                <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center animate-pulse mb-3">
                  <VideoIcon size={24} />
                </div>
                
                {remoteParticipantImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={remoteParticipantImage}
                    alt={remoteParticipantName}
                    className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-102 transition duration-500"
                  />
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Simulating Live Feed</span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <VideoOff size={32} className="text-slate-700 animate-pulse" />
                <span className="text-xs font-bold mt-2">Remote Video Muted</span>
              </div>
            )}
            
            {/* Remote Info overlay */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-xl text-[10px] font-bold text-white border border-slate-800">
              {remoteParticipantName} ({remoteParticipantRole})
            </div>
          </div>

          {/* Picture in picture feed: Local participant self-preview */}
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-24 h-32 md:w-32 md:h-44 bg-slate-800 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl z-20">
            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <User size={24} className="text-slate-600" />
              )}
            </div>
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-slate-900/80 rounded-md text-[8px] font-bold text-white uppercase tracking-wider">
              Self
            </div>
          </div>

        </div>

        {/* Controls dock bar */}
        <div className="h-20 flex items-center justify-center gap-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 max-w-lg mx-auto w-full backdrop-blur-md">
          <button
            onClick={() => setMicActive(!micActive)}
            className={`p-3 rounded-xl transition cursor-pointer ${
              micActive 
                ? 'bg-slate-800 hover:bg-slate-700 text-teal-400' 
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
            title={micActive ? 'Mute Mic' : 'Unmute Mic'}
          >
            {micActive ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          
          <button
            onClick={() => setVideoActive(!videoActive)}
            className={`p-3 rounded-xl transition cursor-pointer ${
              videoActive 
                ? 'bg-slate-800 hover:bg-slate-700 text-teal-400' 
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
            title={videoActive ? 'Stop Camera' : 'Start Camera'}
          >
            {videoActive ? <VideoIcon size={18} /> : <VideoOff size={18} />}
          </button>

          <button
            onClick={() => setScreenShareActive(!screenShareActive)}
            className={`p-3 rounded-xl transition cursor-pointer ${
              screenShareActive 
                ? 'bg-teal-600 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
            }`}
            title={screenShareActive ? 'Stop Sharing' : 'Share Screen'}
          >
            <Monitor size={18} />
          </button>

          <button
            onClick={handleHangUp}
            className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-600/10 cursor-pointer"
            title="Terminate Call"
          >
            <PhoneOff size={18} />
          </button>
        </div>

      </div>

      {/* Right: Side Consultation controls & Chat log */}
      <div className={`lg:col-span-4 border-l border-slate-800 bg-slate-900 flex flex-col justify-between h-full ${
        activeMobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
      }`}>
        
        {/* Prescription Generation module (Doctor only) */}
        {isDoctor && (
          <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/20">
            <h4 className="font-extrabold text-[10px] text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} /> In-Session Prescription Dispatch
            </h4>
            
            {prescriptionShared && (
              <p className="text-[10px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 p-2 rounded-xl">
                Prescription Shared! Added to Patient Health Passport.
              </p>
            )}

            <form onSubmit={handleSharePrescription} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. Amoxicillin 500mg, BID x 7 days"
                value={prescriptionInput}
                onChange={(e) => setPrescriptionInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
              >
                Share
              </button>
            </form>
          </div>
        )}

        {/* Consultation Chat Feed */}
        <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider p-4 border-b border-slate-800">Room Messages</span>
          
          <div className="flex-grow p-4 overflow-y-auto space-y-4 h-[300px]">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.isSystem ? 'items-center' : msg.senderName === user?.name ? 'items-end' : 'items-start'}`}
              >
                {msg.isSystem ? (
                  <div className="text-[10px] text-teal-400 bg-teal-950/20 border border-teal-900/30 px-3 py-1.5 rounded-xl text-center max-w-[90%] font-medium">
                    {msg.content}
                  </div>
                ) : (
                  <div className="space-y-1 max-w-[85%]">
                    <span className="block text-[9px] text-slate-500 font-bold px-1">{msg.senderName}</span>
                    <div className={`p-2.5 rounded-2xl text-xs ${
                      msg.senderName === user?.name 
                        ? 'bg-teal-600 text-white rounded-tr-none' 
                        : 'bg-slate-850 text-slate-200 border border-slate-800 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2 bg-slate-950/30">
            <input
              type="text"
              placeholder="Send message inside session..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <Send size={13} />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
