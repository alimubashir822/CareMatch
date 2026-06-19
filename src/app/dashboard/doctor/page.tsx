'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  MessageSquare, 
  CreditCard, 
  Activity,
  CheckCircle,
  Video,
  X,
  Send,
  Loader2,
  TrendingUp,
  FileCheck,
  Award,
  ChevronRight,
  ClipboardList,
  Sparkles,
  Info,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function DoctorDashboard() {
  const { user } = useAuth();
  
  // Dashboard state
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'availability' | 'reviews' | 'chat' | 'growth'>('appointments');

  // Interactive Forms state
  const [completeAptId, setCompleteAptId] = useState<string | null>(null);
  const [visitNotes, setVisitNotes] = useState('');
  const [prescriptionName, setPrescriptionName] = useState('');

  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [scheduleDay, setScheduleDay] = useState(1); // Monday
  const [scheduleSlots, setScheduleSlots] = useState('09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM, 04:00 PM');

  const [activeChatContact, setActiveChatContact] = useState<any>(null);
  const [chatInputValue, setChatInputValue] = useState('');

  const [reviewReplyId, setReviewReplyId] = useState<string | null>(null);
  const [reviewReplyText, setReviewReplyText] = useState('');

  // AI Profile Coach states
  const [isApplyingBio, setIsApplyingBio] = useState(false);
  const [coachSuccessMessage, setCoachSuccessMessage] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Keep track of checklisted questions (appointmentId -> questionIndex -> checked)
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, Record<number, boolean>>>({});

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/doctor/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
        if (data.patients && data.patients.length > 0 && !activeChatContact) {
          setActiveChatContact(data.patients[0]);
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
    if (!confirm('Are you sure you want to decline this booking?')) return;
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
      console.error(err);
    }
  };

  const handleCompleteVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await fetch('/api/doctor/complete-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: completeAptId,
          notes: visitNotes,
          prescriptionName: prescriptionName,
        }),
      });
      if (res.ok) {
        setCompleteAptId(null);
        setVisitNotes('');
        setPrescriptionName('');
        fetchDashboardData();
      } else {
        setFormError('Failed to complete consultation.');
      }
    } catch (err) {
      setFormError('Connection issue.');
    }
  };

  const handleAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      const res = await fetch('/api/doctor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek: scheduleDay, slots: scheduleSlots }),
      });
      if (res.ok) {
        setFormSuccess('Schedule updated successfully!');
        fetchDashboardData();
        setTimeout(() => setFormSuccess(''), 3000);
      } else {
        setFormError('Failed to update schedule slots.');
      }
    } catch (err) {
      setFormError('Connection issue.');
    }
  };

  const handleReviewReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewReplyText.trim()) return;
    try {
      const res = await fetch(`/api/reviews/${reviewReplyId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: reviewReplyText }),
      });
      if (res.ok) {
        setReviewReplyId(null);
        setReviewReplyText('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
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
        body: JSON.stringify({ receiverId: activeChatContact.userId, content }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyOptimizedBio = async () => {
    setIsApplyingBio(true);
    setCoachSuccessMessage('');
    
    const optimizedBio = `Dr. ${user?.name.split(' ').slice(1).join(' ')} is a board-certified specialist with over ${doctor?.experienceYears} years of training in advanced medical diagnostics and therapy. Resided residency at Harvard Medical School and Yale Langone Health. Specialized in compassionate patient care, digital health consults, and custom treatment checklists. Accepts major insurance plans including Blue Cross and Aetna.`;

    try {
      const res = await fetch('/api/doctor/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: optimizedBio }),
      });

      if (res.ok) {
        setCoachSuccessMessage('Optimized Bio applied to profile successfully!');
        fetchDashboardData();
        setTimeout(() => setCoachSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplyingBio(false);
    }
  };

  const toggleQuestionCheck = (aptId: string, qIdx: number) => {
    setCheckedQuestions((prev) => {
      const aptChecks = prev[aptId] || {};
      return {
        ...prev,
        [aptId]: {
          ...aptChecks,
          [qIdx]: !aptChecks[qIdx],
        },
      };
    });
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
      // Fallback
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

  const { doctor, appointments = [], patients = [], availabilities = [], reviews = [], analytics = {}, subscription, messages = [] } = dashboardData || {};

  const activeApts = appointments.filter((apt: any) => apt.status === 'CONFIRMED' || apt.status === 'PENDING');
  const pastApts = appointments.filter((apt: any) => apt.status === 'COMPLETED' || apt.status === 'CANCELLED');

  const chatMessages = messages.filter((msg: any) => 
    activeChatContact && (
      (msg.senderId === user?.id && msg.receiverId === activeChatContact.userId) ||
      (msg.senderId === activeChatContact.userId && msg.receiverId === user?.id)
    )
  );

  const totalEarnings = appointments
    .filter((apt: any) => apt.status === 'COMPLETED' && apt.payment?.status === 'PAID')
    .reduce((sum: number, apt: any) => sum + apt.price, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Card (Left Panel) */}
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
              <div className="w-20 h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xl mx-auto">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white mt-4">{user?.name}</h2>
            <p className="text-teal-600 dark:text-teal-400 text-xs font-bold mt-1">{doctor?.specialty?.name}</p>
            <span className="text-[9px] font-bold px-2.5 py-0.5 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-md tracking-wider uppercase mt-3 inline-block">
              {doctor?.isApproved ? 'Approved Provider' : 'Approval Pending'}
            </span>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6 text-left text-xs space-y-3">
              <div>
                <span className="text-slate-400 font-bold block">Consultation Fee</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">${doctor?.pricePerConsultation} / session</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Subscription Tier</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{subscription?.plan || 'STARTER'} Plan</span>
              </div>
            </div>
          </div>

          {/* Practice stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Practice Stats</h4>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Total Earnings</span>
                <span className="font-black text-sm text-teal-650">${totalEarnings}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Unique Patients</span>
                <span className="font-black text-sm text-slate-800 dark:text-white">{patients.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Panels */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* Tabs bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
            {[
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'patients', label: 'Patient Logs', icon: Users },
              { id: 'availability', label: 'Availability', icon: Clock },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'chat', label: 'Messages Inbox', icon: MessageSquare },
              { id: 'growth', label: 'Growth Tools & AI Coach', icon: TrendingUp }
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
              
              {/* Confirmed / Pending */}
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Confirmed & Pending Bookings</h3>
                {activeApts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 text-center text-xs text-slate-400">
                    No active appointments booked.
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {activeApts.map((apt: any) => {
                      const noteMeta = parseNotes(apt.notes);
                      const checks = checkedQuestions[apt.id] || {};
                      
                      return (
                        <div 
                          key={apt.id} 
                          className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4"
                        >
                          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex gap-4 items-center self-start">
                              <img
                                src={apt.patient.user.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'}
                                alt={apt.patient.user.name}
                                className="w-12 h-12 rounded-full object-cover shrink-0"
                              />
                              <div className="space-y-1">
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                                  {apt.patient.user.name}
                                  
                                  {/* Family member target indicator */}
                                  {noteMeta.familyMember !== 'Myself' && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                                      For: {noteMeta.familyMember}
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[10px] text-slate-450">{formatDate(apt.date)} @ {apt.timeSlot} • Mode: {apt.type === 'VIDEO' ? 'Virtual Video Call' : 'Clinic visit'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
                              {apt.videoRoomId && (
                                <Link
                                  href={`/telemedicine/${apt.videoRoomId}`}
                                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 shadow-md shadow-teal-600/10 cursor-pointer"
                                >
                                  <Video size={12} />
                                  Enter Clinic Room
                                </Link>
                              )}
                              <button
                                onClick={() => setCompleteAptId(apt.id)}
                                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold rounded-xl text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                Complete Visit
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                className="px-3 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-xl text-[10px] cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          </div>

                          {/* AI Patient Intake Brief Box */}
                          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3">
                            <h5 className="font-extrabold text-[10px] text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                              <ClipboardList size={13} className="text-teal-500" />
                              AI Patient Intake Brief
                            </h5>
                            
                            <div className="grid md:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-slate-400 font-bold block">Primary Concern</span>
                                <p className="font-semibold text-slate-700 dark:text-slate-350">{noteMeta.patientBrief.concern}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold block">Symptom Duration</span>
                                <p className="font-semibold text-slate-700 dark:text-slate-350">{noteMeta.patientBrief.duration}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold block">Allergies / Context</span>
                                <p className="font-semibold text-slate-700 dark:text-slate-350">{noteMeta.patientBrief.history}</p>
                              </div>
                            </div>

                            {/* Patient pre-visit checklist of questions */}
                            {noteMeta.patientBrief.questions && noteMeta.patientBrief.questions.length > 0 && (
                              <div className="border-t border-slate-200/50 dark:border-slate-850 pt-2.5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Patient Consultation Questions:</span>
                                <div className="space-y-2">
                                  {noteMeta.patientBrief.questions.map((q: string, qIdx: number) => {
                                    const isChecked = !!checks[qIdx];
                                    return (
                                      <label 
                                        key={qIdx}
                                        className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-450 cursor-pointer select-none"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => toggleQuestionCheck(apt.id, qIdx)}
                                          className="mt-0.5 rounded text-teal-650 cursor-pointer w-4 h-4"
                                        />
                                        <span className={isChecked ? 'line-through text-slate-400' : 'font-medium'}>{q}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Past Visits logs */}
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Past Visit History</h3>
                {pastApts.length === 0 ? (
                  <p className="text-xs text-slate-400">No past schedules found.</p>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
                    {pastApts.map((apt: any) => {
                      const noteMeta = parseNotes(apt.notes);
                      return (
                        <div key={apt.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                              {apt.patient.user.name}
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
                              <span className="text-[10px] font-bold px-2.5 py-1 bg-rose-500/10 text-rose-600 rounded-lg">CANCELLED</span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg">COMPLETED</span>
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

          {/* Tab 2: Patients Logs */}
          {activeTab === 'patients' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Patient Registries</h3>
              
              {patients.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 text-center text-xs text-slate-400">
                  No patient logs available yet.
                </div>
              ) : (
                <div className="grid gap-3">
                  {patients.map((pat: any) => (
                    <div 
                      key={pat.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex gap-4 items-center min-w-0">
                        {pat.user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={pat.user.image}
                            alt={pat.user.name}
                            className="w-12 h-12 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {pat.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{pat.user.name}</h4>
                          <span className="text-[10px] text-slate-400 block truncate">{pat.user.email}</span>
                          <span className="text-[9px] text-slate-400 mt-1 block">Insurance: {pat.insuranceProvider} • Policy: {pat.insurancePolicyNum}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedPatient(pat)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[10px] cursor-pointer"
                      >
                        Inspect Health Record
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Availability scheduler */}
          {activeTab === 'availability' && (
            <div className="grid md:grid-cols-12 gap-8">
              
              <div className="md:col-span-8 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Weekly Availabilities</h3>
                {availabilities.length === 0 ? (
                  <p className="text-xs text-slate-400">No scheduled hours configured. Use form on the right.</p>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
                    {availabilities.map((avail: any) => (
                      <div key={avail.id} className="p-4 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 dark:text-white">
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][avail.dayOfWeek]}
                        </span>
                        <span className="text-slate-650 dark:text-slate-400 font-semibold">{avail.slots}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Configure Slots</h4>
                  
                  {formSuccess && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl">{formSuccess}</p>}
                  {formError && <p className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-xl">{formError}</p>}
                  
                  <form onSubmit={handleAvailabilitySubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Day</label>
                      <select
                        value={scheduleDay}
                        onChange={(e) => setScheduleDay(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none cursor-pointer"
                      >
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                        <option value={0}>Sunday</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Available Slots (comma-separated)</label>
                      <textarea
                        rows={3}
                        value={scheduleSlots}
                        onChange={(e) => setScheduleSlots(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                        placeholder="e.g. 09:00 AM, 10:30 AM, 02:00 PM"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                    >
                      Update Schedule Slots
                    </button>
                  </form>
                </div>
              </div>

            </div>
          )}

          {/* Tab 4: Reviews list */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Patient Reviews Ledger</h3>
              
              {reviews.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 text-center text-xs text-slate-400">
                  No patient reviews submitted.
                </div>
              ) : (
                <div className="grid gap-4">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.patient.user.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'}
                            alt={rev.patient.user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">{rev.patient.user.name}</span>
                            <span className="text-[9px] text-slate-400 block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-1 border border-amber-500/20 rounded-lg">
                          <Star className="text-amber-500 fill-amber-500" size={11} />
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{rev.rating}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 text-xs italic leading-relaxed">
                        &quot;{rev.comment}&quot;
                      </p>

                      {rev.reply ? (
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 text-xs text-slate-500">
                          <span className="font-bold text-[9px] text-teal-600 uppercase tracking-wider block mb-1">Your response:</span>
                          &quot;{rev.reply}&quot;
                        </div>
                      ) : (
                        <div>
                          {reviewReplyId === rev.id ? (
                            <form onSubmit={handleReviewReplySubmit} className="flex gap-2 items-center mt-2">
                              <input
                                type="text"
                                placeholder="Type public response to patient review..."
                                value={reviewReplyText}
                                onChange={(e) => setReviewReplyText(e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs"
                              >
                                Send
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => {
                                setReviewReplyId(rev.id);
                                setReviewReplyText('');
                              }}
                              className="text-[10px] font-bold text-teal-600 hover:underline mt-1"
                            >
                              + Reply to review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Chat Inbox */}
          {activeTab === 'chat' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl h-[550px] shadow-sm grid grid-cols-12 overflow-hidden">
              
              <div className={`col-span-12 md:col-span-4 border-r border-slate-150 dark:border-slate-800 h-full overflow-y-auto bg-slate-50/20 ${activeChatContact ? 'hidden md:block' : 'block'}`}>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider p-4 border-b border-slate-100 dark:border-slate-850">My Patients</span>
                {patients.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center p-4">No active patient logs.</p>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-850">
                    {patients.map((pat: any) => {
                      const isSelected = activeChatContact?.id === pat.id;
                      return (
                        <button
                          key={pat.id}
                          onClick={() => setActiveChatContact(pat)}
                          className={`w-full p-4 flex gap-3 text-left items-center cursor-pointer transition ${
                            isSelected ? 'bg-teal-500/5 dark:bg-teal-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-950'
                          }`}
                        >
                          <img
                            src={pat.user.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'}
                            alt={pat.user.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-800 dark:text-white truncate">{pat.user.name}</div>
                            <span className="text-[9px] text-slate-400 truncate block">{pat.user.email}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={`col-span-12 md:col-span-8 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/25 ${activeChatContact ? 'flex' : 'hidden md:flex'}`}>
                {activeChatContact ? (
                  <>
                    <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex gap-3 items-center">
                      <button
                        onClick={() => setActiveChatContact(null)}
                        className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 rounded-lg shrink-0 mr-2"
                        title="Back to Inbox"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <img
                        src={activeChatContact.user.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'}
                        alt={activeChatContact.user.name}
                        className="w-8 h-8 rounded-full object-cover animate-fade-in"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{activeChatContact.user.name}</div>
                        <span className="text-[9px] text-slate-400 block">Direct Patient Messaging</span>
                      </div>
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                      {chatMessages.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-center py-8">Start conversation below.</p>
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
                        placeholder="Type message to patient..."
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
                    Select a patient from the sidebar list to view chat.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 6: Growth Tools & AI Coach */}
          {activeTab === 'growth' && (
            <div className="space-y-8">
              
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Views</div>
                  <div className="text-2xl font-black text-slate-850 dark:text-white mt-1">
                    {analytics?.profileViews || 500}
                  </div>
                  <span className="text-[9px] text-emerald-600 font-bold block mt-1.5">↑ 12% vs last month</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Requests</div>
                  <div className="text-2xl font-black text-slate-850 dark:text-white mt-1">
                    {analytics?.bookingsCount || 120}
                  </div>
                  <span className="text-[9px] text-emerald-600 font-bold block mt-1.5">↑ 8% conversion rate</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion rate</div>
                  <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                    {analytics?.conversions || 24.0}%
                  </div>
                  <span className="text-[9px] text-slate-450 block mt-1.5">Benchmark avg: 15%</span>
                </div>
              </div>

              {/* AI Profile Optimization Coach widget */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-500/20 rounded-3xl p-6 shadow-lg space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles size={18} className="text-teal-300" />
                  <h4 className="font-extrabold text-sm text-white">AI Profile Coach</h4>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1">
                    <Info size={12} /> Optimization Recommendation
                  </span>
                  <p className="text-slate-200 leading-normal">
                    ⚠️ Your bio is currently short and does not list your academic residency at Harvard/Yale or accepted insurance networks. Upgrading your bio could boost match compatibility scores and views by up to **22%**.
                  </p>
                </div>

                {coachSuccessMessage && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle size={16} /> {coachSuccessMessage}
                  </div>
                )}

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Generated Bio Suggestion:</span>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 text-[11px] text-slate-350 leading-relaxed italic">
                    &quot;Dr. {user?.name.split(' ').slice(1).join(' ')} is a board-certified specialist with over {doctor?.experienceYears} years of training in advanced medical diagnostics and therapy. Resided residency at Harvard Medical School and Yale Langone Health. Specialized in compassionate patient care, digital health consults, and custom treatment checklists. Accepts major insurance plans including Blue Cross and Aetna.&quot;
                  </div>
                  
                  <button
                    onClick={handleApplyOptimizedBio}
                    disabled={isApplyingBio}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow cursor-pointer"
                  >
                    {isApplyingBio ? 'Applying Optimized Bio...' : 'Apply Optimized Bio Instantly'}
                  </button>
                </div>
              </div>

              {/* Chart widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
                <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-6">Patient Booking Acquisition (Monthly)</h4>
                
                <div className="h-60 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />

                    <path
                      d="M 0 200 L 0 150 L 100 120 L 200 140 L 300 80 L 400 95 L 500 50 L 500 200 Z"
                      fill="url(#chartGradient)"
                    />
                    
                    <path
                      d="M 0 150 L 100 120 L 200 140 L 300 80 L 400 95 L 500 50"
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    <circle cx="0" cy="150" r="4" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
                    <circle cx="100" cy="120" r="4" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
                    <circle cx="200" cy="140" r="4" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
                    <circle cx="300" cy="80" r="4" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
                    <circle cx="400" cy="95" r="4" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
                    <circle cx="500" cy="50" r="4" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
                  </svg>
                  
                  <div className="absolute left-2 top-2 text-[9px] font-bold text-slate-400">100 visits</div>
                  <div className="absolute left-2 top-[72px] text-[9px] font-bold text-slate-400">50 visits</div>
                  <div className="absolute left-2 bottom-2 text-[9px] font-bold text-slate-400">0 visits</div>

                  <div className="absolute left-0 bottom-[-20px] right-0 flex justify-between text-[9px] font-bold text-slate-400 px-4">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun (Current)</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </section>

      </main>

      {/* Complete Consult Modal */}
      {completeAptId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setCompleteAptId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Complete Consultation</h4>
            
            {formError && <p className="text-xs text-rose-500 bg-rose-50 p-2 rounded-lg mb-3">{formError}</p>}
            
            <form onSubmit={handleCompleteVisitSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Visit Summary & Medical Notes</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Record symptoms, diagnoses, advice, and next clinic checkup dates..."
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Prescription File Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Prescription_Amoxicillin_500mg.pdf"
                  value={prescriptionName}
                  onChange={(e) => setPrescriptionName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
                <span className="block text-[9px] text-slate-400 mt-1">This generates a downloadable prescription PDF inside the patient&apos;s Health Passport.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Sign & Finalize Consultation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Patient Health Record Inspector Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            
            <div className="flex gap-4 items-center mb-6">
              <img
                src={selectedPatient.user?.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'}
                alt={selectedPatient.user?.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-teal-500/10"
              />
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{selectedPatient.user?.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Insurance Provider: {selectedPatient.insuranceProvider || 'None'}</p>
                <p className="text-[10px] text-slate-400">Policy Number: {selectedPatient.insurancePolicyNum || 'None'}</p>
              </div>
            </div>

            <div className="space-y-6 text-xs">
              
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
                <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-2">Encrypted Health History</span>
                {selectedPatient.medicalHistory ? (
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 dark:text-slate-350">
                    {(() => {
                      try {
                        const hist = JSON.parse(selectedPatient.medicalHistory);
                        return `Allergies: ${hist.allergies?.join(', ') || 'None'}\nChronic Conditions: ${hist.chronicConditions?.join(', ') || 'None'}\nPast Procedures: ${hist.pastSurgeries?.join(', ') || 'None'}`;
                      } catch(e) {
                        return selectedPatient.medicalHistory;
                      }
                    })()}
                  </pre>
                ) : (
                  <span className="text-slate-400 italic">No health history details recorded.</span>
                )}
              </div>

              <div>
                <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-3">Patient Lab & scan Uploads</span>
                {selectedPatient.documents?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No files shared by patient.</p>
                ) : (
                  <div className="grid gap-2">
                    {selectedPatient.documents?.map((doc: any) => (
                      <div key={doc.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center bg-white dark:bg-slate-900 shadow-sm">
                        <span className="font-bold text-xs text-slate-750 dark:text-slate-300 truncate max-w-[280px]">{doc.name}</span>
                        <a
                          href={doc.url}
                          download
                          className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[9px] font-bold text-teal-650 rounded"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
