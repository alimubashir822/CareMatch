const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing database...');
  await prisma.auditLog.deleteMany({});
  await prisma.analytics.deleteMany({});
  await prisma.waitlist.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.specialty.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.clinic.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding database...');

  const hashedPassword = bcrypt.hashSync('password123', 10);

  // 1. Create Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@carematch.com',
      passwordHash: hashedPassword,
      name: 'CareMatch Administrator',
      role: 'ADMIN',
    },
  });
  console.log('Created Admin:', adminUser.email);

  // 2. Create Patients
  const patientUser1 = await prisma.user.create({
    data: {
      email: 'patient@carematch.com',
      passwordHash: hashedPassword,
      name: 'Sarah Connor',
      role: 'PATIENT',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
    },
  });
  const patient1 = await prisma.patient.create({
    data: {
      userId: patientUser1.id,
      dateOfBirth: new Date('1990-05-15'),
      gender: 'Female',
      insuranceProvider: 'Blue Cross Blue Shield',
      insurancePolicyNum: 'BCBS-987654321',
      medicalHistory: JSON.stringify({
        allergies: ['Penicillin'],
        chronicConditions: ['None'],
        pastSurgeries: ['Appendectomy (2018)']
      }),
    },
  });

  const patientUser2 = await prisma.user.create({
    data: {
      email: 'john@carematch.com',
      passwordHash: hashedPassword,
      name: 'John Doe',
      role: 'PATIENT',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    },
  });
  const patient2 = await prisma.patient.create({
    data: {
      userId: patientUser2.id,
      dateOfBirth: new Date('1985-08-20'),
      gender: 'Male',
      insuranceProvider: 'Aetna',
      insurancePolicyNum: 'AET-123456789',
      medicalHistory: JSON.stringify({
        allergies: ['Peanuts'],
        chronicConditions: ['Hypertension'],
        pastSurgeries: ['None']
      }),
    },
  });
  console.log('Created Patients: Sarah Connor, John Doe');

  // 3. Create Specialties
  const specialtiesData = [
    { name: 'Dermatology', icon: 'Sparkles', description: 'Skin, hair, nails, and related diseases diagnostics and treatments.' },
    { name: 'Cardiology', icon: 'Heart', description: 'Heart diseases, cardiovascular systems diagnostics, and treatments.' },
    { name: 'Pediatrics', icon: 'Baby', description: 'Medical care of infants, children, and adolescents.' },
    { name: 'Psychiatry', icon: 'Brain', description: 'Diagnosis, treatment, and prevention of mental, emotional, and behavioral disorders.' },
    { name: 'General Medicine', icon: 'Stethoscope', description: 'Primary healthcare, general physical health exams, and treatments.' },
  ];

  const specialties = {};
  for (const s of specialtiesData) {
    const spec = await prisma.specialty.create({ data: s });
    specialties[s.name] = spec;
  }
  console.log('Created Specialties:', Object.keys(specialties).join(', '));

  // 4. Create Clinics
  const clinicUser1 = await prisma.user.create({
    data: { email: 'metro@clinic.com', passwordHash: hashedPassword, name: 'Metro Health Clinic Admin', role: 'CLINIC' }
  });
  const clinic1 = await prisma.clinic.create({
    data: { userId: clinicUser1.id, name: 'Metro Health Center', address: '123 Health Ave, New York, NY', location: 'New York, NY', rating: 4.8 }
  });

  const clinicUser2 = await prisma.user.create({
    data: { email: 'wellness@clinic.com', passwordHash: hashedPassword, name: 'Downtown Wellness Group Admin', role: 'CLINIC' }
  });
  const clinic2 = await prisma.clinic.create({
    data: { userId: clinicUser2.id, name: 'Downtown Wellness Group', address: '456 Wellness Blvd, Boston, MA', location: 'Boston, MA', rating: 4.7 }
  });

  const clinicUser3 = await prisma.user.create({
    data: { email: 'telehealth@carematch.com', passwordHash: hashedPassword, name: 'CareMatch Telehealth Network Admin', role: 'CLINIC' }
  });
  const clinic3 = await prisma.clinic.create({
    data: { userId: clinicUser3.id, name: 'CareMatch Telehealth Network', address: 'Online Virtual Services', location: 'Remote / Online', rating: 4.9 }
  });
  console.log('Created Clinics: Metro Health Center, Downtown Wellness Group, CareMatch Telehealth Network');

  // 5. Create Doctors
  const doctorsData = [
    {
      email: 'dr.sarah@carematch.com',
      name: 'Dr. Sarah Ahmed',
      specialty: 'Dermatology',
      clinic: clinic1,
      bio: 'Dr. Sarah Ahmed is a board-certified dermatologist with over 15 years of experience in clinical and cosmetic dermatology. She specializes in skin cancer screenings, acne treatments, and anti-aging therapies.',
      experienceYears: 15,
      pricePerConsultation: 95.0,
      languages: 'English, Urdu, Hindi',
      education: JSON.stringify([
        { degree: 'Doctor of Medicine (MD)', school: 'Yale School of Medicine', year: '2010' },
        { degree: 'Residency in Dermatology', school: 'NYU Langone Health', year: '2013' }
      ]),
      certifications: JSON.stringify([
        'American Board of Dermatology Certified',
        'Fellow of the American Academy of Dermatology (FAAD)'
      ]),
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=250&h=250&q=80',
      isApproved: true,
      rating: 4.9
    },
    {
      email: 'dr.john@carematch.com',
      name: 'Dr. John Smith',
      specialty: 'Cardiology',
      clinic: clinic2,
      bio: 'Dr. John Smith is a leading cardiologist dedicated to delivering comprehensive cardiovascular care. He has published over 30 research articles on preventative cardiology and heart failure management.',
      experienceYears: 20,
      pricePerConsultation: 150.0,
      languages: 'English',
      education: JSON.stringify([
        { degree: 'Doctor of Medicine (MD)', school: 'Harvard Medical School', year: '2005' },
        { degree: 'Fellowship in Cardiovascular Medicine', school: 'Johns Hopkins Hospital', year: '2009' }
      ]),
      certifications: JSON.stringify([
        'Board Certified in Cardiovascular Disease',
        'American College of Cardiology Fellow (FACC)'
      ]),
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&h=250&q=80',
      isApproved: true,
      rating: 4.8
    },
    {
      email: 'dr.emily@carematch.com',
      name: 'Dr. Emily White',
      specialty: 'Pediatrics',
      clinic: clinic2,
      bio: 'Dr. Emily White provides compassionate pediatric care for children of all ages. She focus on preventive care, child development guidance, and family education to ensure healthy growing years.',
      experienceYears: 8,
      pricePerConsultation: 80.0,
      languages: 'English, Spanish',
      education: JSON.stringify([
        { degree: 'Doctor of Medicine (MD)', school: 'Stanford University School of Medicine', year: '2017' },
        { degree: 'Residency in Pediatrics', school: 'Boston Children Hospital', year: '2020' }
      ]),
      certifications: JSON.stringify([
        'American Board of Pediatrics Certified',
        'Licensed Pediatrician in MA'
      ]),
      image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=250&h=250&q=80',
      isApproved: true,
      rating: 4.7
    },
    {
      email: 'dr.michael@carematch.com',
      name: 'Dr. Michael Green',
      specialty: 'Psychiatry',
      clinic: clinic3,
      bio: 'Dr. Michael Green specializes in cognitive behavioral therapy, anxiety disorders, and depression management. He is a strong advocate for digital mental health services and virtual counseling sessions.',
      experienceYears: 12,
      pricePerConsultation: 110.0,
      languages: 'English, French',
      education: JSON.stringify([
        { degree: 'Doctor of Medicine (MD)', school: 'Columbia University Vagelos College of Physicians and Surgeons', year: '2012' },
        { degree: 'Residency in Psychiatry', school: 'Columbia Medical Center', year: '2016' }
      ]),
      certifications: JSON.stringify([
        'American Board of Psychiatry and Neurology Certified',
        'Certified Cognitive Behavioral Therapist'
      ]),
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=250&h=250&q=80',
      isApproved: true,
      rating: 4.95
    }
  ];

  const doctors = [];
  for (const d of doctorsData) {
    const user = await prisma.user.create({
      data: {
        email: d.email,
        passwordHash: hashedPassword,
        name: d.name,
        role: 'DOCTOR',
        image: d.image,
      }
    });

    const doc = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialtyId: specialties[d.specialty].id,
        clinicId: d.clinic.id,
        bio: d.bio,
        experienceYears: d.experienceYears,
        pricePerConsultation: d.pricePerConsultation,
        languages: d.languages,
        education: d.education,
        certifications: d.certifications,
        isApproved: d.isApproved,
        rating: d.rating,
      }
    });
    doctors.push({ ...doc, user });

    // Add Availabilities for Sunday to Saturday (except Sunday/Saturday for some, full for others)
    for (let day = 1; day <= 5; day++) {
      await prisma.availability.create({
        data: {
          doctorId: doc.id,
          dayOfWeek: day,
          slots: '09:00 AM,10:00 AM,11:00 AM,02:00 PM,03:00 PM,04:00 PM',
        }
      });
    }

    // Add Doctor Analytics (Growth tools)
    await prisma.analytics.create({
      data: {
        doctorId: doc.id,
        profileViews: 120 + d.experienceYears * 25,
        bookingsCount: 45 + d.experienceYears * 5,
        conversions: parseFloat((30 + Math.random() * 15).toFixed(1)),
        month: '2026-06'
      }
    });

    // Add Doctor Subscriptions
    await prisma.subscription.create({
      data: {
        doctorId: doc.id,
        plan: d.experienceYears > 12 ? 'PROFESSIONAL' : 'STARTER',
        status: 'ACTIVE',
        price: d.experienceYears > 12 ? 49.0 : 19.0,
        nextBilling: new Date('2026-07-19')
      }
    });
  }
  console.log('Created Doctors and their availabilities/analytics/subscriptions.');

  // 6. Create past and upcoming appointments
  const docSarah = doctors[0]; // Sarah Ahmed
  const docJohn = doctors[1]; // John Smith
  const docEmily = doctors[2]; // Emily White

  // Past Appointment 1 (Sarah Connor with Sarah Ahmed) -> Reviews
  const apt1 = await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: docSarah.id,
      date: new Date('2026-06-10T10:00:00Z'),
      timeSlot: '10:00 AM',
      status: 'COMPLETED',
      type: 'VIDEO',
      serviceName: 'General Dermatology Consultation',
      price: docSarah.pricePerConsultation,
      notes: 'Initial check-up for facial skin redness and rash. Patient reported irritation after using a new cleanser.',
    }
  });

  await prisma.payment.create({
    data: {
      appointmentId: apt1.id,
      amount: docSarah.pricePerConsultation,
      status: 'PAID',
      transactionId: 'ch_mock_111111111111',
      invoiceUrl: '#',
    }
  });

  await prisma.review.create({
    data: {
      appointmentId: apt1.id,
      patientId: patient1.id,
      doctorId: docSarah.id,
      rating: 5,
      comment: 'Dr. Sarah was extremely patient and detailed. She diagnosed my dermatitis and prescribed a gentle lotion that cured the redness in 3 days! Highly recommend.',
      reply: 'Thank you Sarah! I am glad the treatment worked well for your skin. Remember to keep using the gentle cleanser we discussed.',
    }
  });

  // Past Appointment 2 (John Doe with John Smith) -> Reviews
  const apt2 = await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      doctorId: docJohn.id,
      date: new Date('2026-06-12T14:00:00Z'),
      timeSlot: '02:00 PM',
      status: 'COMPLETED',
      type: 'IN_PERSON',
      serviceName: 'Cardiovascular Assessment',
      price: docJohn.pricePerConsultation,
      notes: 'Follow up check on blood pressure and heart rate monitoring. Hypertension is currently well managed with lifestyle changes.',
    }
  });

  await prisma.payment.create({
    data: {
      appointmentId: apt2.id,
      amount: docJohn.pricePerConsultation,
      status: 'PAID',
      transactionId: 'ch_mock_222222222222',
      invoiceUrl: '#',
    }
  });

  await prisma.review.create({
    data: {
      appointmentId: apt2.id,
      patientId: patient2.id,
      doctorId: docJohn.id,
      rating: 5,
      comment: 'Excellent doctor. Explains complex cardiology terms in simple words and makes sure you understand the lifestyle adjustments required.',
      reply: 'Thanks John! Your blood pressure looks stable. Keep up the active walking routine.',
    }
  });

  // Upcoming Appointment 1 (Sarah Connor with John Smith - Tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const apt3 = await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: docJohn.id,
      date: tomorrow,
      timeSlot: '09:00 AM',
      status: 'CONFIRMED',
      type: 'VIDEO',
      serviceName: 'Heart Health Screening',
      price: docJohn.pricePerConsultation,
      notes: 'First time screening for baseline EKG review.',
    }
  });

  await prisma.payment.create({
    data: {
      appointmentId: apt3.id,
      amount: docJohn.pricePerConsultation,
      status: 'PAID',
      transactionId: 'ch_mock_333333333333',
      invoiceUrl: '#',
    }
  });

  // Upcoming Appointment 2 (John Doe with Emily White - In 3 days)
  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  inThreeDays.setHours(11, 0, 0, 0);

  const apt4 = await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      doctorId: docEmily.id,
      date: inThreeDays,
      timeSlot: '11:00 AM',
      status: 'PENDING',
      type: 'VIDEO',
      serviceName: 'Child Developmental Checkup',
      price: docEmily.pricePerConsultation,
      notes: 'Consultation for toddler growth and nutritional guidelines.',
    }
  });

  // 7. Seed documents (Healthcare Passport)
  await prisma.document.create({
    data: {
      patientId: patient1.id,
      doctorId: docSarah.id,
      name: 'Prescription_Dermatitis_Lotion.pdf',
      url: '#',
      type: 'PRESCRIPTION',
    }
  });

  await prisma.document.create({
    data: {
      patientId: patient1.id,
      name: 'Blood_Test_Report_June_2026.pdf',
      url: '#',
      type: 'LAB_REPORT',
    }
  });

  await prisma.document.create({
    data: {
      patientId: patient2.id,
      doctorId: docJohn.id,
      name: 'ECG_Baseline_Report_Smith.pdf',
      url: '#',
      type: 'LAB_REPORT',
    }
  });

  // 8. Seed some messages between John Doe and Dr. John Smith
  await prisma.message.create({
    data: {
      senderId: patientUser2.id,
      receiverId: docJohn.user.id,
      content: 'Hello Dr. Smith, I wanted to ask if I should continue taking the vitamins before our next ECG check.',
    }
  });

  await prisma.message.create({
    data: {
      senderId: docJohn.user.id,
      receiverId: patientUser2.id,
      content: 'Yes, John. Continue with the prescribed schedule. It will not interfere with our diagnostic tests.',
    }
  });

  // 9. Add a patient in waitlist for Dr. Sarah Ahmed
  await prisma.waitlist.create({
    data: {
      patientId: patient2.id,
      doctorId: docSarah.id,
      preferredDay: 2, // Tuesday
      status: 'WAITING',
    }
  });

  // 10. Seed initial audit log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      details: 'Populated initial CareMatch seed database: Admin, 4 Doctors, 2 Patients, 3 Clinics, 5 Specialties, and Mock Appointments.',
    }
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
