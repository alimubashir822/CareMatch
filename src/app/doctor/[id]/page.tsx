import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import prisma from '@/lib/db';
import BookingFlow from '@/components/BookingFlow';
import AIChatbot from '@/components/AIChatbot';
import { 
  Star, 
  MapPin, 
  Languages, 
  GraduationCap, 
  Award, 
  ShieldCheck, 
  CheckCircle,
  Stethoscope
} from 'lucide-react';
import { calculateCompatibility, getDoctorQualityMetrics } from '@/lib/scoring';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    specialty?: string;
    location?: string;
    insurance?: string;
    maxPrice?: string;
    type?: string;
    score?: string;
  }>;
}

export default async function DoctorProfilePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const resolvedSearchParams = await searchParams;

  const specialtyParam = resolvedSearchParams.specialty || '';
  const locationParam = resolvedSearchParams.location || '';
  const insuranceParam = resolvedSearchParams.insurance || '';
  const maxPriceParam = resolvedSearchParams.maxPrice || '';
  const typeParam = resolvedSearchParams.type || '';
  const scoreParam = resolvedSearchParams.score || '';

  // Query doctor details from DB
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          email: true,
        },
      },
      specialty: true,
      clinic: true,
      reviews: {
        include: {
          patient: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!doctor) {
    notFound();
  }

  // Calculate CareMatch score
  let matchScore = scoreParam ? parseInt(scoreParam) : null;
  if (!matchScore) {
    matchScore = calculateCompatibility(doctor, {
      specialty: specialtyParam,
      location: locationParam,
      insurance: insuranceParam,
      maxPrice: maxPriceParam,
      type: typeParam,
    });
  }
  const docMetrics = getDoctorQualityMetrics(doctor.user.name);

  // Safe parsing of JSON fields
  let educationList = [];
  try {
    educationList = JSON.parse(doctor.education);
  } catch (e) {
    educationList = [];
  }

  let certificationsList = [];
  try {
    certificationsList = JSON.parse(doctor.certifications);
  } catch (e) {
    certificationsList = [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Profile Information */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
            {/* Doctor Photo */}
            <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative bg-slate-100 mx-auto md:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doctor.user.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=250&h=250&q=80'}
                alt={doctor.user.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 right-2 py-0.5 bg-teal-600 text-white font-extrabold text-[8px] rounded-md tracking-wider text-center">
                ACTIVE
              </span>
            </div>

            {/* General Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                    {doctor.user.name}
                    <span title="Verified Identity">
                      <ShieldCheck className="text-teal-500 fill-teal-500/10 shrink-0" size={20} />
                    </span>
                  </h1>
                  <p className="text-teal-600 dark:text-teal-400 text-sm font-bold mt-1">
                    {doctor.specialty.name} Specialist
                  </p>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl w-fit mx-auto md:mx-0">
                  <Star className="text-amber-500 fill-amber-500" size={15} />
                  <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                    {doctor.rating}
                  </span>
                  <span className="text-xs text-slate-400">({doctor.reviews.length} reviews)</span>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {doctor.bio}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-teal-500 font-bold">★</span>
                  <span>{doctor.experienceYears} Years Clinical Experience</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-teal-500" />
                  <span>{doctor.clinic?.name || 'Remote Care'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Languages size={14} className="text-teal-500" />
                  <span>Languages: {doctor.languages}</span>
                </div>
              </div>

              {/* AI Match & Quality Insights */}
              <div className="mt-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-teal-650 dark:text-teal-400 font-extrabold text-xs">
                    <span className="inline-block animate-pulse">✨</span> CareMatch Smart Recommendation
                  </div>
                  
                  <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-black text-xs rounded-xl">
                    {matchScore}% Compatibility Score
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Response Speed</span>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200">{docMetrics.responseTime}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Satisfaction</span>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200">{docMetrics.satisfaction}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Follow-up Rate</span>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200">{docMetrics.followUpRate}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Care Style</span>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200">{docMetrics.style}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Education & Certifications */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Education Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-4">
                <GraduationCap className="text-teal-500" size={18} />
                Education & Training
              </h3>
              {educationList.length === 0 ? (
                <p className="text-xs text-slate-400">Education credentials verification pending.</p>
              ) : (
                <ul className="space-y-4">
                  {educationList.map((edu: any, index: number) => (
                    <li key={index} className="text-xs border-l-2 border-teal-500 pl-3 space-y-1">
                      <div className="font-bold text-slate-800 dark:text-white">{edu.degree}</div>
                      <div className="text-slate-500">{edu.school}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{edu.year}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Certifications Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-4">
                <Award className="text-teal-500" size={18} />
                Board Certifications
              </h3>
              {certificationsList.length === 0 ? (
                <p className="text-xs text-slate-400">Board certifications verification pending.</p>
              ) : (
                <ul className="space-y-3">
                  {certificationsList.map((cert: string, index: number) => (
                    <li key={index} className="text-xs flex items-start gap-2 text-slate-600 dark:text-slate-400">
                      <CheckCircle className="text-teal-500 shrink-0 mt-0.5" size={13} />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          {/* Reviews List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Verified Patient Reviews ({doctor.reviews.length})
            </h3>
            
            {doctor.reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No reviews have been written for this provider yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-6">
                {doctor.reviews.map((rev) => (
                  <div key={rev.id} className="pt-6 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      
                      {/* Patient Author info */}
                      <div className="flex items-center gap-2">
                        {rev.patient.user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={rev.patient.user.image}
                            alt={rev.patient.user.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                            {rev.patient.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-xs text-slate-850 dark:text-slate-200 block">{rev.patient.user.name}</span>
                          <span className="text-[9px] text-slate-400 font-medium">Verified Patient • {new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Review Rating */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 dark:text-slate-800'}`}
                          />
                        ))}
                      </div>

                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                      &quot;{rev.comment}&quot;
                    </p>

                    {/* Doctor Reply */}
                    {rev.reply && (
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/50 rounded-2xl p-4 ml-6 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-teal-600 dark:text-teal-400 font-extrabold text-[10px] uppercase tracking-wider">Response from {doctor.user.name}:</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed italic">
                          &quot;{rev.reply}&quot;
                        </p>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Appointment Booking Flow */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <BookingFlow 
              doctorId={doctor.id} 
              basePrice={doctor.pricePerConsultation} 
              doctorName={doctor.user.name} 
            />
            
            {/* Clinic / Location Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Practice Location</h4>
              <div className="flex items-start gap-3">
                <MapPin className="text-teal-500 shrink-0 mt-0.5" size={16} />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-800 dark:text-white">{doctor.clinic?.name || 'CareMatch Telehealth'}</div>
                  <p className="text-slate-500">{doctor.clinic?.address || 'Virtual / Online Consultations Only'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      <AIChatbot />
    </div>
  );
}
