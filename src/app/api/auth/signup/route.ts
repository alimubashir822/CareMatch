import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, ...profileData } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    if (!['PATIENT', 'DOCTOR', 'CLINIC'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const normalizedEmail = email.toLowerCase();

    // Perform database transaction to create user and profile
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name,
          role,
          image: role === 'DOCTOR' 
            ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=250&h=250&q=80'
            : role === 'PATIENT' 
              ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'
              : null,
        },
      });

      if (role === 'PATIENT') {
        await tx.patient.create({
          data: {
            userId: user.id,
            insuranceProvider: profileData.insuranceProvider || 'None',
            insurancePolicyNum: profileData.insurancePolicyNum || 'None',
          },
        });
      } else if (role === 'DOCTOR') {
        // Fetch a default specialty if none specified
        let specId = profileData.specialtyId;
        if (!specId) {
          const firstSpecialty = await tx.specialty.findFirst();
          specId = firstSpecialty?.id || '';
        }

        // Fetch a default clinic if none specified
        let clinicId = profileData.clinicId;
        if (!clinicId) {
          const firstClinic = await tx.clinic.findFirst();
          clinicId = firstClinic?.id || null;
        }

        const doctor = await tx.doctor.create({
          data: {
            userId: user.id,
            specialtyId: specId,
            clinicId: clinicId,
            bio: profileData.bio || 'Hello, I am a healthcare provider.',
            experienceYears: Number(profileData.experienceYears) || 0,
            pricePerConsultation: Number(profileData.pricePerConsultation) || 50.0,
            languages: profileData.languages || 'English',
            education: JSON.stringify([]),
            certifications: JSON.stringify([]),
            isApproved: false, // Wait for admin approval
            rating: 0.0,
          },
        });

        // Initialize doctor availabilities for working days (Monday-Friday)
        for (let day = 1; day <= 5; day++) {
          await tx.availability.create({
            data: {
              doctorId: doctor.id,
              dayOfWeek: day,
              slots: '09:00 AM,10:00 AM,11:00 AM,02:00 PM,03:00 PM,04:00 PM',
            },
          });
        }

        // Initialize analytics
        await tx.analytics.create({
          data: {
            doctorId: doctor.id,
            profileViews: 0,
            bookingsCount: 0,
            conversions: 0.0,
            month: '2026-06',
          },
        });

        // Initialize starter subscription
        await tx.subscription.create({
          data: {
            doctorId: doctor.id,
            plan: 'STARTER',
            status: 'ACTIVE',
            price: 19.0,
            nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      } else if (role === 'CLINIC') {
        await tx.clinic.create({
          data: {
            userId: user.id,
            name: profileData.clinicName || `${name} Center`,
            address: profileData.address || 'Address pending',
            location: profileData.location || 'Location pending',
            rating: 0.0,
          },
        });
      }

      // Audit log creation
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_SIGNUP',
          details: `User registered with email ${user.email} and role ${user.role}`,
        },
      });

      return user;
    });

    const token = await signToken({
      userId: result.id,
      email: result.email,
      role: result.role,
      name: result.name,
    });

    const cookieStore = await cookies();
    cookieStore.set('carematch_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        image: result.image,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
