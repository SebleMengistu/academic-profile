import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SimpleCrudPage from '../components/SimpleCrudPage';
import { adminGetExternalProfiles, adminCreateExternalProfile, adminUpdateExternalProfile, adminDeleteExternalProfile } from '../../services/admin';
import { ExternalProfile } from '../../types';
import { Link2 } from 'lucide-react';

const PLATFORMS = ['ORCID','Google Scholar','ResearchGate','LinkedIn','GitHub','Scopus','Web of Science','Personal Website','YouTube','Twitter/X','Other'];

function ExternalProfileForm({ item, onSubmit, isPending }: { item?: ExternalProfile; onSubmit: (d: unknown) => void; isPending: boolean }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { platform: 'ORCID', label: '', url: '', active: true, displayOrder: 0 } });
  useEffect(() => { if (item) reset(item); }, [item, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-group"><label className="form-label">Platform</label><select {...register('platform')} className="form-select">{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select></div>
      <div className="form-group"><label className="form-label">Label *</label><input {...register('label')} className="form-input" required placeholder="e.g. Google Scholar Profile" /></div>
      <div className="form-group"><label className="form-label">URL *</label><input type="url" {...register('url')} className="form-input" required /></div>
      <div className="form-group"><label className="form-label">Display Order</label><input type="number" {...register('displayOrder', { valueAsNumber: true })} className="form-input" /></div>
      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('active')} className="w-4 h-4 rounded" /><span className="text-sm">Active (visible on public site)</span></label>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function ExternalProfilesAdmin() {
  return (
    <SimpleCrudPage<ExternalProfile>
      title="External Profiles"
      queryKey={['admin', 'external-profiles']}
      fetchFn={adminGetExternalProfiles}
      createFn={adminCreateExternalProfile}
      updateFn={adminUpdateExternalProfile}
      deleteFn={adminDeleteExternalProfile}
      emptyIcon={Link2}
      columns={[
        { header: 'Platform', render: (p) => <span className="font-medium">{p.platform}</span> },
        { header: 'Label', render: (p) => <span className="text-secondary-600">{p.label}</span> },
        { header: 'URL', render: (p) => <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline truncate max-w-xs block">{p.url}</a> },
        { header: 'Status', render: (p) => p.active ? <span className="badge-green">Active</span> : <span className="badge-gray">Hidden</span> },
      ]}
      FormComponent={ExternalProfileForm}
    />
  );
}
