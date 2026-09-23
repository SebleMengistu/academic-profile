import { Request, Response, NextFunction } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { AuthRequest } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { createAuditLog } from '../services/audit';
import { sendContactNotification, sendContactAutoReply } from '../services/email';

export const submitContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;
    const doc = await ContactMessage.create({
      name, email, subject: subject ?? null, message,
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });

    sendContactNotification({ name, email, subject, message }).catch(console.error);
    sendContactAutoReply(email, name).catch(console.error);

    res.status(201).json({ message: 'Your message has been sent. Thank you!', id: doc._id.toString() });
  } catch (err) { next(err); }
};

export const adminGetMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = String(req.query.status);
    const [data, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ContactMessage.countDocuments(filter),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

export const adminGetMessageById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const doc = await ContactMessage.findById(id);
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    if (doc.status === 'New') {
      doc.status = 'Read';
      const saved = await doc.save();
      res.json({ data: saved });
      return;
    }
    res.json({ data: doc });
  } catch (err) { next(err); }
};

export const adminUpdateMessageStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const update: Record<string, unknown> = { status };
    if (status === 'Replied') update.repliedAt = new Date();
    const doc = await ContactMessage.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'UPDATE', entity: 'ContactMessage', entityId: id, req });
    res.json({ data: doc });
  } catch (err) { next(err); }
};

export const adminDeleteMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const doc = await ContactMessage.findByIdAndDelete(id);
    if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
    await createAuditLog({ user: req.user, action: 'DELETE', entity: 'ContactMessage', entityId: id, req });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};