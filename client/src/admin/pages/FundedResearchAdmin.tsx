import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import SimpleCrudPage from '../components/SimpleCrudPage';
import { adminGetFundedResearch, adminCreateFundedResearch, adminUpdateFundedResearch, adminDeleteFundedResearch, adminGetResearchAreas } from '../../services/admin';
import { FundedResearch, ResearchArea } from '../../types';
import { formatDateRange, formatCurrency } from '../../utils/formatters';
import { DollarSign } from 'lucide-react';

const FUNDING_TYPES = ['Grant','Contract Research','Industry Funding','Government Funding','University Funding','Fellowship','Scholarship','Other'];
const STATUSES = ['ACTIVE','COMPLETED','PENDING','CANCELLED'];

function ResearchForm({ item, onSubmit, isPending }: { item?: FundedResearch; onSubmit: (d: unknown) => void; isPending: boolean }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { title: '', description: '', fundingType: 'Grant', funder: '', grantNumber: '', amount: '', currency: 'USD', startDate: '', endDate: '', status: 'ACTIVE', principalInvestigator: '', contentStatus: 'DRAFT', featured: false } });
  const { data: areas = [] } = useQuery({ queryKey: ['admin', 'research-areas'], queryFn: adminGetResearchAreas, staleTime: Infinity });
  useEffect(() => { if (item) reset({ ...item as any, startDate: item.startDate?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '', amount: String(item.amount || '') }); }, [item, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-group"><label className="form-label">Title *</label><input {...register('title')} className="form-input" required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group"><label className="form-label">Funding Type</label><select {...register('fundingType')} className="form-select">{FUNDING_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Status</label><select {...register('status')} className="form-select">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Funder *</label><input {...register('funder')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Grant Number</label><input {...register('grantNumber')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Amount</label><input type="number" {...register('amount')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Currency</label><input {...register('currency')} className="form-input" placeholder="USD" /></div>
        <div className="form-group"><label className="form-label">Start Date *</label><input type="date" {...register('startDate')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">End Date</label><input type="date" {...register('endDate')} className="form-input" /></div>
      </div>
      <div className="form-group"><label className="form-label">Principal Investigator *</label><input {...register('principalInvestigator')} className="form-input" required /></div>
      <div className="form-group"><label className="form-label">Description</label><textarea {...register('description')} rows={3} className="form-textarea" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group"><label className="form-label">Content Status</label><select {...register('contentStatus')} className="form-select"><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select></div>
      </div>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function FundedResearchAdmin() {
  return (
    <SimpleCrudPage<FundedResearch>
      title="Funded Research"
      queryKey={['admin', 'funded-research']}
      fetchFn={() => adminGetFundedResearch().then((r: any) => r.data || r)}
      createFn={adminCreateFundedResearch}
      updateFn={adminUpdateFundedResearch}
      deleteFn={adminDeleteFundedResearch}
      emptyIcon={DollarSign}
      columns={[
        { header: 'Title', render: (r) => <span className="font-medium text-secondary-900 max-w-xs truncate block">{r.title}</span> },
        { header: 'Funder', render: (r) => <span className="text-secondary-600 text-sm">{r.funder}</span> },
        { header: 'Period', render: (r) => <span className="text-secondary-400 text-xs">{formatDateRange(r.startDate, r.endDate, r.status === 'ACTIVE')}</span> },
        { header: 'Status', render: (r) => <span className={r.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}>{r.status}</span> },
        { header: 'Amount', render: (r) => r.amount ? <span className="text-xs">{formatCurrency(r.amount, r.currency)}</span> : <span className="text-secondary-300">—</span> },
      ]}
      FormComponent={ResearchForm}
    />
  );
}
