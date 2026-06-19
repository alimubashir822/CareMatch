export interface QualityMetrics {
  responseTime: string;
  satisfaction: string;
  followUpRate: string;
  style: string;
}

export function getDoctorQualityMetrics(doctorName: string): QualityMetrics {
  const name = doctorName.toLowerCase();
  if (name.includes('sarah')) {
    return {
      responseTime: 'Excellent (~10 mins)',
      satisfaction: '98%',
      followUpRate: 'High (95%)',
      style: 'Compassionate & Listening',
    };
  } else if (name.includes('john')) {
    return {
      responseTime: 'Outstanding (~5 mins)',
      satisfaction: '96%',
      followUpRate: 'Exceptional (97%)',
      style: 'Direct, Logical & Efficient',
    };
  } else if (name.includes('emily')) {
    return {
      responseTime: 'Very Good (~15 mins)',
      satisfaction: '99%',
      followUpRate: 'High (96%)',
      style: 'Warm, Patient & Family-friendly',
    };
  } else if (name.includes('michael')) {
    return {
      responseTime: 'Excellent (~8 mins)',
      satisfaction: '97%',
      followUpRate: 'High (94%)',
      style: 'Detail-oriented & Evidence-based',
    };
  } else {
    return {
      responseTime: 'Good (~25 mins)',
      satisfaction: '95%',
      followUpRate: 'Consistent (92%)',
      style: 'Detail-oriented & Clinical',
    };
  }
}

export function calculateCompatibility(
  doc: {
    user: { name: string };
    specialty: { name: string };
    pricePerConsultation: number;
    clinic?: { location: string } | null;
  },
  params: {
    specialty?: string;
    location?: string;
    insurance?: string;
    maxPrice?: string;
    type?: string;
  }
): number {
  let score = 0;

  // 1. Specialty Alignment (40%)
  if (params.specialty) {
    if (doc.specialty.name.toLowerCase() === params.specialty.toLowerCase()) {
      score += 40;
    } else {
      score += 10;
    }
  } else {
    score += 40; // Default full credit if no specialty preference specified
  }

  // 2. Budget Capping (15%)
  const docPrice = doc.pricePerConsultation;
  if (!params.maxPrice) {
    score += 15;
  } else {
    const budgetLimit = parseFloat(params.maxPrice);
    if (!isNaN(budgetLimit)) {
      if (docPrice <= budgetLimit) {
        score += 15;
      } else {
        score += Math.max(0, Math.round(15 * (budgetLimit / docPrice)));
      }
    } else {
      score += 15;
    }
  }

  // 3. Location Matching (15%)
  const docLocation = doc.clinic?.location || '';
  if (!params.location) {
    score += 15;
  } else {
    const locLower = params.location.toLowerCase();
    if (locLower === 'remote' || locLower === 'online') {
      if (docLocation.toLowerCase().includes('remote') || docLocation.toLowerCase().includes('online')) {
        score += 15;
      } else {
        score += 10; // Clinic might support telehealth
      }
    } else if (docLocation.toLowerCase().includes(locLower)) {
      score += 15;
    } else {
      score += 5; // Mismatched location
    }
  }

  // 4. Insurance Intelligence (15%)
  if (!params.insurance || params.insurance.toLowerCase() === 'none') {
    score += 15;
  } else {
    const insLower = params.insurance.toLowerCase();
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
    } else {
      score += 5; // Mismatched insurance
    }
  }

  // 5. Care Type Preference (15%)
  if (!params.type) {
    score += 15;
  } else {
    const preferredType = params.type.toUpperCase(); // VIDEO or IN_PERSON
    const isOnlineDoc = docLocation.toLowerCase().includes('online') || docLocation.toLowerCase().includes('remote');
    
    if (preferredType === 'VIDEO' && isOnlineDoc) {
      score += 15;
    } else if (preferredType === 'IN_PERSON' && !isOnlineDoc) {
      score += 15;
    } else {
      score += 8; // Partial score
    }
  }

  return Math.min(100, Math.max(10, score));
}
