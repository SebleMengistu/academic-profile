import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, cookieOptions, ACCESS_TOKEN_COOKIE_MAX_AGE, REFRESH_TOKEN_COOKIE_MAX_AGE } from '../utils/jwt';
import { createAuditLog } from '../services/audit';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      await createAuditLog({ action: 'FAILED_LOGIN', entity: 'User', details: { email }, req });
      res.status(401).json({ message: 'Invalid credentials' }); return;
    }
    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    user.refreshToken = refreshToken; user.lastLogin = new Date(); await user.save();
    await createAuditLog({ action: 'LOGIN', entity: 'User', entityId: user._id.toString(), user: payload, req });
    res.cookie('accessToken', accessToken, cookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE))
       .cookie('refreshToken', refreshToken, cookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE))
       .json({ message: 'Login successful', user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user.userId, { $unset: { refreshToken: 1 } });
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
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== token || !user.isActive) { res.status(401).json({ message: 'Invalid refresh token' }); return; }
    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const newAccess = generateAccessToken(payload);
    const newRefresh = generateRefreshToken(payload);
    user.refreshToken = newRefresh; await user.save();
    res.cookie('accessToken', newAccess, cookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE))
       .cookie('refreshToken', newRefresh, cookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE))
       .json({ message: 'Token refreshed' });
  } catch (err) { next(err); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) { res.status(404).json({ message: 'Not found' }); return; }
    res.json({ user });
  } catch (err) { next(err); }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!.userId).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      res.status(400).json({ message: 'Current password is incorrect' }); return;
    }
    user.password = newPassword; await user.save();
    res.json({ message: 'Password changed' });
  } catch (err) { next(err); }
};
