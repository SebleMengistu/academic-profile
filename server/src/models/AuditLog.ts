import mongoose, { Document, Schema } from 'mongoose';
export interface IAuditLog extends Document { _id: mongoose.Types.ObjectId; userId?: mongoose.Types.ObjectId; userEmail?: string; userRole?: string; action: string; entity: string; entityId?: string; details?: Record<string,unknown>; ipAddress?: string; userAgent?: string; createdAt: Date; }
const schema = new Schema<IAuditLog>({ userId: { type: Schema.Types.ObjectId, ref: 'User' }, userEmail: String, userRole: String, action: { type: String, required: true }, entity: { type: String, required: true }, entityId: String, details: { type: Schema.Types.Mixed }, ipAddress: String, userAgent: String }, { timestamps: { createdAt: true, updatedAt: false } });
schema.index({ userId: 1 }); schema.index({ action: 1 }); schema.index({ entity: 1 }); schema.index({ createdAt: -1 });
export const AuditLog = mongoose.model<IAuditLog>('AuditLog', schema);
