'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Star, 
  Calendar, 
  BrainCircuit, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ThumbsUp 
} from 'lucide-react';

interface MatchedDoctor {
  id: string;
  name: string;
  image: string;
  experienceYears: number;
  rating: number;
  price: number;
  clinicName: string;
  location: string;
  compatibilityScore: number;
  breakdowns: {
    specialty: boolean;
    budget: boolean;
    location: boolean;
    insurance: boolean;
    style: string;
  };
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  reasoning?: string;
  specialtyName?: string;
  doctors?: MatchedDoctor[];
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Conversational Questionnaire State
  const [stage, setStage] = useState<'symptoms' | 'duration' | 'location' | 'insurance' | 'budget' | 'type' | 'matches'>('symptoms');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [insurance, setInsurance] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [careType, setCareType] = useState<'VIDEO' | 'IN_PERSON' | 'ANY'>('ANY');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I am your CareMatch AI Assistant. Let's find you the right provider. What health concern or symptoms are you experiencing today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle URL pre-fill from Homepage Hero Concierge Search
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('aiQuery');
      if (query && stage === 'symptoms' && symptoms === '') {
        setIsOpen(true);
        setSymptoms(query);
        const newMsgId = Date.now().toString();
        setMessages([
          {
            id: '1',
            sender: 'ai',
            text: "Hello! I am your CareMatch AI Assistant. Let's find you the right provider. What health concern or symptoms are you experiencing today?",
          },
          {
            id: newMsgId,
            sender: 'user',
            text: query,
          },
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: "Understood. How long has this concern or pain been going on?",
          }
        ]);
        setStage('duration');
        
