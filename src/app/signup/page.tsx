'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Lock, Mail, User, Stethoscope, Shield } from 'lucide-react';

interface Specialty {
  id: string;
  name: string;
}

export default function SignupPage() {
  const { signup, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'CLINIC'>('PATIENT');

  // Role-Specific Fields
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtyId, setSpecialtyId] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [pricePerConsultation, setPricePerConsultation] = useState('80');
  const [languages, setLanguages] = useState('English');
  const [bio, setBio] = useState('');

  const [clinicName, setClinicName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');

  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNum, setInsurancePolicyNum] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Specialties if Doctor role selected
  useEffect(() => {
    if (role === 'DOCTOR') {
      fetch('/api/specialties')
        .then((res) => res.json())
        .then((data) => {
          setSpecialties(data.specialties);
          if (data.specialties.length > 0) {
            setSpecialtyId(data.specialties[0].id);
          }
        })
        .catch((err) => console.error('Error fetching specialties:', err));
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const signupData: any = {
      name,
      email,
      password,
      role,
    };

    if (role === 'PATIENT') {
      signupData.insuranceProvider = insuranceProvider || 'None';
      signupData.insurancePolicyNum = insurancePolicyNum || 'None';
    } else if (role === 'DOCTOR') {
      signupData.specialtyId = specialtyId;
      signupData.experienceYears = Number(experienceYears) || 0;
      signupData.pricePerConsultation = Number(pricePerConsultation) || 0;
      signupData.languages = languages || 'English';
      signupData.bio = bio || 'Hello, I am a healthcare provider.';
    } else if (role === 'CLINIC') {
      signupData.clinicName = clinicName;
      signupData.address = address;
      signupData.location = location;
    }

    try {
      const res = await signup(signupData);
      if (res.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-indigo-600 p-8 text-white text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight mb-2">
            🩺 CareMatch
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-teal-100/90 text-sm mt-1">
            Join the smart healthcare marketplace network
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 md:p-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
              <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-rose-700 dark:text-rose-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Account Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Join As
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['PATIENT', 'DOCTOR', 'CLINIC'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition duration-150 cursor-pointer ${
                      role === r
                        ? 'bg-teal-50 dark:bg-teal-950/35 border-teal-500 text-teal-700 dark:text-teal-400 shadow-sm shadow-teal-500/10'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {r === 'PATIENT' ? 'Patient' : r === 'DOCTOR' ? 'Doctor' : 'Clinic'}
                  </button>
                ))}
              </div>
            </div>

            {/* Base Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Full Name / Contact Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-glow"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-glow"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-glow"
                />
              </div>
            </div>

            {/* Dynamic Patient Fields */}
            {role === 'PATIENT' && (
              <div className="grid md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div>
                  <label htmlFor="insProvider" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Insurance Provider
                  </label>
                  <input
                    id="insProvider"
                    type="text"
                    placeholder="e.g. Aetna"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 transition-glow"
                  />
                </div>
                <div>
                  <label htmlFor="insPolicy" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Policy Number
                  </label>
                  <input
                    id="insPolicy"
                    type="text"
                    placeholder="e.g. POL-55566"
                    value={insurancePolicyNum}
                    onChange={(e) => setInsurancePolicyNum(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 transition-glow"
                  />
                </div>
              </div>
            )}

            {/* Dynamic Doctor Fields */}
            {role === 'DOCTOR' && (
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="specialty" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Medical Specialty
                    </label>
                    <select
                      id="specialty"
                      value={specialtyId}
                      onChange={(e) => setSpecialtyId(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 text-sm"
                    >
                      {specialties.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="experience" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Years of Experience
                    </label>
                    <input
                      id="experience"
                      type="number"
                      required
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Consultation Price ($)
                    </label>
                    <input
                      id="price"
                      type="number"
                      required
                      min="0"
                      value={pricePerConsultation}
                      onChange={(e) => setPricePerConsultation(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="languages" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Languages (comma separated)
                  </label>
                  <input
                    id="languages"
                    type="text"
                    required
                    placeholder="English, Spanish, French"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    placeholder="Describe your background, specialty focus, and patient care philosophy..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 text-sm"
                  />
                  <span className="block text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
                    * Note: Doctor listings must be reviewed and approved by the platform administrators before appearing in results.
                  </span>
                </div>
              </div>
            )}

            {/* Dynamic Clinic Fields */}
            {role === 'CLINIC' && (
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div>
                  <label htmlFor="clinicName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Clinic Organization Name
                  </label>
                  <input
                    id="clinicName"
                    type="text"
                    required
                    placeholder="e.g. Apex Medical Partners"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      City & State (Location)
                    </label>
                    <input
                      id="location"
                      type="text"
                      required
                      placeholder="e.g. Chicago, IL"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Full Street Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      placeholder="e.g. 789 Medical Plaza, Suite B"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/15 hover:shadow-teal-600/20 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? 'Creating your account...' : 'Create Account'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
