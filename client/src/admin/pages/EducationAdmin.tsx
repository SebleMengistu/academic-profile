import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SimpleCrudPage from '../components/SimpleCrudPage';
import { adminGetEducation, adminCreateEducation, adminUpdateEducation, adminDeleteEducation } from '../../services/admin';
import { Education } from '../../types';
import { formatDateRange } from '../../utils/formatters';
import { GraduationCap } from 'lucide-react';

function EducationForm({ item, onSubmit, isPending }: { item?: Education; onSubmit: (d: unknown) => void; isPending: boolean }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { degree: '', field: '', institution: '', location: '', country: '', startDate: '', completionDate: '', thesisTitle: '', thesisUrl: '', description: '', displayOrder: 0 } });
  useEffect(() => { if (item) reset({ ...item, startDate: item.startDate?.split('T')[0] || '', completionDate: item.completionDate?.split('T')[0] || '' }); }, [item, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group"><label className="form-label">Degree *</label><input {...register('degree')} className="form-input" required placeholder="PhD, MSc, MEng…" /></div>
        <div className="form-group"><label className="form-label">Field *</label><input {...register('field')} className="form-input" required /></div>
        <div className="form-group col-span-2"><label className="form-label">Institution *</label><input {...register('institution')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Location</label><input {...register('location')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Country</label><input {...register('country')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Start Date</label><input type="date" {...register('startDate')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Completion Date</label><input type="date" {...register('completionDate')} className="form-input" /></div>
        <div className="form-group col-span-2"><label className="form-label">Thesis Title</label><input {...register('thesisTitle')} className="form-input" /></div>
        <div className="form-group col-span-2"><label className="form-label">Thesis URL</label><input type="url" {...register('thesisUrl')} className="form-input" /></div>
      </div>
      <div className="form-group"><label className="form-label">Description</label><textarea {...register('description')} rows={2} className="form-textarea" /></div>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function EducationAdmin() {
  return (
    <SimpleCrudPage<Education>
      title="Education"
      queryKey={['admin', 'education']}
      fetchFn={adminGetEducation}
      createFn={adminCreateEducation}
      updateFn={adminUpdateEducation}
      deleteFn={adminDeleteEducation}
      emptyIcon={GraduationCap}
      columns={[
        { header: 'Degree', render: (e) => <span className="font-medium">{e.degree}</span> },
        { header: 'Field', render: (e) => <span className="text-secondary-700">{e.field}</span> },
        { header: 'Institution', render: (e) => <span className="text-secondary-600">{e.institution}</span> },
        { header: 'Year', render: (e) => <span className="text-secondary-400 text-sm">{formatDateRange(e.startDate, e.completionDate)}</span> },
      ]}
      FormComponent={EducationForm}
    />
  );
}
