import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SimpleCrudPage from '../components/SimpleCrudPage';
import { adminGetAppointments, adminCreateAppointment, adminUpdateAppointment, adminDeleteAppointment } from '../../services/admin';
import { AcademicAppointment } from '../../types';
import { formatDateRange } from '../../utils/formatters';
import { Briefcase } from 'lucide-react';

function AppointmentForm({ item, onSubmit, isPending }: { item?: AcademicAppointment; onSubmit: (d: unknown) => void; isPending: boolean }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { title: '', institution: '', faculty: '', department: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '', displayOrder: 0 } });
  useEffect(() => { if (item) reset({ ...item, startDate: item.startDate?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '' }); }, [item, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group col-span-2"><label className="form-label">Title *</label><input {...register('title')} className="form-input" required /></div>
        <div className="form-group col-span-2"><label className="form-label">Institution *</label><input {...register('institution')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Faculty</label><input {...register('faculty')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Department</label><input {...register('department')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Start Date *</label><input type="date" {...register('startDate')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">End Date</label><input type="date" {...register('endDate')} className="form-input" /></div>
        <div className="form-group col-span-2"><label className="form-label">Location</label><input {...register('location')} className="form-input" /></div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('isCurrent')} className="w-4 h-4 rounded" /><span className="text-sm">Current position</span></label>
      <div className="form-group"><label className="form-label">Description</label><textarea {...register('description')} rows={3} className="form-textarea" /></div>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function Appointments() {
  return (
    <SimpleCrudPage<AcademicAppointment>
      title="Appointments"
      subtitle="Academic positions and appointments"
      queryKey={['admin', 'appointments']}
      fetchFn={adminGetAppointments}
      createFn={adminCreateAppointment}
      updateFn={adminUpdateAppointment}
      deleteFn={adminDeleteAppointment}
      emptyIcon={Briefcase}
      columns={[
        { header: 'Title', render: (a) => <span className="font-medium text-secondary-900">{a.title}</span> },
        { header: 'Institution', render: (a) => <span className="text-secondary-600">{a.institution}</span> },
        { header: 'Period', render: (a) => <span className="text-sm text-secondary-400">{formatDateRange(a.startDate, a.endDate, a.isCurrent)}</span> },
        { header: 'Status', render: (a) => a.isCurrent ? <span className="badge-green">Current</span> : <span className="badge-gray">Past</span> },
      ]}
      FormComponent={AppointmentForm}
    />
  );
}
