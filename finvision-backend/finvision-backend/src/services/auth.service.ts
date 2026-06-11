import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { RegisterBody, LoginBody, AuthResponse, UserProfile } from '../types';

// ── Register ──────────────────────────────────────────────────────────────────
export async function registerUser(body: RegisterBody): Promise<AuthResponse> {
  const { email, password, full_name } = body;

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });

  if (authError || !authData.user) {
    return { success: false, message: authError?.message || 'Registration failed' };
  }

  // 2. Insert profile into users table
  const { error: profileError } = await supabase.from('users').insert({
    id:         authData.user.id,
    email,
    full_name,
    role:       'user',
    created_at: new Date().toISOString(),
  });

  if (profileError) {
    console.error('Profile insert error:', profileError.message);
  }

  // 3. Generate JWT
  const token = generateToken(authData.user.id, email, 'user');

  const user: UserProfile = {
    id:         authData.user.id,
    email,
    full_name,
    role:       'user',
    created_at: authData.user.created_at,
  };

  return {
    success: true,
    message: 'Registration successful',
    data: { user, access_token: token },
  };
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function loginUser(body: LoginBody): Promise<AuthResponse> {
  const { email, password } = body;

  // 1. Sign in via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { success: false, message: 'Invalid email or password' };
  }

  // 2. Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  const full_name = profile?.full_name ?? authData.user.user_metadata?.full_name ?? 'User';
  const role      = profile?.role ?? 'user';

  // 3. Generate JWT
  const token = generateToken(authData.user.id, email, role);

  const user: UserProfile = {
    id:         authData.user.id,
    email,
    full_name,
    role,
    created_at: authData.user.created_at,
  };

  return {
    success: true,
    message: 'Login successful',
    data: { user, access_token: token },
  };
}

// ── Get Profile ───────────────────────────────────────────────────────────────
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

// ── JWT Helper ────────────────────────────────────────────────────────────────
function generateToken(userId: string, email: string, role: string): string {
  const secret = process.env.JWT_SECRET as string;
  return jwt.sign({ userId, email, role }, secret, { expiresIn: '7d' });
}