        // Clean up url parameter so it doesn't re-trigger on reload/route change
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        // Wait briefly for hydration to settle before speaking
        setTimeout(() => {
          speakText("Understood. How long has this concern or pain been going on?");
        }, 1000);
      }
    }
  }, [stage, symptoms]);

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        
        rec.onstart = () => setIsRecording(true);
        rec.onend = () => setIsRecording(false);
        rec.onerror = () => setIsRecording(false);
        rec.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript;
          setInputValue(speechToText);
        };
        
        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      // Simulator fallback if Web Speech is not supported
      setInputValue('I have chronic back pain for 3 weeks');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if (!audioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Clear any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && stage !== 'type') return;

    const userText = inputValue;
    setInputValue('');

    const newMsgId = Date.now().toString();

    // 1. Symptom Stage
    if (stage === 'symptoms') {
      setSymptoms(userText);
      setMessages((prev) => [...prev, { id: newMsgId, sender: 'user', text: userText }]);
      setStage('duration');
      const aiPrompt = "Understood. How long has this concern or pain been going on?";
      setMessages((prev) => [...prev, { id: (Date.now()+1).toString(), sender: 'ai', text: aiPrompt }]);
      speakText(aiPrompt);
    } 
    // 2. Duration Stage
    else if (stage === 'duration') {
      setDuration(userText);
      setMessages((prev) => [...prev, { id: newMsgId, sender: 'user', text: userText }]);
      setStage('location');
      const aiPrompt = "Got it. Do you have a preferred location or city? (Type 'remote' for online video consultation)";
      setMessages((prev) => [...prev, { id: (Date.now()+1).toString(), sender: 'ai', text: aiPrompt }]);
      speakText(aiPrompt);
    } 
    // 3. Location Stage
    else if (stage === 'location') {
      setLocation(userText);
      setMessages((prev) => [...prev, { id: newMsgId, sender: 'user', text: userText }]);
      setStage('insurance');
      const aiPrompt = "Understood. What is your insurance provider? (e.g. Aetna, Blue Cross, or None)";
      setMessages((prev) => [...prev, { id: (Date.now()+1).toString(), sender: 'ai', text: aiPrompt }]);
      speakText(aiPrompt);
    } 
    // 4. Insurance Stage
    else if (stage === 'insurance') {
      setInsurance(userText);
      setMessages((prev) => [...prev, { id: newMsgId, sender: 'user', text: userText }]);
      setStage('budget');
      const aiPrompt = "What is your maximum consultation budget in dollars? (e.g. 100)";
      setMessages((prev) => [...prev, { id: (Date.now()+1).toString(), sender: 'ai', text: aiPrompt }]);
      speakText(aiPrompt);
    } 
    // 5. Budget Stage
    else if (stage === 'budget') {
      setMaxPrice(userText);
      setMessages((prev) => [...prev, { id: newMsgId, sender: 'user', text: `$${userText}` }]);
      setStage('type');
      const aiPrompt = "Perfect. Select your care type preference below:";
      setMessages((prev) => [...prev, { id: (Date.now()+1).toString(), sender: 'ai', text: aiPrompt }]);
      speakText(aiPrompt);
    }
  };

  const handleSelectType = async (selectedType: 'VIDEO' | 'IN_PERSON' | 'ANY') => {
    setCareType(selectedType);
    const typeLabel = selectedType === 'VIDEO' ? 'Online Video Call' : selectedType === 'IN_PERSON' ? 'In-Person Visit' : 'Any care type';
    
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'user', text: typeLabel }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: symptoms,
          duration,
          location,
          insurance,
          maxPrice,
          type: selectedType === 'ANY' ? '' : selectedType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: `Based on your profile, we detected needs matching **${data.specialtyName}**. Here are your best matched doctors sorted by compatibility score.`,
            reasoning: data.reasoning,
            specialtyName: data.specialtyName,
            doctors: data.doctors,
          },
        ]);
        setStage('matches');

        if (data.doctors && data.doctors.length > 0) {
          const topDoc = data.doctors[0];
          speakText(`I found ${data.doctors.length} doctors. Dr. ${topDoc.name.split(' ').slice(1).join(' ')} has a ${topDoc.compatibilityScore} percent compatibility score.`);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: "I had an issue querying our database. Let's try starting over.",
          },
        ]);
        setStage('symptoms');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "A connection issue occurred. Please check network and retry.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStage('symptoms');
    setSymptoms('');
    setDuration('');
    setLocation('');
    setInsurance('');
    setMaxPrice('');
    setCareType('ANY');
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: "Hello! Let's restart. What health concern or symptoms are you experiencing today?",
      },
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end max-w-[calc(100vw-2rem)]">
      
      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[410px] h-[calc(100dvh-6rem)] sm:h-[580px] max-h-[600px] bg-white dark:bg-slate-900 shadow-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-indigo-700 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/10 rounded-xl">
                <BrainCircuit size={18} className="text-teal-300 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs tracking-wide">CareMatch AI Matching Assistant</h4>
                <span className="text-[9px] text-teal-200/80 font-bold block">Compatibility Optimizer (Non-Medical Advice)</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white"
                title={audioEnabled ? 'Mute AI voice output' : 'Unmute AI voice output'}
              >
                {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages feed */}
          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/20"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] text-xs ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                  
                  {msg.reasoning && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2 italic leading-normal">
                      {msg.reasoning}
                    </p>
                  )}
                </div>

                {/* Match Cards */}
                {msg.sender === 'ai' && msg.doctors && msg.doctors.length > 0 && (
                  <div className="w-full mt-3 space-y-2.5 pl-2">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Best Matching Specialists:</span>
                    <div className="grid gap-2.5">
                      {msg.doctors.slice(0, 3).map((doc) => (
                        <div 
                          key={doc.id}
                          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex gap-3 shadow-sm hover:border-teal-500 transition duration-150 relative"
                        >
                          <img
                            src={doc.image}
                            alt={doc.name}
                            className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-teal-500/10"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{doc.name}</h5>
                              
                              {/* CareMatch Score Badge */}
                              <span className="shrink-0 text-[10px] font-black px-1.5 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
                                {doc.compatibilityScore}% Match
                              </span>
                            </div>
                            
                            <p className="text-[9px] text-slate-400 truncate">{doc.clinicName} • {doc.location}</p>
                            
                            {/* Breakdown checkmarks */}
                            <div className="flex flex-wrap gap-1 mt-1 text-[8px] font-bold">
                              {doc.breakdowns.specialty && <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.5 rounded">✓ Specialty</span>}
                              {doc.breakdowns.insurance && <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.5 rounded">✓ Insurance</span>}
                              {doc.breakdowns.budget && <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.5 rounded">✓ Budget</span>}
                              <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-1 py-0.5 rounded">{doc.breakdowns.style}</span>
                            </div>
                          </div>
                          
                          <Link 
                            href={`/doctor/${doc.id}?intake=true&symptoms=${encodeURIComponent(symptoms)}&duration=${encodeURIComponent(duration)}&insurance=${encodeURIComponent(insurance)}`}
                            className="p-2.5 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-xl hover:bg-teal-600 hover:text-white transition shrink-0 cursor-pointer flex items-center justify-center align-middle"
                            onClick={() => setIsOpen(false)}
                            title="Schedule intake appointment"
                          >
                            <Calendar size={13} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Stage selection shortcuts for care type */}
            {stage === 'type' && !loading && (
              <div className="flex flex-col gap-2 max-w-[85%] mt-1 pl-4">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Choose Consultation Mode:</span>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleSelectType('VIDEO')}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow"
                  >
                    Online Video consult
                  </button>
                  <button 
                    onClick={() => handleSelectType('IN_PERSON')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow"
                  >
                    In-Person Clinic Visit
                  </button>
                  <button 
                    onClick={() => handleSelectType('ANY')}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition"
                  >
                    Any type
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-start">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Form dock */}
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-col gap-2">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                disabled={stage === 'type' || stage === 'matches' || loading}
                placeholder={
                  stage === 'symptoms' ? "Describe your symptoms..." : 
                  stage === 'duration' ? "e.g. 3 days, 1 week..." :
                  stage === 'location' ? "e.g. New York, Remote..." :
                  stage === 'insurance' ? "e.g. Aetna, None..." :
                  stage === 'budget' ? "e.g. 100, 150..." :
                  "Analyzing inputs..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 transition-glow"
              />
              
              {/* Mic Icon */}
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={stage === 'type' || stage === 'matches' || loading}
                className={`p-2.5 border rounded-xl flex items-center justify-center shrink-0 cursor-pointer ${
                  isRecording 
                    ? 'bg-rose-500 border-rose-500 text-white animate-pulse' 
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                }`}
                title="Voice Input Dictation"
              >
                {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
              </button>

              <button
                type="submit"
                disabled={!inputValue.trim() || stage === 'type' || loading}
                className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white rounded-xl shadow-md transition shrink-0 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>

            {/* Restart option */}
            {stage === 'matches' && (
              <button 
                onClick={handleRestart}
                className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline text-left pl-1"
              >
                + Start new AI Care match query
              </button>
            )}
          </div>

        </div>
      )}

      {/* Floating bubble trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4.5 py-3.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-full shadow-2xl active:scale-95 transition duration-150 group cursor-pointer border border-teal-400/10"
      >
        <Sparkles className="w-5 h-5 animate-pulse text-teal-200" />
        <span className="font-extrabold text-xs tracking-wider uppercase">Ask CareMatch AI</span>
      </button>

    </div>
  );
}
