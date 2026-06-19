'use client';

import React, { useState } from 'react';
import { Search, MapPin, ShieldCheck, Sparkles, Stethoscope, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Specialty {
  id: string;
  name: string;
}

interface HomepageHeroSearchProps {
  specialties: Specialty[];
}

export default function HomepageHeroSearch({ specialties }: HomepageHeroSearchProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'traditional'>('ai');
  const [aiInput, setAiInput] = useState('');
  const router = useRouter();

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    // Redirect to homepage with the aiQuery param which triggers the floating chatbot
    router.push(`/?aiQuery=${encodeURIComponent(aiInput)}`);
  };

  return (
    <div className="mt-12 max-w-4xl mx-auto space-y-4 px-4">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-sm border cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-teal-600 border-teal-650 text-white shadow-teal-600/10'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-250'
          }`}
        >
          <Sparkles size={14} className={activeTab === 'ai' ? 'animate-pulse text-teal-300' : 'text-teal-600'} />
          AI Care Concierge (Recommended)
        </button>
        <button
          onClick={() => setActiveTab('traditional')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-sm border cursor-pointer ${
            activeTab === 'traditional'
              ? 'bg-teal-600 border-teal-650 text-white shadow-teal-600/10'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-250'
          }`}
        >
          <Search size={14} />
          Traditional Search Directory
        </button>
      </div>

      {/* Interactive Tabs Content */}
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800/80 transition-all duration-300">
        {activeTab === 'ai' ? (
          /* AI Care Concierge Input Form */
          <form onSubmit={handleAiSubmit} className="space-y-4">
            <div className="text-center md:text-left space-y-1.5 px-2">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-1.5">
                <Sparkles size={16} className="text-teal-600" />
                AI Health intake Assistant
              </h3>
              <p className="text-xs text-slate-400">Describe your symptoms in simple language. Our matching engine will map your needs to the best specialist.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex-1 relative w-full">
                <span className="absolute left-4 top-3 text-sm">✨</span>
                <input
                  type="text"
                  required
                  placeholder="Describe what you are experiencing (e.g. shoulder pain for 3 weeks, annual heart screening, skin irritation)..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium focus:outline-none focus:border-teal-500 transition-glow"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-teal-600 to-indigo-650 hover:from-teal-700 hover:to-indigo-700 text-white rounded-2xl flex items-center justify-center gap-1.5 font-bold shadow-lg shadow-teal-600/10 transition shrink-0 cursor-pointer"
              >
                <span>Consult Concierge</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        ) : (
          /* Traditional Search Directory */
          <form action="/find-doctors" method="GET" className="grid gap-4 md:grid-cols-12 text-left">
            <div className="md:col-span-4 space-y-1.5 px-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Specialty / Department</label>
              <div className="relative">
                <span className="absolute left-0 top-1.5 text-slate-400 text-xs">🩺</span>
                <select name="specialty" className="w-full pl-6 py-1 bg-transparent border-0 text-slate-800 dark:text-slate-100 font-medium focus:outline-none text-xs cursor-pointer">
                  <option value="">Any Specialty</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-3 space-y-1.5 px-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/80 pt-3 md:pt-0 md:pl-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Location / City</label>
              <div className="relative flex items-center">
                <MapPin className="text-slate-400 absolute left-0 shrink-0" size={14} />
                <input 
                  type="text" 
                  name="location" 
                  placeholder="City or zip code" 
                  className="w-full pl-5 bg-transparent border-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-1.5 px-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/80 pt-3 md:pt-0 md:pl-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Insurance Provider</label>
              <div className="relative flex items-center">
                <ShieldCheck className="text-slate-400 absolute left-0 shrink-0" size={14} />
                <input 
                  type="text" 
                  name="insurance" 
                  placeholder="e.g. Aetna" 
                  className="w-full pl-5 bg-transparent border-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-center pt-4 md:pt-0">
              <button type="submit" className="w-full md:h-10 bg-teal-650 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center gap-1 font-bold shadow-md transition duration-150 cursor-pointer py-2 px-4 text-xs">
                <Search size={14} />
                <span>Search</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
