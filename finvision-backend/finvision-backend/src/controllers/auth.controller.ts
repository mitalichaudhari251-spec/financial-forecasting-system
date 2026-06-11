import { Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, loginUser, getUserProfile } from '../services/auth.service';
import { AuthRequest } from '../types';

// ── Validation schemas ────────────────────────────────────────────────────────
const RegisterSchema = z.object({
  email:     z.string().email('Invalid email'),
  password:  z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name is required'),
});

const LoginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// ── Register ──────────────────────────────────────────────────────────────────
export async function register(req: Request, res: Response): Promise<void> {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  try {
    const result = await registerUser(parsed.data);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message });
      return;
    }
    res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(500).json({ success: false, error: message });
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  try {
    const result = await loginUser(parsed.data);
    if (!result.success) {
      res.status(401).json({ success: false, error: result.message });
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ success: false, error: message });
  }
}

// ── Get Profile ───────────────────────────────────────────────────────────────
export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const profile = await getUserProfile(userId);
    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch profile';
    res.status(500).json({ success: false, error: message });
  }
}
