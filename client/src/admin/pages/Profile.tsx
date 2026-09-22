import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminGetProfile, adminUpsertProfile } from '../../services/admin';
import RichTextEditor from '../../components/common/RichTextEditor';
import AdminPageHeader from '../components/AdminPageHeader';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';

export default function Profile() {
  const queryClient = useQueryClient();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data: profile } = useQuery({ queryKey: ['admin', 'profile'], queryFn: adminGetProfile });

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: '', firstName: '', middleName: '', lastName: '', displayName: '',
      professionalTitle: '', currentPosition: '', department: '', faculty: '',
      institution: '', shortBio: '', biography: '', researchStatement: '',
      careerSummary: '', email: '', phone: '', office: '', address: '',
      country: '', orcid: '', profileType: 'Academic', visibility: 'PUBLIC',
    },
  });

  const biographyVal = watch('biography');
  const researchStmtVal = watch('researchStatement');
  const careerSummaryVal = watch('careerSummary');

  useEffect(() => {
    if (profile) {
      Object.entries(profile).forEach(([k, v]) => {
        if (v !== undefined && v !== null) setValue(k as any, String(v));
      });
      if (profile.profilePhoto) setPhotoPreview(profile.profilePhoto);
    }
  }, [profile, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: (fd: FormData) => adminUpsertProfile(fd),
    onSuccess: () => {
      toast.success('Profile saved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const onSubmit = (data: any) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)); });
    if (photoFile) fd.append('photo', photoFile);
    mutate(fd);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const fields = [
    { id: 'title', label: 'Title', type: 'text' },
    { id: 'firstName', label: 'First Name *', type: 'text' },
    { id: 'middleName', label: 'Middle Name', type: 'text' },
    { id: 'lastName', label: 'Last Name *', type: 'text' },
    { id: 'displayName', label: 'Display Name *', type: 'text' },
    { id: 'professionalTitle', label: 'Professional Title', type: 'text' },
    { id: 'currentPosition', label: 'Current Position', type: 'text' },
    { id: 'department', label: 'Department', type: 'text' },
    { id: 'faculty', label: 'Faculty', type: 'text' },
    { id: 'institution', label: 'Institution', type: 'text' },
    { id: 'email', label: 'Email', type: 'email' },
    { id: 'phone', label: 'Phone', type: 'tel' },
    { id: 'office', label: 'Office', type: 'text' },
    { id: 'address', label: 'Address', type: 'text' },
    { id: 'country', label: 'Country', type: 'text' },
    { id: 'orcid', label: 'ORCID', type: 'text' },
    { id: 'profileType', label: 'Profile Type', type: 'text' },
  ];

  return (
    <div>
      <AdminPageHeader title="Profile" subtitle="Manage your academic profile information" />
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Photo */}
          <div className="card p-6">
            <h2 className="font-semibold text-secondary-900 mb-4">Profile Photo</h2>
            <div className="flex items-center gap-6">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover border-4 border-secondary-100" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-400">
                  <Upload className="w-8 h-8" />
                </div>
              )}
              <div>
                <label htmlFor="photo-upload" className="btn-secondary btn-sm cursor-pointer">
                  <Upload className="w-4 h-4" /> Upload Photo
                </label>
                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
                <p className="text-xs text-secondary-400 mt-1">JPG, PNG, WebP up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="card p-6">
            <h2 className="font-semibold text-secondary-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(({ id, label, type }) => (
                <div key={id} className={`form-group ${id === 'address' || id === 'currentPosition' ? 'sm:col-span-2' : ''}`}>
                  <label htmlFor={id} className="form-label">{label}</label>
                  <input id={id} type={type} {...register(id as any)} className="form-input" />
                </div>
              ))}
            </div>
          </div>

          {/* Short Bio */}
          <div className="card p-6">
            <div className="form-group">
              <label htmlFor="shortBio" className="form-label">Short Bio (max 500 chars)</label>
              <textarea id="shortBio" {...register('shortBio')} rows={3} className="form-textarea" maxLength={500} />
            </div>
          </div>

          {/* Biography */}
          <div className="card p-6 space-y-5">
            <div>
              <label className="form-label">Biography</label>
              <RichTextEditor value={biographyVal} onChange={(v) => setValue('biography', v)} placeholder="Write your biography…" />
            </div>
            <div>
              <label className="form-label">Research Statement</label>
              <RichTextEditor value={researchStmtVal} onChange={(v) => setValue('researchStatement', v)} placeholder="Describe your research vision…" />
            </div>
            <div>
              <label className="form-label">Career Summary</label>
              <RichTextEditor value={careerSummaryVal} onChange={(v) => setValue('careerSummary', v)} placeholder="Summarise your career…" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-secondary-900">Visibility</h2>
            <div className="form-group">
              <label htmlFor="visibility" className="form-label">Profile Visibility</label>
              <select id="visibility" {...register('visibility')} className="form-select">
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
