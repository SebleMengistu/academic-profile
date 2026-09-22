import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { adminGetMedia, adminCreateMedia, adminUpdateMedia, adminDeleteMedia } from '../../services/admin';
import AdminPageHeader from '../components/AdminPageHeader';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Image } from 'lucide-react';
import { Media } from '../../types';

const TYPES = ['Video','Image','Interview','Podcast','News','Presentation','Other'];

function MediaForm({ item, onSubmit, isPending }: { item?: Media; onSubmit: (fd: FormData) => void; isPending: boolean }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { title: '', type: 'Video', description: '', url: '', date: '', caption: '', credit: '', visibility: 'PUBLIC' } });
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  useEffect(() => { if (item) reset({ ...item, date: item.date?.split('T')[0] || '' }); }, [item, reset]);

  const handleSubmitForm = (data: any) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, String(v)); });
    if (thumbFile) fd.append('thumbnail', thumbFile);
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
      <div className="form-group"><label className="form-label">Title *</label><input {...register('title')} className="form-input" required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group"><label className="form-label">Type</label><select {...register('type')} className="form-select">{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Date</label><input type="date" {...register('date')} className="form-input" /></div>
        <div className="form-group col-span-2"><label className="form-label">URL</label><input type="url" {...register('url')} className="form-input" /></div>
      </div>
      <div className="form-group">
        <label className="form-label">Thumbnail</label>
        <input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} className="form-input text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-secondary-100 file:text-secondary-700" />
      </div>
      <div className="form-group"><label className="form-label">Description</label><textarea {...register('description')} rows={2} className="form-textarea" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group"><label className="form-label">Caption</label><input {...register('caption')} className="form-input" /></div>
        <div className="form-group"><label className="form-label">Credit</label><input {...register('credit')} className="form-input" /></div>
      </div>
      <div className="form-group"><label className="form-label">Visibility</label><select {...register('visibility')} className="form-select"><option>PUBLIC</option><option>PRIVATE</option></select></div>
      <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

export default function MediaAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState<Media | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'media', page],
    queryFn: () => adminGetMedia({ page, limit: 20 }),
    placeholderData: (prev) => prev,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (fd: FormData) => editItem ? adminUpdateMedia(editItem._id, fd) : adminCreateMedia(fd),
    onSuccess: () => { toast.success(editItem ? 'Updated' : 'Created'); invalidate(); setModalOpen(false); setEditItem(undefined); },
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: adminDeleteMedia,
    onSuccess: () => { toast.success('Deleted'); setDeleteId(null); invalidate(); },
  });

  return (
    <div>
      <AdminPageHeader title="Media" subtitle="Images, videos, interviews, and other media" action={
        <button onClick={() => { setEditItem(undefined); setModalOpen(true); }} className="btn-primary btn-sm"><Plus className="w-4 h-4" /> Add Media</button>
      } />

      {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      : !data?.data?.length ? <EmptyState icon={Image} title="No media items yet" />
      : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(data.data as Media[]).map((item) => (
              <div key={item._id} className="card overflow-hidden group">
                <div className="aspect-video bg-secondary-100 relative overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-300"><Image className="w-8 h-8" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => { setEditItem(item); setModalOpen(true); }} className="btn-primary btn-sm" aria-label="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteId(item._id)} className="btn-danger btn-sm" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-secondary-900 truncate">{item.title}</p>
                  <p className="text-2xs text-secondary-400">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
          {data?.pagination && <Pagination pagination={data.pagination} onChange={setPage} />}
        </>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(undefined); }} title={editItem ? 'Edit Media' : 'Add Media'} size="lg">
        <MediaForm item={editItem} onSubmit={save as any} isPending={saving} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && del(deleteId)} loading={deleting} />
    </div>
  );
}
