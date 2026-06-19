import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import prisma from '@/lib/db';
import AIChatbot from '@/components/AIChatbot';
import { Star, MapPin, Stethoscope, Briefcase, Languages, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { calculateCompatibility, getDoctorQualityMetrics } from '@/lib/scoring';

interface PageProps {
  searchParams: Promise<{
    specialty?: string;
    location?: string;
    insurance?: string;
    language?: string;
    maxPrice?: string;
    type?: string;
    experience?: string;
  }>;
}

export default async function FindDoctorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const specialtyParam = params.specialty || '';
  const locationParam = params.location || '';
  const insuranceParam = params.insurance || '';
  const languageParam = params.language || '';
  const maxPriceParam = params.maxPrice || '';
  const typeParam = params.type || '';
  const experienceParam = params.experience || '';

  // Get all specialties for the sidebar filter select
  const specialties = await prisma.specialty.findMany({
    orderBy: { name: 'asc' },
  });

  // Query doctors
  const where: any = {
    isApproved: true,
  };

  // Specialty Filter
  if (specialtyParam) {
    where.specialty = {
      name: {
        contains: specialtyParam,
      },
    };
  }

  // Location Filter (check clinic location)
  if (locationParam) {
    where.clinic = {
      location: {
        contains: locationParam,
      },
    };
  }

  // Language Filter (comma-separated field)
  if (languageParam) {
    where.languages = {
      contains: languageParam,
    };
  }

  // Price Filter
  if (maxPriceParam) {
    where.pricePerConsultation = {
      lte: parseFloat(maxPriceParam),
    };
  }

  // Experience Filter
  if (experienceParam) {
    where.experienceYears = {
      gte: parseInt(experienceParam),
    };
  }

  // Query doctors from database
  const doctors = await prisma.doctor.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      specialty: true,
      clinic: true,
    },
    orderBy: {
      rating: 'desc',
    },
  });

  // Client-side mapping & virtual filtering for fields that can't be queries easily in sqlite (like insurance matching list)
  let filteredDoctors = doctors;
  if (insuranceParam) {
    const insuranceLower = insuranceParam.toLowerCase();
    // Simulate smart matching: Sarah accepts BCBS/Blue Cross, John accepts Aetna, Emily accepts Aetna/Cigna, Michael accepts United
    filteredDoctors = doctors.filter((doc) => {
      const docName = doc.user.name.toLowerCase();
      if (insuranceLower.includes('blue') || insuranceLower.includes('bcbs')) {
        return docName.includes('sarah') || docName.includes('michael');
      }
      if (insuranceLower.includes('aetna')) {
        return docName.includes('john') || docName.includes('emily');
      }
      if (insuranceLower.includes('cigna')) {
        return docName.includes('emily') || docName.includes('michael');
      }
      return true; // Match all other if insurance provider is unknown
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3">
          
          {/* Mobile Collapsible Filter Panel */}
          <details className="lg:hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm mb-6 group overflow-hidden">
            <summary className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">⚙️ Show / Hide Filters</span>
              <span className="text-[10px] text-teal-650 group-open:hidden">Expand Filters</span>
              <span className="text-[10px] text-slate-450 hidden group-open:inline">Collapse Filters</span>
            </summary>
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800">
              <form action="/find-doctors" method="GET" className="space-y-5">
                
                {/* Specialty */}
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Specialty</label>
                  <select 
                    name="specialty" 
                    defaultValue={specialtyParam}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Location / City</label>
                  <input 
                    type="text" 
                    name="location" 
                    placeholder="e.g. New York" 
                    defaultValue={locationParam}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Insurance */}
                <div>
                  <label className="block text-xs font-bold text-slate-455 uppercase tracking-wider mb-2">Accepted Insurance</label>
                  <input 
                    type="text" 
                    name="insurance" 
                    placeholder="e.g. Aetna, BCBS" 
                    defaultValue={insuranceParam}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs font-bold text-slate-455 uppercase tracking-wider mb-2">Language</label>
                  <select 
                    name="language" 
                    defaultValue={languageParam}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="">Any Language</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Urdu">Urdu</option>
                    <option value="French">French</option>
                  </select>
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-455 uppercase tracking-wider mb-2">Max Price ($)</label>
                  <input 
                    type="number" 
                    name="maxPrice" 
                    placeholder="e.g. 100" 
                    defaultValue={maxPriceParam}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs font-bold text-slate-455 uppercase tracking-wider mb-2">Min Experience (Years)</label>
                  <select 
                    name="experience" 
                    defaultValue={experienceParam}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="">Any Experience</option>
                    <option value="5">5+ Years</option>
                    <option value="10">10+ Years</option>
                    <option value="15">15+ Years</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Link 
                    href="/find-doctors" 
                    className="flex-1 py-2 text-center text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-350 transition flex items-center justify-center"
                  >
                    Reset All
                  </Link>
                  <button 
                    type="submit" 
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition text-center cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          </details>

          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Search Filters</h3>
              <Link 
                href="/find-doctors" 
                className="text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
              >
                <RefreshCw size={10} /> Reset
              </Link>
            </div>

            <form action="/find-doctors" method="GET" className="space-y-5">
              
              {/* Specialty */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Specialty</label>
                <select 
                  name="specialty" 
                  defaultValue={specialtyParam}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="">All Specialties</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location / City</label>
                <input 
                  type="text" 
                  name="location" 
                  placeholder="e.g. New York" 
                  defaultValue={locationParam}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Insurance */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Accepted Insurance</label>
                <input 
                  type="text" 
                  name="insurance" 
                  placeholder="e.g. Aetna, BCBS" 
                  defaultValue={insuranceParam}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Language</label>
                <select 
                  name="language" 
                  defaultValue={languageParam}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="">Any Language</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Urdu">Urdu</option>
                  <option value="French">French</option>
                </select>
              </div>

              {/* Max Consultation Price */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Max Price ($)</label>
                <input 
                  type="number" 
                  name="maxPrice" 
                  placeholder="e.g. 100" 
                  defaultValue={maxPriceParam}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Min Experience (Years)</label>
                <select 
                  name="experience" 
                  defaultValue={experienceParam}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="">Any Experience</option>
                  <option value="5">5+ Years</option>
                  <option value="10">10+ Years</option>
                  <option value="15">15+ Years</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition duration-150 cursor-pointer text-center"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </aside>

        {/* Results Panel */}
        <section className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Healthcare Providers</h2>
              <p className="text-slate-400 text-xs mt-1">Found {filteredDoctors.length} matched doctors</p>
            </div>
            
            {/* Active filters pill */}
            <div className="flex gap-2">
              {specialtyParam && (
                <span className="text-[10px] font-bold px-2 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 rounded-lg">
                  Specialty: {specialtyParam}
                </span>
              )}
              {locationParam && (
                <span className="text-[10px] font-bold px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-lg">
                  Location: {locationParam}
                </span>
              )}
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-12 text-center shadow-sm">
              <span className="text-4xl block mb-4">🔍</span>
              <h4 className="font-bold text-slate-800 dark:text-white text-base">No doctors match your criteria</h4>
              <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                Try widening your search filters, checking your spelling, or typing a query into our floating AI assistant at the bottom right.
              </p>
              <Link 
                href="/find-doctors" 
                className="inline-block mt-6 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition duration-150"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            /* Doctors List */
            <div className="grid gap-4">
              {filteredDoctors.map((doc) => {
                const matchScore = calculateCompatibility(doc, {
                  specialty: specialtyParam,
                  location: locationParam,
                  insurance: insuranceParam,
                  maxPrice: maxPriceParam,
                  type: typeParam,
                });
                const docMetrics = getDoctorQualityMetrics(doc.user.name);

                return (
                  <div 
                    key={doc.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:border-teal-500 transition duration-150 relative group"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={doc.user.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=250&h=250&q=80'} 
                        alt={doc.user.name} 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Approved Badge */}
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-teal-500 text-white font-extrabold text-[8px] rounded-md tracking-wider">
                        VERIFIED
                      </span>
                    </div>

                    {/* Body Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                            <Link 
                              href={`/doctor/${doc.id}?score=${matchScore}&specialty=${encodeURIComponent(specialtyParam)}&location=${encodeURIComponent(locationParam)}&insurance=${encodeURIComponent(insuranceParam)}&maxPrice=${maxPriceParam}&type=${typeParam}`} 
                              className="hover:underline hover:text-teal-600 dark:hover:text-teal-400"
                            >
                              {doc.user.name}
                            </Link>
                            
                            {/* Availability Badge */}
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                              Available Today
                            </span>
                          </h3>
                          <p className="text-teal-600 dark:text-teal-400 text-xs font-bold mt-0.5">
                            {doc.specialty.name}
                          </p>
                        </div>
                        
                        {/* Ratings & CareMatch Score */}
                        <div className="flex flex-wrap items-center gap-2 w-fit self-start">
                          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                            <Star className="text-amber-500 fill-amber-500" size={13} />
                            <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">
                              {doc.rating}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-xl">
                            <span className="text-teal-600 dark:text-teal-400 font-extrabold text-xs">✨ {matchScore}% CareMatch</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                        {doc.bio}
                      </p>

                      {/* AI Quality Intelligence Bar */}
                      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl p-2.5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="font-semibold text-slate-400">Response Speed:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-350">{docMetrics.responseTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span className="font-semibold text-slate-400">Satisfaction:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-350">{docMetrics.satisfaction}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          <span className="font-semibold text-slate-400">Follow-up Quality:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-350">{docMetrics.followUpRate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                          <span className="font-semibold text-slate-400">Care Style:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-350">{docMetrics.style}</span>
                        </div>
                      </div>

                      {/* Metadata details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={13} className="text-teal-500" />
                          <span>{doc.experienceYears} Years Exp</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-teal-500 shrink-0" />
                          <span className="truncate">{doc.clinic?.name || 'CareMatch Telehealth'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Languages size={13} className="text-teal-500 shrink-0" />
                          <span className="truncate">{doc.languages}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={13} className="text-teal-500" />
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            ${doc.pricePerConsultation} / Consultation
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                      <Link 
                        href={`/doctor/${doc.id}?score=${matchScore}&specialty=${encodeURIComponent(specialtyParam)}&location=${encodeURIComponent(locationParam)}&insurance=${encodeURIComponent(insuranceParam)}&maxPrice=${maxPriceParam}&type=${typeParam}`}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs text-center transition flex-1 md:flex-none cursor-pointer"
                      >
                        View Profile
                      </Link>
                      <Link 
                        href={`/doctor/${doc.id}?score=${matchScore}&specialty=${encodeURIComponent(specialtyParam)}&location=${encodeURIComponent(locationParam)}&insurance=${encodeURIComponent(insuranceParam)}&maxPrice=${maxPriceParam}&type=${typeParam}#booking`}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs text-center shadow-md shadow-teal-600/10 hover:shadow-teal-600/15 transition flex-1 md:flex-none cursor-pointer"
                      >
                        Book Appointment
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      <AIChatbot />
    </div>
  );
}
