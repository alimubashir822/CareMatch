import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import prisma from '@/lib/db';
import AIChatbot from '@/components/AIChatbot';
import HomepageHeroSearch from '@/components/HomepageHeroSearch';
import { 
  Heart, 
  Sparkles, 
  Baby, 
  Brain, 
  Stethoscope, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Video, 
  CalendarRange, 
  ArrowRight,
  Clock,
  Sparkle
} from 'lucide-react';

// Map icon strings from DB to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart: Heart,
  Sparkles: Sparkles,
  Baby: Baby,
  Brain: Brain,
  Stethoscope: Stethoscope,
};

export default async function HomePage() {
  // Query specialties dynamically from DB for SEO-friendly homepage
  const specialties = await prisma.specialty.findMany({
    take: 6,
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-teal-500/10 via-indigo-500/5 to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,148,136,0.06),transparent)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 text-xs font-semibold mb-6 animate-pulse-slow">
            <Sparkle size={12} className="fill-teal-500" />
            <span>AI-Powered Medical Scheduling Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight max-w-4xl mx-auto">
            Find Trusted Doctors & Book <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-teal-400 dark:to-indigo-400">Healthcare Appointments</span> Online
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A smarter, AI-driven way for patients to find care, compare insurance plans, consult virtually, and manage medical documents in one secure place.
          </p>

          {/* Search Widget Container */}
          <HomepageHeroSearch specialties={specialties} />

            {/* Quick Filters */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider mr-1">Popular:</span>
              {['Dermatologist', 'Cardiologist', 'Pediatrician', 'Therapist'].map((filter) => {
                const queryVal = filter === 'Therapist' ? 'Psychiatry' : filter === 'Pediatrician' ? 'Pediatrics' : filter === 'Cardiologist' ? 'Cardiology' : filter === 'Dermatologist' ? 'Dermatology' : '';
                return (
                  <Link
                    key={filter}
                    href={`/find-doctors?specialty=${queryVal}`}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-full hover:border-teal-500 text-slate-600 dark:text-slate-300 font-medium transition duration-150"
                  >
                    {filter}
                  </Link>
                );
              })}
            </div>

        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Explore by Medical Specialty</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
              Connect directly with verified specialists across major departments.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-12">
            {specialties.map((spec) => {
              const IconComponent = ICON_MAP[spec.icon] || Stethoscope;
              return (
                <Link
                  key={spec.id}
                  href={`/find-doctors?specialty=${spec.name}`}
                  className="flex flex-col items-center justify-center p-6 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl hover:border-teal-500 dark:hover:border-teal-500 hover:bg-white dark:hover:bg-slate-950 shadow-sm transition duration-150 group"
                >
                  <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl group-hover:scale-110 transition duration-150">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="mt-4 font-bold text-sm text-slate-800 dark:text-slate-200">{spec.name}</span>
                  <span className="text-xs text-slate-400 mt-1 block text-center truncate w-full">{spec.description}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How CareMatch Works</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
              A comprehensive appointment booking and telemedicine journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              { step: '01', title: 'Find or Ask AI', desc: 'Search filters or tell the AI Care chatbot what you feel to get suggested specialties and top doctors.' },
              { step: '02', title: 'Compare Profiles', desc: 'Read reviews, inspect ratings, check accepted insurances, and verify experience years.' },
              { step: '03', title: 'Book & Pay Securely', desc: 'Pick service (in-person or video), select available slots, upload health records, and pay.' },
              { step: '04', title: 'Consult Virtually', desc: 'Join the telemedicine room to consult, share files, and receive instant digital prescriptions.' }
            ].map((w, index) => (
              <div key={index} className="relative p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm">
                <span className="absolute -top-6 left-6 text-5xl font-black text-slate-200/60 dark:text-slate-800/80">{w.step}</span>
                <div className="pt-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{w.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-2">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900 text-white rounded-3xl mx-4 lg:mx-8 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(13,148,136,0.15),transparent)]" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <span className="text-teal-400 text-xs font-bold uppercase tracking-wider">Premium SaaS Experience</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-3">Packed with Premium Care Coordination Tools</h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              We did not build just another doctor directory. CareMatch features tools designed to streamline the medical workflow for clinics and improve patient recovery cycles.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-400"><Video size={16} /> <span className="font-bold text-sm text-white">Telemedicine</span></div>
                <p className="text-xs text-slate-400">Integrated WebRTC consultations with chat and prescriptions.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-400"><ShieldCheck size={16} /> <span className="font-bold text-sm text-white">Health Passport</span></div>
                <p className="text-xs text-slate-400">Encrypted portal to store records and lab reports.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-400"><Clock size={16} /> <span className="font-bold text-sm text-white">Smart Waitlists</span></div>
                <p className="text-xs text-slate-400">Join a waitlist and get notified if a cancel slot opens up.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-400"><CalendarRange size={16} /> <span className="font-bold text-sm text-white">Insurance Match</span></div>
                <p className="text-xs text-slate-400">Verify provider insurance compatibility prior to checkout.</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-6">
            <h3 className="font-bold text-lg text-teal-400 flex items-center gap-2">
              <Sparkles size={18} />
              AI Appointment Coordinator
            </h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700/50">
                <div className="font-bold text-xs text-teal-400">Patient:</div>
                <div className="text-xs mt-1">&quot;I need to schedule a skin check for my rashes, but I work until 5 PM.&quot;</div>
              </div>
              <div className="bg-teal-950/20 border border-teal-800/30 p-3 rounded-xl">
                <div className="font-bold text-xs text-teal-400">CareMatch AI Coordinator:</div>
                <div className="text-xs mt-1">&quot;Found Dr. Sarah Ahmed (Dermatologist) available today at 5:00 PM. Would you like to book? She accepts Blue Cross Blue Shield.&quot;</div>
              </div>
              <Link href="/find-doctors" className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 text-xs font-bold transition">
                Try the Discovery Search
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Provider Subscription Plans</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
              Select the plan that matches your practice level. Free for patients.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Plan 1 */}
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-8 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">$19<span className="text-sm font-normal text-slate-400">/mo</span></div>
                <p className="text-xs text-slate-500 mt-2">Ideal for new independent providers.</p>
                <ul className="space-y-3 mt-6 text-xs text-slate-600 dark:text-slate-400">
                  <li>✓ Standard Marketplace Listing</li>
                  <li>✓ Calendar Booking Intake</li>
                  <li>✓ Email Reminders</li>
                  <li>✓ Profile Rating & Verified Reviews</li>
                </ul>
              </div>
              <Link href="/signup" className="w-full mt-8 py-3 border border-teal-600 dark:border-teal-500 hover:bg-teal-50 text-teal-600 dark:text-teal-400 dark:hover:bg-slate-950 font-bold rounded-xl text-center text-xs transition">
                Start 14-day Free Trial
              </Link>
            </div>

            {/* Plan 2 */}
            <div className="border-2 border-teal-500 bg-white dark:bg-slate-900 rounded-3xl p-8 flex flex-col justify-between shadow-md relative">
              <span className="absolute -top-3.5 right-6 px-3 py-1 bg-teal-500 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider">Most Popular</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Professional</span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">$49<span className="text-sm font-normal text-slate-400">/mo</span></div>
                <p className="text-xs text-slate-500 mt-2">Maximize your profile reach and bookings.</p>
                <ul className="space-y-3 mt-6 text-xs text-slate-600 dark:text-slate-400">
                  <li>✓ **Featured Listing Ranking**</li>
                  <li>✓ Dashboard Analytics & Growth Tools</li>
                  <li>✓ Telemedicine Virtual Room Integration</li>
                  <li>✓ Waitlist Automation Assistant</li>
                  <li>✓ Custom Service Pricing Matrix</li>
                </ul>
              </div>
              <Link href="/signup" className="w-full mt-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-center text-xs shadow-lg shadow-teal-600/15 transition">
                Get Started
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-8 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enterprise</span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">$149<span className="text-sm font-normal text-slate-400">/mo</span></div>
                <p className="text-xs text-slate-500 mt-2">For clinics and healthcare groups.</p>
                <ul className="space-y-3 mt-6 text-xs text-slate-600 dark:text-slate-400">
                  <li>✓ **Clinic Admin Dashboard**</li>
                  <li>✓ Manage Multiple Doctors (up to 10)</li>
                  <li>✓ Centralized Clinic Remittances</li>
                  <li>✓ Clinic Booking Coordinator</li>
                  <li>✓ Custom API integration hooks</li>
                </ul>
              </div>
              <Link href="/signup" className="w-full mt-8 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-center text-xs transition">
                Contact Enterprise Sales
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 CareMatch SaaS Marketplace. All rights reserved. Encrypted PHI protected.</p>
          <p>
            <a 
              href="https://www.medclinicx.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-semibold hover:underline"
            >
              Healthcare system by Med Clinic X
            </a>
          </p>
        </div>
      </footer>

      {/* Floating AI Doctor Matching chatbot */}
      <AIChatbot />
    </div>
  );
}
