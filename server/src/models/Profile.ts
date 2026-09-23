import mongoose, { Document, Schema } from 'mongoose';

export interface IProfile extends Document {
  _id: mongoose.Types.ObjectId;
  title?: string; firstName: string; middleName?: string; lastName: string; displayName: string;
  profilePhoto?: string; profilePhotoPublicId?: string;
  professionalTitle?: string; currentPosition?: string; department?: string; faculty?: string; institution?: string;
  shortBio?: string; biography?: string; researchStatement?: string; careerSummary?: string;
  email?: string; phone?: string; office?: string; address?: string; country?: string;
  orcid?: string; profileType?: string; cvUrl?: string; cvPublicId?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  createdAt: Date; updatedAt: Date;
}

const schema = new Schema<IProfile>({
  title: String, firstName: { type: String, required: true }, middleName: String,
  lastName: { type: String, required: true }, displayName: { type: String, required: true },
  profilePhoto: String, profilePhotoPublicId: String,
  professionalTitle: String, currentPosition: String, department: String, faculty: String, institution: String,
  shortBio: { type: String, maxlength: 500 }, biography: String, researchStatement: String, careerSummary: String,
  email: String, phone: String, office: String, address: String, country: String,
  orcid: String, profileType: { type: String, default: 'Academic' }, cvUrl: String, cvPublicId: String,
  visibility: { type: String, enum: ['PUBLIC','PRIVATE'], default: 'PUBLIC' },
}, { timestamps: true });

export const Profile = mongoose.model<IProfile>('Profile', schema);
