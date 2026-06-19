'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { 
  Calendar, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  Clock, 
  Upload, 
  Plus, 
  Video, 
  Building, 
  X, 
  AlertCircle,
  Star,
  Send,
  Loader2,
  Users2,
  Heart,
  TrendingUp,
  Activity,
  History,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
  const { user } = useAuth();
  
  // Dashboard states
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'passport' | 'payments' | 'chat' | 'waitlist' | 'family'>('appointments');

  // Modal / Form states
  const [rescheduleAptId, setRescheduleAptId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('10:00 AM');
  
  const [reviewAptId, setReviewAptId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('LAB_REPORT');

  const [activeChatContact, setActiveChatContact] = useState<any>(null);
  const [chatInputValue, setChatInputValue] = useState('');

  // Family members list
  const [familyMembers, setFamilyMembers] = useState<any[]>([
    { id: 'f1', name: 'Henry Connor', relation: 'Father', dob: '1961-10-12', insurance: 'Aetna', policy: 'AET-9901' },
    { id: 'f2', name: 'Tommy Connor', relation: 'Child', dob: '2018-03-04', insurance: 'Blue Cross', policy: 'BCBS-1102' }
  ]);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');
  const [newFamilyDob, setNewFamilyDob] = useState('1992-04-10');
  const [newFamilyIns, setNewFamilyIns] = useState('Aetna');
  const [newFamilyPolicy, setNewFamilyPolicy] = useState('');

  // AI follow up checker state
  const [followUpResponse, setFollowUpResponse] = useState<string | null>(null);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/patient/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
        if (data.chatContacts && data.chatContacts.length > 0 && !activeChatContact) {
          setActiveChatContact(data.chatContacts[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await fetch(`/api/bookings/${rescheduleAptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: rescheduleDate, timeSlot: rescheduleSlot }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRescheduleAptId(null);
        fetchDashboardData();
      } else {
        setFormError(data.error || 'Failed to reschedule.');
      }
    } catch (err) {
      setFormError('Connection issue.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: reviewAptId, rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviewAptId(null);
        setReviewComment('');
        fetchDashboardData();
      } else {
        setFormError(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      setFormError('Connection issue.');
    }
  };

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!docName.trim()) {
      setFormError('Please enter a document name.');
      return;
    }
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: docName, type: docType }),
      });
      if (res.ok) {
        setDocName('');
        setFormSuccess('Document added to Health Passport.');
        fetchDashboardData();
        setTimeout(() => setFormSuccess(''), 3000);
      }
    } catch (err) {
      setFormError('Connection issue.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputValue.trim() || !activeChatContact) return;

    const content = chatInputValue;
    setChatInputValue('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: activeChatContact.user.id, content }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    const newMember = {
      id: 'f' + (familyMembers.length + 1),
      name: newFamilyName,
      relation: newFamilyRelation,
      dob: newFamilyDob,
      insurance: newFamilyIns,
      policy: newFamilyPolicy || 'Pending Verification'
    };

    setFamilyMembers((prev) => [...prev, newMember]);
    setNewFamilyName('');
    setNewFamilyPolicy('');
    setFormSuccess('Family profile added successfully!');
    setTimeout(() => setFormSuccess(''), 3500);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Safe Appointment Notes Parser
  const parseNotes = (notesStr: string) => {
    try {
      const data = JSON.parse(notesStr);
      if (data && (data.patientBrief || data.familyMember)) {
        return {
          isJson: true,
          patientBrief: data.patientBrief,
          familyMember: data.familyMember || 'Myself',
        };
      }
    } catch (e) {
      // Return standard string in fallback structure
    }
    return {
      isJson: false,
      patientBrief: { concern: notesStr, duration: 'Not logged', questions: [], history: '' },
      familyMember: 'Myself',
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      </div>
    );
  }

  const { appointments = [], documents = [], payments = [], waitlists = [], chatContacts = [], messages = [] } = dashboardData || {};

  const upcomingApts = appointments.filter((apt: any) => apt.status === 'CONFIRMED' || apt.status === 'PENDING');
  const pastApts = appointments.filter((apt: any) => apt.status === 'COMPLETED' || apt.status === 'CANCELLED');

  const chatMessages = messages.filter((msg: any) => 
    activeChatContact && (
      (msg.senderId === user?.id && msg.receiverId === activeChatContact.user.id) ||
      (msg.senderId === activeChatContact.user.id && msg.receiverId === user?.id)
    )
  );

  // Group items chronologically for Passport timeline view
  const passportTimeline = [
    ...appointments.map((apt: any) => ({
      type: 'APPOINTMENT',
      date: new Date(apt.date),
      title: `Visit with ${apt.doctor.user.name}`,
      desc: `${apt.serviceName} • Status: ${apt.status}`,
      badge: apt.status,
      link: apt.videoRoomId ? `/telemedicine/${apt.videoRoomId}` : null,
    })),
    ...documents.map((doc: any) => ({
      type: 'DOCUMENT',
      date: new Date(doc.uploadedAt),
      title: doc.name,
      desc: `Category: ${doc.type} • Shared file.`,
      badge: 'HEALTH PASSPORT',
      link: doc.url,
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile overview pane (Left) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm text-center">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-teal-500/10"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xl mx-auto">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white mt-4">{user?.name}</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-md tracking-wider uppercase mt-1 inline-block">
              Primary Account Holder
            </span>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6 text-left text-xs space-y-3">
              <div>
                <span className="text-slate-400 font-bold block">Insurance Provider</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{dashboardData?.patient?.insuranceProvider || 'None'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Policy ID</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{dashboardData?.patient?.insurancePolicyNum || 'None'}</span>
              </div>
            </div>
          </div>

          {/* AI Health Companion Widget */}
          <div className="bg-gradient-to-br from-teal-900 to-indigo-950 text-white border border-teal-500/20 rounded-3xl p-5 shadow-lg space-y-4">
            <h4 className="font-extrabold text-xs text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-teal-400" />
              AI Health Companion
            </h4>

            {/* Checkup alert */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">Recommended Care</span>
              <p className="text-[11px] leading-normal text-slate-200">
                Your annual checkup is due! We recommend scheduling a cardiology screening assessment.
              </p>
              <Link
                href="/find-doctors?specialty=Cardiology"
                className="text-[9px] font-extrabold text-teal-400 hover:text-teal-300 mt-1 flex items-center gap-1"
              >
                Find Cardiologists <ChevronRight size={10} />
              </Link>
            </div>

            {/* Post consult check-in */}
            <div className="space-y-2 border-t border-white/5 pt-3">
              <span className="text-[9px] font-bold text-teal-300 uppercase tracking-wider block">Visit Check-In</span>
              {followUpResponse ? (
                <div className="bg-white/5 p-2 rounded-lg text-[10px] text-teal-200 font-semibold">
                  {followUpResponse}
                </div>
              ) : (
                <div className="space-y-2 text-[10px] text-slate-300">
                  <p>How is your recovery progressing since your June 10 Dermatitis consult with Dr. Ahmed?</p>
                  <div className="grid grid-cols-2 gap-1">
                    <button 
                      onClick={() => setFollowUpResponse('Excellent! We will log this in your Health timeline.')}
                      className="py-1 px-1 bg-white/10 hover:bg-white/20 rounded font-bold cursor-pointer text-center"
                    >
                      Fully Recovered
                    </button>
                    <button 
                      onClick={() => setFollowUpResponse('Alert sent. Click above to book a quick follow-up visit.')}
                      className="py-1 px-1 bg-teal-500/35 hover:bg-teal-500/50 rounded font-bold cursor-pointer text-center text-white"
                    >
                      Need Follow-up
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Panels */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* Tabs bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
            {[
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'passport', label: 'Health Timeline', icon: FileText },
              { id: 'family', label: 'Family Profiles', icon: Users2 },
              { id: 'payments', label: 'Billing Ledger', icon: CreditCard },
              { id: 'chat', label: 'Provider Inbox', icon: MessageSquare },
              { id: 'waitlist', label: 'Waitlists', icon: Clock }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-4 flex items-center gap-2 text-xs font-bold shrink-0 transition border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <IconComp size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Appointments */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              
              {/* Section 1: Upcoming Appointments */}
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Upcoming Care Visits</h3>
                {upcomingApts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 text-center text-xs text-slate-400">
                    No upcoming appointments scheduled. <Link href="/find-doctors" className="text-teal-600 font-bold hover:underline">Find a Doctor</Link>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {upcomingApts.map((apt: any) => {
                      const noteMeta = parseNotes(apt.notes);
                      return (
                        <div 
                          key={apt.id} 
                          className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4"
                        >
                          {/* Stepper Care Journey tracker */}
                          <div className="grid grid-cols-4 gap-1.5 pb-4 border-b border-slate-100 dark:border-slate-850">
                            {[
                              { label: 'Booking Intake', active: true },
                              { label: 'Confirmed', active: apt.status === 'CONFIRMED' },
                              { label: 'Virtual Consult', active: false },
                              { label: 'Prescription/Care', active: false }
                            ].map((step, index) => (
                              <div key={index} className="flex flex-col gap-1 items-center relative text-center">
                                <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                  step.active 
                                    ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}>
                                  {step.active ? '✓' : index + 1}
                                </div>
                                <span className={`text-[8px] font-bold uppercase tracking-wider block ${step.active ? 'text-teal-600 dark:text-teal-400' : 'text-slate-450'}`}>{step.label}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex gap-4 items-center self-start">
                              <img
                                src={apt.doctor.user.image}
                                alt={apt.doctor.user.name}
                                className="w-12 h-12 rounded-full object-cover shrink-0"
                              />
                              <div className="space-y-1">
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                                  {apt.doctor.user.name}
                                  
                                  {/* Family member recipient badge */}
                                  {noteMeta.familyMember !== 'Myself' && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                                      For: {noteMeta.familyMember}
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[10px] text-teal-600 font-bold">{apt.doctor.specialty.name} • {apt.serviceName}</p>
                                <p className="text-[10px] text-slate-400">{formatDate(apt.date)} @ {apt.timeSlot}</p>
                                
                                {noteMeta.isJson && noteMeta.patientBrief && (
                                  <div className="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 mt-1">
                                    <span className="font-bold block text-slate-400">AI Intake concern:</span>
                                    <p className="mt-0.5">&quot;{noteMeta.patientBrief.concern}&quot; ({noteMeta.patientBrief.duration})</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
                              {apt.videoRoomId && (
                                <Link
                                  href={`/telemedicine/${apt.videoRoomId}`}
                                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 shadow-md shadow-teal-600/10 cursor-pointer"
                                >
                                  <Video size={12} />
                                  Enter Telehealth Room
                                </Link>
                              )}
                              <button
                                onClick={() => {
                                  setRescheduleAptId(apt.id);
                                  setRescheduleDate(apt.date.split('T')[0]);
                                }}
                                className="px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[10px] cursor-pointer"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                className="px-3 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-xl text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Past Visits */}
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Past Visit History</h3>
                {pastApts.length === 0 ? (
                  <p className="text-xs text-slate-400">No medical histories recorded.</p>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
                    {pastApts.map((apt: any) => {
                      const noteMeta = parseNotes(apt.notes);
                      return (
                        <div key={apt.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                              {apt.doctor.user.name}
                              {noteMeta.familyMember !== 'Myself' && (
                                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-[8px] font-bold text-indigo-650 dark:text-indigo-400">
                                  Recipient: {noteMeta.familyMember}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">{apt.serviceName} • {formatDate(apt.date)}</div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
                            {apt.status === 'CANCELLED' ? (
                              <span className="text-[10px] font-bold px-2 py-1 bg-rose-500/10 text-rose-600 rounded-lg">CANCELLED</span>
                            ) : (
                              <>
                                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg">COMPLETED</span>
                                {!apt.review ? (
                                  <button
                                    onClick={() => setReviewAptId(apt.id)}
                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                                  >
                                    Leave Review
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                                    ★ {apt.review.rating} Reviewed
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 2: Health Timeline (Health Passport) */}
          {activeTab === 'passport' && (
            <div className="grid md:grid-cols-12 gap-8">
              
              {/* Timeline feed */}
              <div className="md:col-span-8 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <History size={16} />
                  Health Timeline Ledger
                </h3>
                
                {passportTimeline.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 text-center text-xs text-slate-400">
                    No timeline items recorded yet.
                  </div>
                ) : (
                  <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-3 space-y-6">
                    {passportTimeline.map((item: any, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot marker */}
                        <div className={`absolute -left-6 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                          item.type === 'DOCUMENT' ? 'bg-teal-500' : 'bg-indigo-500'
                        }`} />

                        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-1">
                          <span className="text-[9px] font-bold text-slate-405 block">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                            {item.title}
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {item.badge}
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{item.desc}</p>
                          
                          {item.link && (
                            <a
                              href={item.link}
                              className="text-[9px] font-bold text-teal-650 dark:text-teal-450 hover:underline block pt-1.5"
                            >
                              Download / Inspect Document Link
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Document form */}
              <div className="md:col-span-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload size={14} /> Add scan/report
                  </h4>
                  
                  {formSuccess && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl">{formSuccess}</p>}
                  
                  <form onSubmit={handleDocumentUpload} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">File Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Scanned_Chest_XRay.pdf"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Document Category</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="LAB_REPORT">Lab Report</option>
                        <option value="PRESCRIPTION">Prescription</option>
                        <option value="OTHER">Scan / Other</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                    >
                      Register File
                    </button>
                  </form>
                </div>
              </div>

            </div>
          )}

          {/* Tab 3: Family Profiles */}
          {activeTab === 'family' && (
            <div className="grid md:grid-cols-12 gap-8">
              
              {/* Family members grid */}
              <div className="md:col-span-8 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Family Profiles Registry</h3>
                
                <div className="grid gap-3">
                  {/* Primary Profile */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-center relative">
                    <span className="absolute top-4 right-4 px-2 py-0.5 bg-teal-500/10 text-teal-600 font-bold text-[8px] rounded">PRIMARY</span>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-400">SC</div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{user?.name}</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">Insurance Provider: {dashboardData?.patient?.insuranceProvider || 'None'}</p>
                      <p className="text-[10px] text-slate-455">Policy number: {dashboardData?.patient?.insurancePolicyNum || 'None'}</p>
                    </div>
                  </div>

                  {/* Seeded family */}
                  {familyMembers.map((member) => (
                    <div key={member.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-center relative">
                      <span className="absolute top-4 right-4 px-2 py-0.5 bg-indigo-500/10 text-indigo-650 font-bold text-[8px] rounded">{member.relation}</span>
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-550 dark:text-indigo-400 flex items-center justify-center font-extrabold text-sm uppercase">
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{member.name}</h4>
                        <p className="text-[10px] text-slate-450 mt-0.5">DOB: {member.dob} • Insurance: {member.insurance}</p>
                        <p className="text-[10px] text-slate-455">Policy number: {member.policy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Family form */}
              <div className="md:col-span-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Add Family Profile</h4>
                  
                  {formSuccess && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl">{formSuccess}</p>}
                  
                  <form onSubmit={handleAddFamily} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Member Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nora Connor"
                        value={newFamilyName}
                        onChange={(e) => setNewFamilyName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Relation</label>
                        <select
                          value={newFamilyRelation}
                          onChange={(e) => setNewFamilyRelation(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">DOB</label>
                        <input
                          type="date"
                          required
                          value={newFamilyDob}
                          onChange={(e) => setNewFamilyDob(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Insurance</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aetna"
                          value={newFamilyIns}
                          onChange={(e) => setNewFamilyIns(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Policy ID</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. POL-1200"
                          value={newFamilyPolicy}
                          onChange={(e) => setNewFamilyPolicy(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                    >
                      Register Member
                    </button>
                  </form>
                </div>
              </div>

            </div>
          )}

          {/* Tab 4: Payments */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Billing History & Invoices</h3>
              
              {payments.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 text-center text-xs text-slate-400">
                  No payment transactions found.
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 font-bold text-slate-400">
                          <th className="p-4">Transaction ID</th>
                          <th className="p-4">Provider</th>
                          <th className="p-4">Charge Date</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {payments.map((pay: any) => (
                          <tr key={pay.id} className="text-slate-650 dark:text-slate-350">
                            <td className="p-4 font-mono font-bold text-[10px]">{pay.transactionId}</td>
                            <td className="p-4 font-medium">{pay.appointment.doctor.user.name}</td>
                            <td className="p-4">{new Date(pay.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 font-bold text-teal-600">${pay.amount}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full font-bold text-[9px] uppercase tracking-wider">
                                {pay.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Provider Inbox */}
          {activeTab === 'chat' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl h-[550px] shadow-sm grid grid-cols-12 overflow-hidden">
              
              {/* Contacts */}
              <div className={`col-span-12 md:col-span-4 border-r border-slate-150 dark:border-slate-800 h-full overflow-y-auto bg-slate-50/20 ${activeChatContact ? 'hidden md:block' : 'block'}`}>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider p-4 border-b border-slate-100 dark:border-slate-850">My Providers</span>
                {chatContacts.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center p-4">Book with a doctor to open chat.</p>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-850">
                    {chatContacts.map((contact: any) => {
                      const isSelected = activeChatContact?.id === contact.id;
                      return (
                        <button
                          key={contact.id}
                          onClick={() => setActiveChatContact(contact)}
                          className={`w-full p-4 flex gap-3 text-left items-center cursor-pointer transition ${
                            isSelected ? 'bg-teal-500/5 dark:bg-teal-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-950'
                          }`}
                        >
                          <img
                            src={contact.user.image}
                            alt={contact.user.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-800 dark:text-white truncate">{contact.user.name}</div>
                            <span className="text-[9px] text-slate-400 truncate block">{contact.specialty.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Message thread */}
              <div className={`col-span-12 md:col-span-8 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/25 ${activeChatContact ? 'flex' : 'hidden md:flex'}`}>
                {activeChatContact ? (
                  <>
                    <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex gap-3 items-center">
                      <button
                        onClick={() => setActiveChatContact(null)}
                        className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg shrink-0"
                        title="Back to Inbox"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <img
                        src={activeChatContact.user.image}
                        alt={activeChatContact.user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{activeChatContact.user.name}</div>
                        <span className="text-[9px] text-slate-400 block">{activeChatContact.specialty.name} • Direct Inbox</span>
                      </div>
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                      {chatMessages.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-center py-8">Start the conversation by sending a message below.</p>
                      ) : (
                        chatMessages.map((msg: any) => {
                          const isMe = msg.senderId === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`p-3 rounded-2xl max-w-[85%] text-xs ${
                                  isMe
                                    ? 'bg-teal-600 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none'
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type message to doctor..."
                        value={chatInputValue}
                        onChange={(e) => setChatInputValue(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!chatInputValue.trim()}
                        className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md transition disabled:opacity-50 shrink-0 cursor-pointer"
                      >
                        <Send size={13} />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-xs text-slate-400">
                    Select a provider from the sidebar list to view chat.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 6: Waitlist */}
          {activeTab === 'waitlist' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Provider Waiting Lists</h3>
              
              {waitlists.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 text-center text-xs text-slate-400">
                  You are not currently on any provider waitlists.
                </div>
              ) : (
                <div className="grid gap-3">
                  {waitlists.map((entry: any) => (
                    <div key={entry.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                      <div className="flex gap-4 items-center min-w-0">
                        <img
                          src={entry.doctor.user.image}
                          alt={entry.doctor.user.name}
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{entry.doctor.user.name}</h4>
                          <span className="text-[9px] text-teal-600 font-bold block">{entry.doctor.specialty.name}</span>
                          <span className="text-[9px] text-slate-400 mt-1 block">Preferred Day: {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][entry.preferredDay]}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        {entry.status === 'WAITING' ? (
                          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-full font-bold text-[10px] tracking-wider flex items-center gap-1">
                            <Clock size={11} /> WAITING
                          </span>
                        ) : entry.status === 'NOTIFIED' ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 rounded-full font-bold text-[10px] tracking-wider animate-pulse flex items-center gap-1">
                              SLOT OPENED ✓
                            </span>
                            <Link
                              href={`/doctor/${entry.doctorId}#booking`}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[10px]"
                            >
                              Claim Slot
                            </Link>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-500/10 text-slate-500 rounded-full font-bold text-[10px] tracking-wider">
                            {entry.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </section>

      </main>

      {/* Reschedule Modal */}
      {rescheduleAptId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setRescheduleAptId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Reschedule Appointment</h4>
            
            {formError && <p className="text-xs text-rose-500 bg-rose-50 p-2 rounded-lg mb-3">{formError}</p>}
            
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Time Slot</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none cursor-pointer"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Confirm Reschedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewAptId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setReviewAptId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Patient Review Feedback</h4>
            
            {formError && <p className="text-xs text-rose-500 bg-rose-50 p-2 rounded-lg mb-3">{formError}</p>}
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rating Score</label>
                <div className="flex gap-1.5 justify-center">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      className="p-1 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${num <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 dark:text-slate-850'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="reviewText" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Comments</label>
                <textarea
                  id="reviewText"
                  required
                  rows={3}
                  placeholder="Describe your care experience, doctor's bedside manner, and diagnosis explanations..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
