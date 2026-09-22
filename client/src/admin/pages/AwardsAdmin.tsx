import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SimpleCrudPage from '../components/SimpleCrudPage';
import { adminGetAwards, adminCreateAward, adminUpdateAward, adminDeleteAward } from '../../services/admin';
import { Award } from '../../types';
import { Trophy } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

function AwardForm({ item, onSubmit, isPending }: { item?: Award; onSubmit: (d: unknown) => void; isPending: boolean }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '', organization: '', date: '', category: '', description: '', externalUrl: '', displayOrder: 0 } });
  useEffect(() => { if (item) reset({ ...item, date: item.date?.split('T')[0] || '' }); }, [item, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-group"><label className="form-label">Award Name *</label><input {...register('name')} className="form-input" required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group"><label className="form-label">Organization *</label><input {...register('organization')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Category</label><input {...register('category')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Date</label><input type="date" {...register('date')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">URL</label><input type="url" {...register('externalUrl')} className="form-input" /></div>
      </div>
      <div className="form-group"><label className="form-label">Description</label><textarea {...register('description')} rows={3} className="form-textarea" /></div>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function AwardsAdmin() {
  return (
    <SimpleCrudPage<Award>
      title="Awards"
      queryKey={['admin', 'awards']}
      fetchFn={adminGetAwards}
      createFn={adminCreateAward}
      updateFn={adminUpdateAward}
      deleteFn={adminDeleteAward}
      emptyIcon={Trophy}
      columns={[
        { header: 'Award', render: (a) => <span className="font-medium">{a.name}</span> },
        { header: 'Organization', render: (a) => <span className="text-secondary-600">{a.organization}</span> },
        { header: 'Category', render: (a) => <span className="text-secondary-400 text-sm">{a.category || '—'}</span> },
        { header: 'Date', render: (a) => <span className="text-secondary-400 text-sm">{a.date ? formatDate(a.date, { year: 'numeric', month: 'short' }) : '—'}</span> },
      ]}
      FormComponent={AwardForm}
    />
  );
}
