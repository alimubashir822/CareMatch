'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { 
  Building, 
  Users, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Loader2, 
  Star, 
  Video, 
  Heart,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function ClinicDashboard() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'doctors' | 'appointments'>('doctors');

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/clinic/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
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
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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

  const { clinic, doctors = [], appointments = [] } = dashboardData || {};

  const totalRevenue = appointments
    .filter((apt: any) => apt.status === 'COMPLETED' && apt.payment?.status === 'PAID')
    .reduce((sum: number, apt: any) => sum + apt.price, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Clinic Info (Left Panel) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-xl mb-4">
              🏥
            </div>
            
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">{clinic?.name}</h2>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-md tracking-wider uppercase mt-1 inline-block">
              Clinic Organization
            </span>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6 text-xs space-y-3">
              <div className="flex gap-2 items-start text-slate-500">
                <MapPin size={15} className="text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-850 dark:text-slate-200 block">HQ Address</span>
                  <p className="mt-0.5">{clinic?.address}</p>
                  <p className="font-semibold text-slate-400">{clinic?.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Clinic Aggregate</h4>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Total Staff Doctors</span>
                <span className="font-black text-sm text-slate-800 dark:text-white">{doctors.length}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Total Revenue</span>
                <span className="font-black text-sm text-teal-600">${totalRevenue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Panels (Right Column) */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* Tabs bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
            {[
              { id: 'doctors', label: 'Clinic Staff Doctors', icon: Users },
              { id: 'appointments', label: 'Organization Bookings', icon: Calendar }
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

          {/* Tab 1: Doctors */}
          {activeTab === 'doctors' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Registered Providers</h3>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 shadow-sm transition"
                >
                  <Plus size={12} /> Add Staff Doctor
                </Link>
              </div>

              {doctors.length === 0 ? (
                <p className="text-xs text-slate-400 bg-white dark:bg-slate-900 p-8 rounded-3xl text-center border">
                  No doctors registered under this clinic yet. Staff members can select your clinic during signup.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {doctors.map((doc: any) => (
                    <div 
                      key={doc.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex gap-4 items-center"
                    >
                      <img
                        src={doc.user.image}
                        alt={doc.user.name}
                        className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-teal-500/10"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {doc.user.name}
                        </h4>
                        <span className="text-[10px] text-teal-600 font-bold block">{doc.specialty.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{doc.experienceYears} Years Exp</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            ★ {doc.rating}
                          </span>
                        </div>
                      </div>
                      
                      <div className="shrink-0 text-right">
                        <span className="text-xs font-black text-slate-800 dark:text-white block">${doc.pricePerConsultation}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Fee / Visit</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Appointments */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Clinic Appointment Intake</h3>
              
              {appointments.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 text-center text-xs text-slate-400">
                  No clinic appointments recorded.
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 font-bold text-slate-400">
                          <th className="p-4">Patient</th>
                          <th className="p-4">Assigned Doctor</th>
                          <th className="p-4">Consultation Details</th>
                          <th className="p-4">Fee</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {appointments.map((apt: any) => (
                          <tr key={apt.id} className="text-slate-600 dark:text-slate-300">
                            <td className="p-4 font-bold">{apt.patient.user.name}</td>
                            <td className="p-4 font-medium text-indigo-600 dark:text-indigo-400">{apt.doctor.user.name}</td>
                            <td className="p-4">
                              <div>{apt.serviceName}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(apt.date)} @ {apt.timeSlot}</div>
                            </td>
                            <td className="p-4 font-bold text-teal-650">${apt.price}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                                apt.status === 'CONFIRMED' || apt.status === 'COMPLETED'
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : apt.status === 'PENDING'
                                    ? 'bg-amber-500/10 text-amber-600'
                                    : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {apt.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {(apt.status === 'CONFIRMED' || apt.status === 'PENDING') && (
                                <button
                                  onClick={() => handleCancelAppointment(apt.id)}
                                  className="px-2 py-1 text-[10px] font-bold border border-rose-250 text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
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

        </section>

      </main>
    </div>
  );
}
