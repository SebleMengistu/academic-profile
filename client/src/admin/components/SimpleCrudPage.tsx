/**
 * Reusable CRUD page shell used by most admin sections.
 * Displays a table of items with edit/delete, plus a modal form.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminPageHeader from './AdminPageHeader';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, LucideIcon } from 'lucide-react';

export interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
}

interface Props<T extends { _id: string }> {
  title: string;
  subtitle?: string;
  queryKey: string[];
  fetchFn: () => Promise<T[]>;
  createFn: (data: unknown) => Promise<unknown>;
  updateFn: (id: string, data: unknown) => Promise<unknown>;
  deleteFn: (id: string) => Promise<unknown>;
  columns: Column<T>[];
  FormComponent: React.ComponentType<{ item?: T; onSubmit: (data: unknown) => void; isPending: boolean }>;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
}

export default function SimpleCrudPage<T extends { _id: string }>({
  title, subtitle, queryKey, fetchFn, createFn, updateFn, deleteFn,
  columns, FormComponent, emptyIcon, emptyTitle,
}: Props<T>) {
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState<T | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({ queryKey, queryFn: fetchFn });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (data: unknown) =>
      editItem ? updateFn(editItem._id, data) : createFn(data),
    onSuccess: () => {
      toast.success(editItem ? 'Updated' : 'Created');
      invalidate();
      setModalOpen(false);
      setEditItem(undefined);
    },
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      toast.success('Deleted');
      setDeleteId(null);
      invalidate();
    },
  });

  const openCreate = () => { setEditItem(undefined); setModalOpen(true); };
  const openEdit = (item: T) => { setEditItem(item); setModalOpen(true); };

  return (
    <div>
      <AdminPageHeader
        title={title}
        subtitle={subtitle}
        action={
          <button onClick={openCreate} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Add New
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : !(items as T[]).length ? (
        <EmptyState icon={emptyIcon} title={emptyTitle ?? `No ${title.toLowerCase()} yet`} />
      ) : (
        <div className="table-wrapper">
          <table className="table" aria-label={title}>
            <thead>
              <tr>
                {columns.map((c) => <th key={c.header}>{c.header}</th>)}
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(items as T[]).map((item) => (
                <tr key={item._id}>
                  {columns.map((c) => <td key={c.header}>{c.render(item)}</td>)}
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(item)} className="btn-ghost btn-icon" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(item._id)} className="btn-ghost btn-icon text-red-500" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(undefined); }} title={editItem ? `Edit ${title}` : `Add ${title}`} size="lg">
        <FormComponent item={editItem} onSubmit={save} isPending={saving} />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && del(deleteId)}
        loading={deleting}
      />
    </div>
  );
}
