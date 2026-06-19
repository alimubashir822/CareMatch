import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'carematch_super_secret_jwt_key_2026';
const key = new TextEncoder().encode(JWT_SECRET);
const SESSION_COOKIE_NAME = 'carematch_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: {
  userId: string;
  email: string;
  role: string;
  name: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    // Get specific profile details based on role
    let profileDetails: any = null;
    if (user.role === 'PATIENT') {
      profileDetails = await prisma.patient.findUnique({
        where: { userId: user.id },
      });
    } else if (user.role === 'DOCTOR') {
      profileDetails = await prisma.doctor.findUnique({
        where: { userId: user.id },
        include: { specialty: true, clinic: true },
      });
    } else if (user.role === 'CLINIC') {
      profileDetails = await prisma.clinic.findUnique({
        where: { userId: user.id },
      });
    }

    return {
      ...user,
      profile: profileDetails,
    };
  } catch (error) {
    console.error('Error fetching user from session:', error);
    return null;
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
}
