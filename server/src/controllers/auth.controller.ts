import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import supabase from '../lib/supabase';
import { AuthRequest } from '../types';
import {
  generateAccessToken, generateRefreshToken,
  verifyRefreshToken, cookieOptions,
  ACCESS_TOKEN_COOKIE_MAX_AGE, REFRESH_TOKEN_COOKIE_MAX_AGE,
} from '../utils/jwt';
import { createAuditLog } from '../services/audit';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      await createAuditLog({ action: 'FAILED_LOGIN', entity: 'User', details: { email }, req });
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await supabase.from('users').update({
      refresh_token: refreshToken,
      last_login: new Date().toISOString(),
    }).eq('id', user.id);

    await createAuditLog({ action: 'LOGIN', entity: 'User', entityId: user.id, user: payload, req });

    res
      .cookie('accessToken',  accessToken,  cookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE))
      .cookie('refreshToken', refreshToken, cookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE))
      .json({
        message: 'Login successful',
        user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, role: user.role },
      });
  } catch (err) { next(err); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      await supabase.from('users').update({ refresh_token: null }).eq('id', req.user.userId);
      await createAuditLog({ action: 'LOGOUT', entity: 'User', entityId: req.user.userId, user: req.user, req });
    }
    res.clearCookie('accessToken').clearCookie('refreshToken').json({ message: 'Logged out' });
  } catch (err) { next(err); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) { res.status(401).json({ message: 'Refresh token required' }); return; }

    const decoded = verifyRefreshToken(token);

    const { data: user } = await supabase
      .from('users')
      .select('id, email, role, refresh_token, is_active')
      .eq('id', decoded.userId)
      .maybeSingle();

    if (!user || user.refresh_token !== token || !user.is_active) {
      res.status(401).json({ message: 'Invalid refresh token' }); return;
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const newAccess  = generateAccessToken(payload);
    const newRefresh = generateRefreshToken(payload);

    await supabase.from('users').update({ refresh_token: newRefresh }).eq('id', user.id);

    res
      .cookie('accessToken',  newAccess,  cookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE))
      .cookie('refreshToken', newRefresh, cookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE))
      .json({ message: 'Token refreshed' });
  } catch (err) { next(err); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, is_active, last_login, created_at')
      .eq('id', req.user!.userId)
      .maybeSingle();

    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json({ user });
  } catch (err) { next(err); }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { data: user } = await supabase.from('users').select('password_hash').eq('id', req.user!.userId).maybeSingle();
    if (!user) { res.status(404).json({ message: 'Not found' }); return; }
    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
      res.status(400).json({ message: 'Current password is incorrect' }); return;
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await supabase.from('users').update({ password_hash: hash }).eq('id', req.user!.userId);
    res.json({ message: 'Password changed' });
  } catch (err) { next(err); }
};
