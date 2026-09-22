import { Request, Response, NextFunction } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { AuthRequest } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { createAuditLog } from '../services/audit';
import { sendContactNotification, sendContactAutoReply } from '../services/email';

export const submitContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    const doc = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send notifications (non-blocking)
    sendContactNotification({ name, email, subject, message }).catch((e) =>
      console.error('[Email] contact notification failed:', e)
    );
    sendContactAutoReply(email, name).catch((e) =>
      console.error('[Email] auto-reply failed:', e)
    );

    res.status(201).json({
      message: 'Your message has been sent. Thank you!',
      id: doc._id,
    });
  } catch (err) {
    next(err);
  }
};

export const adminGetMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = String(status);

    const [data, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ContactMessage.countDocuments(filter),
    ]);

    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
};

export const adminGetMessageById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doc = await ContactMessage.findById((req.params.id as string)).lean();
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }

    // Auto-mark as Read
    if (doc.status === 'New') {
      await ContactMessage.findByIdAndUpdate((req.params.id as string), { status: 'Read' });
    }

    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateMessageStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const update: Record<string, unknown> = { status };
    if (status === 'Replied') update.repliedAt = new Date();

    const doc = await ContactMessage.findByIdAndUpdate((req.params.id as string), update, { new: true });
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }

    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'ContactMessage', entityId: (req.params.id as string), req });
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
};

export const adminDeleteMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doc = await ContactMessage.findByIdAndDelete((req.params.id as string));
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'ContactMessage', entityId: (req.params.id as string), req });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

