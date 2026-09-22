import mongoose, { Document, Schema } from 'mongoose';
import { AuditAction, UserRole } from '../types';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  userRole?: UserRole;
  action: AuditAction;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const schema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    userRole: { type: String },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH',
        'ARCHIVE', 'RESTORE', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN',
      ],
    },
    entity: { type: String, required: true },
    entityId: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

schema.index({ userId: 1 });
schema.index({ action: 1 });
schema.index({ entity: 1 });
schema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', schema);
