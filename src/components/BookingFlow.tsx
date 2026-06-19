'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  CheckCircle2, 
  ShieldAlert, 
  Video, 
  Building,
  ArrowRight,
  ArrowLeft,
  Users2,
  ListTodo
} from 'lucide-react';

interface BookingFlowProps {
  doctorId: string;
  basePrice: number;
  doctorName: string;
}

export default function BookingFlow({ doctorId, basePrice, doctorName }: BookingFlowProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Wizard State
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdApt, setCreatedApt] = useState<any>(null);

  // Selections
  const services = [
    { name: 'General Consultation', price: basePrice, duration: 30 },
    { name: 'Comprehensive Assessment', price: basePrice * 1.5, duration: 45 },
    { name: 'Follow-up Checkup', price: Math.round(basePrice * 0.6), duration: 20 },
  ];
  const [selectedService, setSelectedService] = useState(services[0]);

  // Date selection (generate next 5 business days starting today)
  const getNextBusinessDays = () => {
    const dates: Date[] = [];
    const current = new Date();
    while (dates.length < 5) {
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };
  const businessDays = getNextBusinessDays();
  const [selectedDate, setSelectedDate] = useState<Date>(businessDays[0]);

  const slots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
  const [selectedSlot, setSelectedSlot] = useState(slots[1]);
  
  // Advanced Patient Intake & Family fields
  const [selectedFamilyMember, setSelectedFamilyMember] = useState('Myself');
  const [symptomsConcern, setSymptomsConcern] = useState('');
  const [symptomsDuration, setSymptomsDuration] = useState('');
  const [patientQuestions, setPatientQuestions] = useState('');
  const [patientHistory, setPatientHistory] = useState('');
  
  const [visitType, setVisitType] = useState<'VIDEO' | 'IN_PERSON'>('VIDEO');
  const [insuranceProvider, setInsuranceProvider] = useState(user?.profile?.insuranceProvider || '');
  const [insurancePolicyNum, setInsurancePolicyNum] = useState(user?.profile?.insurancePolicyNum || '');

  // Payment mock fields
  const [cardName, setCardName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  // Pre-fill query parameters passed from the AI Chatbot
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const isIntake = searchParams.get('intake') === 'true';
      if (isIntake) {
        const symptomsParam = searchParams.get('symptoms');
        const durationParam = searchParams.get('duration');
        const insuranceParam = searchParams.get('insurance');
        
        if (symptomsParam) setSymptomsConcern(symptomsParam);
        if (durationParam) setSymptomsDuration(durationParam);
        if (insuranceParam && insuranceParam !== 'None') {
          setInsuranceProvider(insuranceParam);
        }
        
        // Auto navigate to Intake step if credentials pre-fill
        setStep(1); // Start service select then prompt
      }
    }
  }, []);

  const handleNext = () => {
    setError('');
    if (step === 2 && !selectedSlot) {
      setError('Please select a time slot.');
      return;
    }
    if (step === 3) {
      if (!symptomsConcern.trim() || !symptomsDuration.trim()) {
        setError('Please enter symptom details and duration for the AI Intake Brief.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleBook = async () => {
    setError('');
    setLoading(true);

    // Build the AI Patient Intake Brief and Family record
    const patientBrief = {
      concern: symptomsConcern,
      duration: symptomsDuration,
      history: patientHistory || 'No allergy indicators.',
      questions: patientQuestions.split('\n').filter((q) => q.trim()),
    };

    const notesPayload = JSON.stringify({
      patientBrief,
      familyMember: selectedFamilyMember,
    });

    const bookingPayload = {
      doctorId,
      serviceName: selectedService.name,
      price: selectedService.price,
      date: selectedDate.toISOString().split('T')[0],
      timeSlot: selectedSlot,
      type: visitType,
      notes: notesPayload, // Stored as JSON string
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedApt(data.appointment);
        setStep(5);
      } else {
        setError(data.error || 'Failed to book appointment.');
      }
    } catch (err) {
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (step > 1 && !user) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl text-center space-y-4 shadow-sm">
        <span className="text-3xl block">🔒</span>
        <h4 className="font-bold text-slate-800 dark:text-white">Authentication Required</h4>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          Please sign in to your patient account to book an appointment with {doctorName}.
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <Link
            href={`/login?callbackUrl=/doctor/${doctorId}`}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="booking" className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-md">
      
      {/* Progress Header */}
      <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
        <span>CareMatch Scheduling Wizard</span>
        <span className="text-teal-600 dark:text-teal-400">Step {step} of 5</span>
      </div>

      {error && (
        <div className="mx-6 mt-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5">
          <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">{error}</p>
        </div>
      )}

      {/* Steps content */}
      <div className="p-6">
        
        {/* Step 1: Service */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">1. Select Medical Service</h4>
            <div className="grid gap-3">
              {services.map((serv) => (
                <button
                  key={serv.name}
                  type="button"
                  onClick={() => setSelectedService(serv)}
                  className={`p-4 border rounded-2xl flex items-center justify-between transition text-left cursor-pointer ${
                    selectedService.name === serv.name
                      ? 'border-teal-500 bg-teal-500/[0.03] dark:bg-teal-500/[0.02] shadow-sm shadow-teal-500/5'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-800 dark:text-white">{serv.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={11} /> {serv.duration} minutes Consultation
                    </div>
                  </div>
                  <div className="font-extrabold text-sm text-teal-600 dark:text-teal-400">
                    ${serv.price}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full mt-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/10 cursor-pointer"
            >
              Continue <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">2. Choose Schedule & Date</h4>
            
            {/* Date selector */}
            <div className="grid grid-cols-5 gap-1.5">
              {businessDays.map((date) => {
                const isSelected = selectedDate.getDate() === date.getDate();
                return (
                  <button
                    key={date.toString()}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`py-2 border rounded-xl flex flex-col items-center justify-center transition text-center cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-xs font-bold mt-0.5">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Slots</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 rounded-xl border text-xs text-center transition cursor-pointer font-medium ${
                      selectedSlot === slot
                        ? 'border-teal-500 bg-teal-600 text-white font-bold shadow-md shadow-teal-600/10'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleBack}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-teal-600/10 cursor-pointer"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Patient Intake & Family */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <ListTodo className="text-teal-500" size={18} />
              3. AI Patient Intake & Family Target
            </h4>

            {/* Who is booking */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Users2 size={12} /> Appointment Recipient
              </label>
              <select
                value={selectedFamilyMember}
                onChange={(e) => setSelectedFamilyMember(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="Myself">Myself ({user?.name})</option>
                <option value="Henry Connor (Father)">Henry Connor (Father)</option>
                <option value="Tommy Connor (Child)">Tommy Connor (Child)</option>
              </select>
            </div>

            {/* Visit mode */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consultation Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisitType('VIDEO')}
                  className={`py-2 px-3 border rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition ${
                    visitType === 'VIDEO'
                      ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950'
                  }`}
                >
                  <Video size={13} /> Video Call
                </button>
                <button
                  type="button"
                  onClick={() => setVisitType('IN_PERSON')}
                  className={`py-2 px-3 border rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition ${
                    visitType === 'IN_PERSON'
                      ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950'
                  }`}
                >
                  <Building size={13} /> Clinic Visit
                </button>
              </div>
            </div>

            {/* Symptoms & Duration */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-8">
                <label htmlFor="symptom" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Symptom / Concern *</label>
                <input 
                  id="symptom"
                  type="text" 
                  required
                  placeholder="e.g. Sharp pain in lower spine"
                  value={symptomsConcern}
                  onChange={(e) => setSymptomsConcern(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label htmlFor="duration" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Duration *</label>
                <input 
                  id="duration"
                  type="text" 
                  required
                  placeholder="e.g. 3 weeks"
                  value={symptomsDuration}
                  onChange={(e) => setSymptomsDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Questions for doctor */}
            <div>
              <label htmlFor="questions" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Questions for Doctor (one per line)</label>
              <textarea
                id="questions"
                rows={2}
                placeholder="e.g. Should I request an MRI?&#10;What exercise should I avoid?"
                value={patientQuestions}
                onChange={(e) => setPatientQuestions(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Brief Medical History */}
            <div>
              <label htmlFor="medHistory" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">History or Allergies</label>
              <input
                id="medHistory"
                type="text"
                placeholder="e.g. Penicillin allergy, taking multivitamins"
                value={patientHistory}
                onChange={(e) => setPatientHistory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Insurance Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="insP" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Insurance Provider</label>
                <input 
                  id="insP"
                  type="text" 
                  placeholder="e.g. Aetna"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="insNum" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Policy Number</label>
                <input 
                  id="insNum"
                  type="text" 
                  placeholder="e.g. POL-888"
                  value={insurancePolicyNum}
                  onChange={(e) => setInsurancePolicyNum(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleBack}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-teal-600/10 cursor-pointer"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Checkout */}
        {step === 4 && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">4. Secure Consultation Payout</h4>
            
            {/* Bill Summary */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Doctor:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{doctorName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Recipient:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedFamilyMember === 'Myself' ? user?.name : selectedFamilyMember}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Service:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedService.name}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Date & Time:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(selectedDate)} @ {selectedSlot}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
                <span>Total Charge:</span>
                <span className="text-teal-600 dark:text-teal-400">${selectedService.price}</span>
              </div>
            </div>

            {/* Credit Card inputs */}
            <div className="space-y-3">
              <div>
                <label htmlFor="ccName" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-slate-400" size={14} />
                  <input
                    id="ccName"
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ccNum" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-3 text-slate-400" size={14} />
                  <input
                    id="ccNum"
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="ccExp" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expiration</label>
                  <input
                    id="ccExp"
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="ccCvc" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">CVC / CVV</label>
                  <input
                    id="ccCvc"
                    type="password"
                    required
                    maxLength={3}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-center focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={handleBook}
                disabled={loading}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-teal-600/10 cursor-pointer"
              >
                {loading ? 'Processing Payout...' : `Pay & Book $${selectedService.price}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmed */}
        {step === 5 && createdApt && (
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full">
              <CheckCircle2 size={32} className="stroke-[2.5]" />
            </div>
            
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Booking Confirmed!</h4>
              <p className="text-slate-400 text-xs mt-1">Intake Code: {createdApt.id.substring(0, 8).toUpperCase()}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Provider:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Recipient:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedFamilyMember === 'Myself' ? user?.name : selectedFamilyMember}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Date & Time:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(selectedDate)} @ {selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Payment Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Paid ✓
                </span>
              </div>
              {createdApt.videoRoomId && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Virtual Telehealth Connection:</span>
                  <Link
                    href={`/telemedicine/${createdApt.videoRoomId}`}
                    className="flex items-center justify-center gap-2 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                  >
                    <Video size={13} /> Join Clinic Room
                  </Link>
                </div>
              )}
            </div>

            <div className="flex gap-2 max-w-sm mx-auto pt-4">
              <Link
                href="/dashboard/patient"
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold rounded-xl text-xs text-center transition cursor-pointer"
              >
                Go to Patient Portal
              </Link>
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Book Another
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
