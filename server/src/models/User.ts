import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string; lastName: string; email: string;
  password: string; role: UserRole; isActive: boolean;
  lastLogin?: Date; refreshToken?: string;
  createdAt: Date; updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const schema = new Schema<IUser>({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 8, select: false },
  role:      { type: String, enum: ['SUPER_ADMIN','PROFILE_OWNER','EDITOR'], default: 'EDITOR' },
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String, select: false },
}, { timestamps: true, toJSON: { transform(_, ret: Record<string,unknown>) { delete ret['password']; delete ret['refreshToken']; return ret; } } });

schema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
schema.methods.comparePassword = function(candidate: string) { return bcrypt.compare(candidate, this.password); };
schema.index({ email: 1 });
export const User = mongoose.model<IUser>('User', schema);
