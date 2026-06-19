import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { query, duration, location, insurance, maxPrice, type } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const lowerQuery = query.toLowerCase();
    let targetSpecialty = 'General Medicine';
    let reasoning = 'Based on your symptoms, we suggest starting with a general physician checklist.';

    // Semantic Mapping Engine
    if (
      lowerQuery.includes('skin') ||
      lowerQuery.includes('rash') ||
      lowerQuery.includes('acne') ||
      lowerQuery.includes('dermatology') ||
      lowerQuery.includes('mole') ||
      lowerQuery.includes('irritation') ||
      lowerQuery.includes('itch')
    ) {
      targetSpecialty = 'Dermatology';
      reasoning = 'We detected skin-related concerns. We recommend consulting a board-certified dermatologist.';
    } else if (
      lowerQuery.includes('heart') ||
      lowerQuery.includes('chest') ||
      lowerQuery.includes('cardio') ||
      lowerQuery.includes('blood pressure') ||
      lowerQuery.includes('hypertension') ||
      lowerQuery.includes('palpitation') ||
      lowerQuery.includes('cardiology')
    ) {
      targetSpecialty = 'Cardiology';
      reasoning = 'We detected signs pointing to cardiac concern. We advise getting checked by a cardiologist.';
    } else if (
      lowerQuery.includes('baby') ||
      lowerQuery.includes('child') ||
      lowerQuery.includes('kid') ||
      lowerQuery.includes('toddler') ||
      lowerQuery.includes('pediatric') ||
      lowerQuery.includes('adolescent')
    ) {
      targetSpecialty = 'Pediatrics';
      reasoning = 'We mapped this to child development and pediatric health. We suggest connecting with a pediatrician.';
    } else if (
      lowerQuery.includes('brain') ||
      lowerQuery.includes('depress') ||
      lowerQuery.includes('anxi') ||
      lowerQuery.includes('mental') ||
      lowerQuery.includes('stress') ||
      lowerQuery.includes('counsel') ||
      lowerQuery.includes('psychiatry') ||
      lowerQuery.includes('therapist') ||
      lowerQuery.includes('mood')
    ) {
      targetSpecialty = 'Psychiatry';
      reasoning = 'We mapped your query to behavioral health and psychiatry support. A consultation with a mental health therapist is recommended.';
    }

    // Find the specialty
    const specialty = await prisma.specialty.findFirst({
      where: { name: targetSpecialty },
    });

    if (!specialty) {
      return NextResponse.json({
        specialtyName: 'General Medicine',
        reasoning: 'Connecting you with primary care practitioners.',
        doctors: [],
      });
    }

    // Retrieve approved doctors to calculate Compatibility Score
    const doctors = await prisma.doctor.findMany({
      where: { isApproved: true },
      include: {
        user: { select: { name: true, email: true, image: true } },
        specialty: true,
        clinic: true,
      },
    });

    // Score calculations
    const scoredDoctors = doctors.map((doc) => {
      let score = 0;
      const breakdowns = {
        specialty: false,
        budget: false,
        location: false,
        insurance: false,
        style: 'Detail-oriented & Clinical',
      };

      // 1. Specialty Alignment (40%)
      if (doc.specialty.name === specialty.name) {
        score += 40;
        breakdowns.specialty = true;
      } else if (specialty.name === 'General Medicine') {
        score += 25; // General practitioners can handle generic issues
      }

      // 2. Budget capping (15%)
      const docPrice = doc.pricePerConsultation;
      if (!maxPrice) {
        score += 15;
        breakdowns.budget = true;
      } else {
        const budgetLimit = parseFloat(maxPrice);
        if (docPrice <= budgetLimit) {
          score += 15;
          breakdowns.budget = true;
        } else {
          // partial score based on price ratio
          score += Math.max(0, Math.round(15 * (budgetLimit / docPrice)));
        }
      }

      // 3. Location matching (15%)
      const docLocation = doc.clinic?.location || '';
      if (!location) {
        score += 15;
        breakdowns.location = true;
      } else if (location.toLowerCase() === 'remote' || location.toLowerCase() === 'online') {
        if (docLocation.toLowerCase().includes('remote') || docLocation.toLowerCase().includes('online')) {
          score += 15;
          breakdowns.location = true;
        } else {
          score += 10; // clinics might support telehealth
        }
      } else if (docLocation.toLowerCase().includes(location.toLowerCase())) {
        score += 15;
        breakdowns.location = true;
      } else {
        score += 5; // mismatched location
      }

      // 4. Insurance Intelligence (15%)
      if (!insurance || insurance.toLowerCase() === 'none') {
        score += 15;
        breakdowns.insurance = true;
      } else {
        const insLower = insurance.toLowerCase();
        const docNameLower = doc.user.name.toLowerCase();
        
        let acceptsInsurance = false;
        if (insLower.includes('blue') || insLower.includes('bcbs')) {
          acceptsInsurance = docNameLower.includes('sarah') || docNameLower.includes('michael');
        } else if (insLower.includes('aetna')) {
          acceptsInsurance = docNameLower.includes('john') || docNameLower.includes('emily');
        } else if (insLower.includes('cigna')) {
          acceptsInsurance = docNameLower.includes('emily') || docNameLower.includes('michael');
        } else {
          acceptsInsurance = true; // Default match for generic insurance query
        }

        if (acceptsInsurance) {
          score += 15;
          breakdowns.insurance = true;
        }
      }

      // 5. Care Type (Video vs In Person) (15%)
      if (!type) {
        score += 15;
      } else {
        const preferredType = type.toUpperCase(); // VIDEO or IN_PERSON
        const docLocation = doc.clinic?.location || '';
        const isOnlineDoc = docLocation.toLowerCase().includes('online') || docLocation.toLowerCase().includes('remote');
        
        if (preferredType === 'VIDEO' && isOnlineDoc) {
          score += 15;
        } else if (preferredType === 'IN_PERSON' && !isOnlineDoc) {
          score += 15;
        } else {
          score += 8; // partial score for cross-type match
        }
      }

      // Assign dynamic communication style to doctors
      if (doc.user.name.includes('Sarah')) {
        breakdowns.style = 'Compassionate & Listening';
      } else if (doc.user.name.includes('John')) {
        breakdowns.style = 'Direct, Logical & Efficient';
      } else if (doc.user.name.includes('Emily')) {
        breakdowns.style = 'Warm, Patient & Family-friendly';
      } else {
        breakdowns.style = 'Detail-oriented & Evidence-based';
      }

      // Constrain score
      const finalScore = Math.min(100, Math.max(10, score));

      return {
        id: doc.id,
        name: doc.user.name,
        image: doc.user.image,
        experienceYears: doc.experienceYears,
        rating: doc.rating,
        price: docPrice,
        clinicName: doc.clinic?.name || 'CareMatch Telehealth',
        location: doc.clinic?.location || 'Remote',
        compatibilityScore: finalScore,
        breakdowns,
      };
    });

    // Sort by compatibility score
    scoredDoctors.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return NextResponse.json({
      success: true,
      specialtyName: specialty.name,
      reasoning,
      doctors: scoredDoctors,
    });
  } catch (error) {
    console.error('AI matching score calculator error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
