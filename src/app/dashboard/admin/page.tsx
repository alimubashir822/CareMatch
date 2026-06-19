'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  ShieldAlert, 
  Clock, 
  Loader2, 
  Check, 
  Ban, 
  Activity,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'doctors' | 'patients' | 'bookings' | 'audits'>('doctors');

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
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

  const handleToggleApproval = async (doctorId: string, isApproved: boolean) => {
    try {
      const res = await fetch('/api/admin/approve-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, isApproved }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment as admin?')) return;
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

  const { doctors = [], patients = [], appointments = [], auditLogs = [] } = dashboardData || {};

  // Global calculations
  const totalRevenue = appointments
    .filter((apt: any) => apt.status === 'COMPLETED' && apt.payment?.status === 'PAID')
    .reduce((sum: number, apt: any) => sum + apt.price, 0);

  const activeBookingsCount = appointments.filter((apt: any) => apt.status === 'CONFIRMED' || apt.status === 'PENDING').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Marketplace Administration</h1>
          <p className="text-xs text-slate-400 mt-1">Platform-wide statistics, audit reports, and credential controls.</p>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Global Patients</span>
            <div className="text-xl font-black text-slate-850 dark:text-white mt-1">{patients.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Listed Providers</span>
            <div className="text-xl font-black text-slate-850 dark:text-white mt-1">{doctors.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Appointments</span>
            <div className="text-xl font-black text-slate-850 dark:text-white mt-1">{activeBookingsCount}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cumulative GMV</span>
            <div className="text-xl font-black text-teal-650 mt-1">${totalRevenue}</div>
          </div>
        </div>

        {/* Tab content panel */}
        <div className="space-y-6">
          
          {/* Tabs header */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
            {[
              { id: 'doctors', label: 'Doctor Approvals', icon: Check },
              { id: 'patients', label: 'Patient Register', icon: Users },
              { id: 'bookings', label: 'Platform Bookings', icon: Calendar },
              { id: 'audits', label: 'Audit Security Logs', icon: ShieldAlert }
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
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Provider Validation Center</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {doctors.map((doc: any) => (
                  <div 
                    key={doc.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex gap-4 items-center min-w-0">
                      <img
                        src={doc.user.image}
                        alt={doc.user.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-teal-500/10"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{doc.user.name}</h4>
                        <span className="text-[10px] text-teal-600 font-bold block">{doc.specialty.name}</span>
                        <span className="text-[9px] text-slate-400 block mt-1">Clinic: {doc.clinic?.name || 'CareMatch Network'}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {doc.isApproved ? (
                        <>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold rounded-lg text-[9px]">APPROVED</span>
                          <button
                            onClick={() => handleToggleApproval(doc.id, false)}
                            className="p-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Suspend Provider"
                          >
                            <Ban size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 font-bold rounded-lg text-[9px]">PENDING</span>
                          <button
                            onClick={() => handleToggleApproval(doc.id, true)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Approve Listing
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Patients */}
          {activeTab === 'patients' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Patient Directory</h3>
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 font-bold text-slate-400">
                      <th className="p-4">Patient Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Insurance Provider</th>
                      <th className="p-4">Policy ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {patients.map((pat: any) => (
                      <tr key={pat.id} className="text-slate-650 dark:text-slate-300">
                        <td className="p-4 font-bold flex items-center gap-2">
                          <img
                            src={pat.user.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'}
                            alt={pat.user.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          {pat.user.name}
                        </td>
                        <td className="p-4">{pat.user.email}</td>
                        <td className="p-4 font-medium">{pat.insuranceProvider || 'None'}</td>
                        <td className="p-4 text-slate-400">{pat.insurancePolicyNum || 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          )}

          {/* Tab 3: Bookings */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Platform Reservations</h3>
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 font-bold text-slate-400">
                      <th className="p-4">Patient</th>
                      <th className="p-4">Doctor Assigned</th>
                      <th className="p-4">Consultation</th>
                      <th className="p-4">Charge</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-300">
                    {appointments.map((apt: any) => (
                      <tr key={apt.id}>
                        <td className="p-4 font-bold">{apt.patient.user.name}</td>
                        <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">{apt.doctor.user.name}</td>
                        <td className="p-4">
                          <div>{apt.serviceName}</div>
                          <div className="text-[9px] text-slate-400">{formatDate(apt.date)} @ {apt.timeSlot}</div>
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
                              className="px-2.5 py-1 text-[10px] font-bold border border-rose-250 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          )}

          {/* Tab 4: Audits */}
          {activeTab === 'audits' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Security & Audit Trails</h3>
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 font-bold text-slate-400">
                      <th className="p-4">Action</th>
                      <th className="p-4">Trigger User</th>
                      <th className="p-4">Audit Details</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-300">
                    {auditLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                            log.action.includes('APPROVED') || log.action.includes('CONFIRMED')
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : log.action.includes('SUSPENDED') || log.action.includes('CANCEL')
                                ? 'bg-rose-500/10 text-rose-600'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 font-bold">{log.user?.name || 'System Auto'} <span className="text-[9px] text-slate-400 font-medium capitalize">({log.user?.role || 'Daemon'})</span></td>
                        <td className="p-4 max-w-xs truncate" title={log.details}>{log.details}</td>
                        <td className="p-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
