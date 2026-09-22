import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminGetMessages, adminUpdateMessageStatus, adminDeleteMessage } from '../../services/admin';
import AdminPageHeader from '../components/AdminPageHeader';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Mail, Trash2, Eye } from 'lucide-react';
import { ContactMessage, ContactStatus } from '../../types';
import { formatDate } from '../../utils/formatters';

const STATUS_COLORS: Record<ContactStatus, string> = {
  New: 'badge-orange',
  Read: 'badge-blue',
  Replied: 'badge-green',
  Archived: 'badge-gray',
  Spam: 'badge-red',
};
const STATUSES: ContactStatus[] = ['New','Read','Replied','Archived','Spam'];

export default function ContactAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = { page, limit: 20, ...(statusFilter && { status: statusFilter }) };
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'contact', params],
    queryFn: () => adminGetMessages(params),
    placeholderData: (prev) => prev,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminUpdateMessageStatus(id, status),
    onSuccess: () => { toast.success('Status updated'); queryClient.invalidateQueries({ queryKey: ['admin', 'contact'] }); },
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: adminDeleteMessage,
    onSuccess: () => { toast.success('Message deleted'); setDeleteId(null); queryClient.invalidateQueries({ queryKey: ['admin', 'contact'] }); },
  });

  return (
    <div>
      <AdminPageHeader title="Contact Messages" subtitle="Manage incoming contact form submissions" />

      <div className="flex flex-wrap gap-2 mb-5">
        {['', ...STATUSES].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`badge px-3 py-1.5 cursor-pointer transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      : !data?.data?.length ? <EmptyState icon={Mail} title="No messages" />
      : (
        <>
          <div className="table-wrapper">
            <table className="table" aria-label="Contact messages">
              <thead><tr><th>From</th><th>Subject</th><th>Status</th><th>Date</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {(data.data as ContactMessage[]).map((msg) => (
                  <tr key={msg._id} className={msg.status === 'New' ? 'font-medium' : ''}>
                    <td>
                      <p className="text-secondary-900">{msg.name}</p>
                      <p className="text-xs text-secondary-400">{msg.email}</p>
                    </td>
                    <td className="text-secondary-700 max-w-xs truncate">{msg.subject || '(No subject)'}</td>
                    <td>
                      <select value={msg.status} onChange={(e) => updateStatus({ id: msg._id, status: e.target.value })}
                        className="text-xs border border-secondary-200 rounded px-2 py-1 bg-white cursor-pointer">
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="text-secondary-400 text-xs whitespace-nowrap">{formatDate(msg.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedMsg(msg)} className="btn-ghost btn-icon" aria-label="View message"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(msg._id)} className="btn-ghost btn-icon text-red-500" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.pagination && <Pagination pagination={data.pagination} onChange={setPage} />}
        </>
      )}

      {/* View Message Modal */}
      <Modal open={!!selectedMsg} onClose={() => setSelectedMsg(null)} title="Message" size="lg">
        {selectedMsg && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-secondary-500">From:</span> <strong>{selectedMsg.name}</strong></div>
              <div><span className="text-secondary-500">Email:</span> <a href={`mailto:${selectedMsg.email}`} className="text-primary-600 hover:underline">{selectedMsg.email}</a></div>
              <div><span className="text-secondary-500">Subject:</span> {selectedMsg.subject || '—'}</div>
              <div><span className="text-secondary-500">Date:</span> {formatDate(selectedMsg.createdAt, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div>
              <p className="text-sm text-secondary-500 mb-2">Message:</p>
              <div className="bg-secondary-50 rounded-xl p-4 text-sm text-secondary-800 whitespace-pre-wrap border border-secondary-100">{selectedMsg.message}</div>
            </div>
            <div className="flex gap-3">
              <a href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject || 'Your message'}`}
                onClick={() => updateStatus({ id: selectedMsg._id, status: 'Replied' })}
                className="btn-primary btn-sm">Reply via Email</a>
              <button onClick={() => setSelectedMsg(null)} className="btn-secondary btn-sm">Close</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && del(deleteId)} loading={deleting} title="Delete Message" />
    </div>
  );
}
