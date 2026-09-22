import mongoose, { Document, Schema } from 'mongoose';

export interface IProfile extends Document {
  _id: mongoose.Types.ObjectId;
  title?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  profilePhoto?: string;
  profilePhotoPublicId?: string;
  professionalTitle?: string;
  currentPosition?: string;
  department?: string;
  faculty?: string;
  institution?: string;
  shortBio?: string;
  biography?: string;
  researchStatement?: string;
  careerSummary?: string;
  email?: string;
  phone?: string;
  office?: string;
  address?: string;
  country?: string;
  orcid?: string;
  profileType?: string;
  cvUrl?: string;
  cvPublicId?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    title: { type: String, trim: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    profilePhoto: { type: String },
    profilePhotoPublicId: { type: String },
    professionalTitle: { type: String, trim: true },
    currentPosition: { type: String, trim: true },
    department: { type: String, trim: true },
    faculty: { type: String, trim: true },
    institution: { type: String, trim: true },
    shortBio: { type: String, maxlength: 500 },
    biography: { type: String },
    researchStatement: { type: String },
    careerSummary: { type: String },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    office: { type: String, trim: true },
    address: { type: String, trim: true },
    country: { type: String, trim: true },
    orcid: { type: String, trim: true },
    profileType: { type: String, trim: true, default: 'Academic' },
    cvUrl: { type: String },
    cvPublicId: { type: String },
    visibility: { type: String, enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
  },
  { timestamps: true }
);

export const Profile = mongoose.model<IProfile>('Profile', profileSchema);
