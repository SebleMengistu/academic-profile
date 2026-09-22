import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SimpleCrudPage from '../components/SimpleCrudPage';
import { adminGetServiceLeadership, adminCreateServiceLeadership, adminUpdateServiceLeadership, adminDeleteServiceLeadership } from '../../services/admin';
import { ServiceLeadership } from '../../types';
import { Shield } from 'lucide-react';

const SERVICE_TYPES = ['Leadership','Professional Service','Editorial Board','Conference Service','Committee','Reviewer','Other'];

function ServiceForm({ item, onSubmit, isPending }: { item?: ServiceLeadership; onSubmit: (d: unknown) => void; isPending: boolean }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { role: '', organization: '', type: 'Professional Service', description: '', startDate: '', endDate: '', isCurrent: false, externalUrl: '', displayOrder: 0 } });
  useEffect(() => { if (item) reset({ ...item, startDate: item.startDate?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '' }); }, [item, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group col-span-2"><label className="form-label">Role *</label><input {...register('role')} className="form-input" required /></div>
        <div className="form-group col-span-2"><label className="form-label">Organization *</label><input {...register('organization')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Type</label><select {...register('type')} className="form-select">{SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="form-group"><label className="form-label">External URL</label><input type="url" {...register('externalUrl')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Start Date</label><input type="date" {...register('startDate')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">End Date</label><input type="date" {...register('endDate')} className="form-input" /></div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('isCurrent')} className="w-4 h-4 rounded" /><span className="text-sm">Currently active</span></label>
      <div className="form-group"><label className="form-label">Description</label><textarea {...register('description')} rows={2} className="form-textarea" /></div>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function ServiceAdmin() {
  return (
    <SimpleCrudPage<ServiceLeadership>
      title="Service & Leadership"
      queryKey={['admin', 'service-leadership']}
      fetchFn={adminGetServiceLeadership}
      createFn={adminCreateServiceLeadership}
      updateFn={adminUpdateServiceLeadership}
      deleteFn={adminDeleteServiceLeadership}
      emptyIcon={Shield}
      columns={[
        { header: 'Role', render: (s) => <span className="font-medium">{s.role}</span> },
        { header: 'Organization', render: (s) => <span className="text-secondary-600">{s.organization}</span> },
        { header: 'Type', render: (s) => <span className="badge-gray text-xs">{s.type}</span> },
        { header: 'Status', render: (s) => s.isCurrent ? <span className="badge-green">Active</span> : <span className="badge-gray">Past</span> },
      ]}
      FormComponent={ServiceForm}
    />
  );
}
