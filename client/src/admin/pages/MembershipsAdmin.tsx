import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SimpleCrudPage from '../components/SimpleCrudPage';
import { adminGetMemberships, adminCreateMembership, adminUpdateMembership, adminDeleteMembership } from '../../services/admin';
import { Membership } from '../../types';
import { BookmarkCheck } from 'lucide-react';

function MembershipForm({ item, onSubmit, isPending }: { item?: Membership; onSubmit: (d: unknown) => void; isPending: boolean }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { organization: '', role: '', membershipType: '', isCurrent: true, externalUrl: '', displayOrder: 0 } });
  useEffect(() => { if (item) reset(item); }, [item, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-group"><label className="form-label">Organization *</label><input {...register('organization')} className="form-input" required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group"><label className="form-label">Role</label><input {...register('role')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Membership Type</label><input {...register('membershipType')} className="form-input" /></div>
        <div className="form-group col-span-2"><label className="form-label">URL</label><input type="url" {...register('externalUrl')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Display Order</label><input type="number" {...register('displayOrder', { valueAsNumber: true })} className="form-input" /></div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('isCurrent')} className="w-4 h-4 rounded" /><span className="text-sm">Current member</span></label>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function MembershipsAdmin() {
  return (
    <SimpleCrudPage<Membership>
      title="Memberships"
      queryKey={['admin', 'memberships']}
      fetchFn={adminGetMemberships}
      createFn={adminCreateMembership}
      updateFn={adminUpdateMembership}
      deleteFn={adminDeleteMembership}
      emptyIcon={BookmarkCheck}
      columns={[
        { header: 'Organization', render: (m) => <span className="font-medium">{m.organization}</span> },
        { header: 'Role', render: (m) => <span className="text-secondary-600 text-sm">{m.role || '—'}</span> },
        { header: 'Type', render: (m) => <span className="text-secondary-400 text-sm">{m.membershipType || '—'}</span> },
        { header: 'Status', render: (m) => m.isCurrent ? <span className="badge-green">Active</span> : <span className="badge-gray">Past</span> },
      ]}
      FormComponent={MembershipForm}
    />
  );
}
