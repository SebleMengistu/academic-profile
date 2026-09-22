import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SimpleCrudPage from '../components/SimpleCrudPage';
import { adminGetResearchAreas, adminCreateResearchArea, adminUpdateResearchArea, adminDeleteResearchArea } from '../../services/admin';
import { ResearchArea } from '../../types';
import { FlaskConical } from 'lucide-react';

function ResearchAreaForm({ item, onSubmit, isPending }: { item?: ResearchArea; onSubmit: (d: unknown) => void; isPending: boolean }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '', description: '', icon: '', displayOrder: 0 } });
  useEffect(() => { if (item) reset(item); }, [item, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-group"><label className="form-label">Name *</label><input {...register('name')} className="form-input" required /></div>
      <div className="form-group"><label className="form-label">Description</label><textarea {...register('description')} rows={3} className="form-textarea" /></div>
      <div className="form-group"><label className="form-label">Icon (emoji or URL)</label><input {...register('icon')} className="form-input" placeholder="🤖" /></div>
      <div className="form-group"><label className="form-label">Display Order</label><input type="number" {...register('displayOrder', { valueAsNumber: true })} className="form-input" /></div>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function ResearchAreas() {
  return (
    <SimpleCrudPage<ResearchArea>
      title="Research Areas"
      queryKey={['admin', 'research-areas']}
      fetchFn={adminGetResearchAreas}
      createFn={adminCreateResearchArea}
      updateFn={adminUpdateResearchArea}
      deleteFn={adminDeleteResearchArea}
      emptyIcon={FlaskConical}
      columns={[
        { header: 'Name', render: (a) => <span className="font-medium">{a.name}</span> },
        { header: 'Slug', render: (a) => <span className="text-xs font-mono text-secondary-400">{a.slug}</span> },
        { header: 'Order', render: (a) => <span className="text-secondary-400">{a.displayOrder}</span> },
      ]}
      FormComponent={ResearchAreaForm}
    />
  );
}
