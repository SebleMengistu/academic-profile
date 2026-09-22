import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { adminGetUsers, adminCreateUser, adminDeleteUser } from '../../services/admin';
import AdminPageHeader from '../components/AdminPageHeader';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Trash2, Users } from 'lucide-react';
import { User } from '../../types';
import { formatDate } from '../../utils/formatters';

const ROLES = ['SUPER_ADMIN', 'PROFILE_OWNER', 'EDITOR'];
const ROLE_COLORS: Record<string, string> = { SUPER_ADMIN: 'badge-red', PROFILE_OWNER: 'badge-blue', EDITOR: 'badge-gray' };

function UserForm({ onSubmit, isPending }: { onSubmit: (d: unknown) => void; isPending: boolean }) {
  const { register, handleSubmit } = useForm({ defaultValues: { firstName: '', lastName: '', email: '', password: '', role: 'EDITOR' } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group"><label className="form-label">First Name *</label><input {...register('firstName')} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Last Name *</label><input {...register('lastName')} className="form-input" required /></div>
      </div>
      <div className="form-group"><label className="form-label">Email *</label><input type="email" {...register('email')} className="form-input" required /></div>
      <div className="form-group"><label className="form-label">Password *</label><input type="password" {...register('password')} className="form-input" required minLength={8} /></div>
      <div className="form-group"><label className="form-label">Role</label><select {...register('role')} className="form-select">{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Creating…' : 'Create User'}</button>
    </form>
  );
}

export default function UsersAdmin() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['admin', 'users'], queryFn: () => adminGetUsers() });

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: adminCreateUser,
    onSuccess: () => { toast.success('User created'); setModalOpen(false); queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); },
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: adminDeleteUser,
    onSuccess: () => { toast.success('User deleted'); setDeleteId(null); queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); },
  });

  return (
    <div>
      <AdminPageHeader title="Users" subtitle="Manage admin user accounts" action={
        <button onClick={() => setModalOpen(true)} className="btn-primary btn-sm"><Plus className="w-4 h-4" /> Add User</button>
      } />

      {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      : !data?.data?.length ? <EmptyState icon={Users} title="No users" />
      : (
        <div className="table-wrapper">
          <table className="table" aria-label="Users">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last Login</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {(data.data as User[]).map((user) => (
                <tr key={user.id}>
                  <td className="font-medium text-secondary-900">{user.firstName} {user.lastName}</td>
                  <td className="text-secondary-600 text-sm">{user.email}</td>
                  <td><span className={ROLE_COLORS[user.role] ?? 'badge-gray'}>{user.role}</span></td>
                  <td className="text-secondary-400 text-xs">{user.lastLogin ? formatDate(user.lastLogin, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Never'}</td>
                  <td><span className={user.isActive ? 'badge-green' : 'badge-red'}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="flex justify-end">
                      <button onClick={() => setDeleteId(user.id)} className="btn-ghost btn-icon text-red-500" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New User" size="md">
        <UserForm onSubmit={create} isPending={creating} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && del(deleteId)} loading={deleting} title="Delete User" />
    </div>
  );
}
