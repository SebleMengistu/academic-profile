import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SimpleCrudPage from '../components/SimpleCrudPage';
import { adminGetSupervision, adminCreateSupervision, adminUpdateSupervision, adminDeleteSupervision } from '../../services/admin';
import { Supervision } from '../../types';
import { GraduationCap } from 'lucide-react';

function SupervisionForm({ item, onSubmit, isPending }: { item?: Supervision; onSubmit: (d: unknown) => void; isPending: boolean }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { studentName: '', degree: 'PhD', researchTopic: '', role: 'Principal Supervisor', startDate: '', completionDate: '', status: 'Current', institution: '', description: '' } });
  useEffect(() => { if (item) reset({ ...item, startDate: item.startDate?.split('T')[0] || '', completionDate: item.completionDate?.split('T')[0] || '' }); }, [item, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group col-span-2"><label className="form-label">Student Name *</label><input {...register('studentName')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Degree</label><select {...register('degree')} className="form-select"><option>PhD</option><option>Masters</option><option>Honours</option><option>Undergraduate</option><option>Other</option></select></div>
        <div className="form-group"><label className="form-label">Role</label><select {...register('role')} className="form-select"><option>Principal Supervisor</option><option>Associate Supervisor</option><option>Co-Supervisor</option><option>Advisor</option></select></div>
        <div className="form-group col-span-2"><label className="form-label">Research Topic *</label><input {...register('researchTopic')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Start Date</label><input type="date" {...register('startDate')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Completion Date</label><input type="date" {...register('completionDate')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Status</label><select {...register('status')} className="form-select"><option>Current</option><option>Completed</option><option>Withdrawn</option></select></div>
        <div className="form-group"><label className="form-label">Institution</label><input {...register('institution')} className="form-input" /></div>
      </div>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function SupervisionAdmin() {
  return (
    <SimpleCrudPage<Supervision>
      title="Supervision"
      queryKey={['admin', 'supervision']}
      fetchFn={adminGetSupervision}
      createFn={adminCreateSupervision}
      updateFn={adminUpdateSupervision}
      deleteFn={adminDeleteSupervision}
      emptyIcon={GraduationCap}
      columns={[
        { header: 'Student', render: (s) => <span className="font-medium">{s.studentName}</span> },
        { header: 'Degree', render: (s) => <span className="badge-blue text-xs">{s.degree}</span> },
        { header: 'Topic', render: (s) => <span className="text-secondary-600 text-sm max-w-xs truncate block">{s.researchTopic}</span> },
        { header: 'Status', render: (s) => <span className={s.status === 'Current' ? 'badge-green' : s.status === 'Completed' ? 'badge-blue' : 'badge-red'}>{s.status}</span> },
      ]}
      FormComponent={SupervisionForm}
    />
  );
}
