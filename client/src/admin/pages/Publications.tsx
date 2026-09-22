import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminGetPublications, adminDeletePublication, adminPublishPublication } from '../../services/admin';
import AdminPageHeader from '../components/AdminPageHeader';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, BookOpen, Send } from 'lucide-react';
import { Publication } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'badge-green',
  DRAFT: 'badge-yellow',
  ARCHIVED: 'badge-gray',
  SCHEDULED: 'badge-blue',
};

export default function Publications() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = { page, limit: 15, ...(search && { q: search }) };
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'publications', params],
    queryFn: () => adminGetPublications(params),
    placeholderData: (prev) => prev,
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: adminDeletePublication,
    onSuccess: () => {
      toast.success('Publication deleted');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'publications'] });
    },
  });

  const { mutate: publish } = useMutation({
    mutationFn: adminPublishPublication,
    onSuccess: () => {
      toast.success('Published');
      queryClient.invalidateQueries({ queryKey: ['admin', 'publications'] });
    },
  });

  return (
    <div>
      <AdminPageHeader
        title="Publications"
        subtitle="Manage all your scholarly publications"
        action={
          <Link to="/admin/publications/new" className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Add Publication
          </Link>
        }
      />

      {/* Search */}
      <div className="card p-4 mb-5">
        <form onSubmit={(e) => { e.preventDefault(); setSearch(q); setPage(1); }} className="flex gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search publications…"
            className="form-input flex-1"
          />
          <button type="submit" className="btn-primary btn-sm">Search</button>
          {search && <button type="button" onClick={() => { setQ(''); setSearch(''); }} className="btn-secondary btn-sm">Clear</button>}
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : !data?.data?.length ? (
        <EmptyState icon={BookOpen} title="No publications yet" description="Add your first publication using the button above." />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table" aria-label="Publications list">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data.data as Publication[]).map((pub) => (
                  <tr key={pub._id}>
                    <td>
                      <div className="max-w-xs">
                        <p className="font-medium text-secondary-900 truncate">{pub.title}</p>
                        {pub.journal && <p className="text-xs text-secondary-400 truncate italic">{pub.journal}</p>}
                      </div>
                    </td>
                    <td><span className="badge-blue text-xs">{pub.publicationType}</span></td>
                    <td className="text-secondary-600">{pub.year}</td>
                    <td><span className={STATUS_COLORS[pub.status] ?? 'badge-gray'}>{pub.status}</span></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/publications/${pub.slug}`} target="_blank" className="btn-ghost btn-icon" aria-label="View public">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {pub.status !== 'PUBLISHED' && (
                          <button onClick={() => publish(pub._id)} className="btn-ghost btn-icon text-green-600" aria-label="Publish">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <Link to={`/admin/publications/${pub._id}/edit`} className="btn-ghost btn-icon" aria-label="Edit">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteId(pub._id)} className="btn-ghost btn-icon text-red-500" aria-label="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.pagination && (
            <Pagination pagination={data.pagination} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && del(deleteId)}
        loading={deleting}
        title="Delete Publication"
        message="This will permanently delete the publication and its associated files."
      />
    </div>
  );
}
