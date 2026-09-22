import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SimpleCrudPage from '../components/SimpleCrudPage';
import { adminGetTeaching, adminCreateTeaching, adminUpdateTeaching, adminDeleteTeaching } from '../../services/admin';
import { Teaching } from '../../types';
import { BookMarked } from 'lucide-react';

const LEVELS = ['Undergraduate','Postgraduate','PhD','Online','Other'];

function TeachingForm({ item, onSubmit, isPending }: { item?: Teaching; onSubmit: (d: unknown) => void; isPending: boolean }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { courseName: '', courseCode: '', institution: '', level: 'Undergraduate', semester: '', year: new Date().getFullYear(), description: '', displayOrder: 0 } });
  useEffect(() => { if (item) reset(item); }, [item, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group col-span-2"><label className="form-label">Course Name *</label><input {...register('courseName')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Course Code</label><input {...register('courseCode')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Level</label><select {...register('level')} className="form-select">{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></div>
        <div className="form-group col-span-2"><label className="form-label">Institution *</label><input {...register('institution')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Semester</label><input {...register('semester')} className="form-input" placeholder="Semester 1" /></div>
        <div className="form-group"><label className="form-label">Year</label><input type="number" {...register('year', { valueAsNumber: true })} className="form-input" /></div>
      </div>
      <div className="form-group"><label className="form-label">Description</label><textarea {...register('description')} rows={2} className="form-textarea" /></div>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function TeachingAdmin() {
  return (
    <SimpleCrudPage<Teaching>
      title="Teaching"
      queryKey={['admin', 'teaching']}
      fetchFn={adminGetTeaching}
      createFn={adminCreateTeaching}
      updateFn={adminUpdateTeaching}
      deleteFn={adminDeleteTeaching}
      emptyIcon={BookMarked}
      columns={[
        { header: 'Course', render: (t) => <div><p className="font-medium">{t.courseName}</p>{t.courseCode && <p className="text-xs font-mono text-secondary-400">{t.courseCode}</p>}</div> },
        { header: 'Institution', render: (t) => <span className="text-secondary-600">{t.institution}</span> },
        { header: 'Level', render: (t) => <span className="badge-blue text-xs">{t.level}</span> },
        { header: 'Year', render: (t) => <span className="text-secondary-400">{t.year || '—'}</span> },
      ]}
      FormComponent={TeachingForm}
    />
  );
}
