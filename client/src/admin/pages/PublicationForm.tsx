import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminGetPublicationById, adminCreatePublication, adminUpdatePublication, adminGetResearchAreas } from '../../services/admin';
import RichTextEditor from '../../components/common/RichTextEditor';
import AdminPageHeader from '../components/AdminPageHeader';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const TYPES = ['Journal Article','Conference Paper','Book','Book Chapter','Technical Report','Patent','Dataset','Software','Thesis','Poster','Other'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export default function PublicationForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pub } = useQuery({
    queryKey: ['admin', 'publication', id],
    queryFn: () => adminGetPublicationById(id!),
    enabled: isEdit,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ['admin', 'research-areas'],
    queryFn: adminGetResearchAreas,
    staleTime: Infinity,
  });

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      abstract: '',
      publicationType: 'Journal Article',
      authors: [{ name: '', affiliation: '', isCorresponding: false, order: 0 }],
      journal: '',
      conference: '',
      publisher: '',
      volume: '',
      issue: '',
      pages: '',
      year: new Date().getFullYear(),
      doi: '',
      isbn: '',
      issn: '',
      keywords: '',
      externalUrl: '',
      researchAreas: [] as string[],
      featured: false,
      status: 'DRAFT',
      visibility: 'PUBLIC',
    },
  });

  const { fields: authorFields, append: appendAuthor, remove: removeAuthor } = useFieldArray({ control, name: 'authors' });

  useEffect(() => {
    if (pub) {
      setValue('title', pub.title || '');
      setValue('abstract', pub.abstract || '');
      setValue('publicationType', pub.publicationType || 'Journal Article');
      setValue('authors', pub.authors?.length ? pub.authors : [{ name: '', affiliation: '', isCorresponding: false, order: 0 }]);
      setValue('journal', pub.journal || '');
      setValue('conference', pub.conference || '');
      setValue('publisher', pub.publisher || '');
      setValue('volume', pub.volume || '');
      setValue('issue', pub.issue || '');
      setValue('pages', pub.pages || '');
      setValue('year', pub.year || new Date().getFullYear());
      setValue('doi', pub.doi || '');
      setValue('keywords', pub.keywords?.join(', ') || '');
      setValue('externalUrl', pub.externalUrl || '');
      setValue('researchAreas', pub.researchAreas?.map((r: any) => r._id || r) || []);
      setValue('featured', pub.featured || false);
      setValue('status', pub.status || 'DRAFT');
      setValue('visibility', pub.visibility || 'PUBLIC');
    }
  }, [pub, setValue]);

  const buildFormData = (data: Record<string, unknown>) => {
    const fd = new FormData();
    const { keywords, authors, researchAreas, ...rest } = data as any;

    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });

    const kwArr = typeof keywords === 'string'
      ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : [];
    kwArr.forEach((kw: string) => fd.append('keywords', kw));

    if (Array.isArray(authors)) {
      fd.append('authors', JSON.stringify(authors));
    }
    if (Array.isArray(researchAreas)) {
      researchAreas.forEach((id: string) => fd.append('researchAreas', id));
    }

    return fd;
  };

  const { mutate: save, isPending } = useMutation({
    mutationFn: (fd: FormData) => isEdit ? adminUpdatePublication(id!, fd) : adminCreatePublication(fd),
    onSuccess: () => {
      toast.success(isEdit ? 'Publication updated' : 'Publication created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'publications'] });
      navigate('/admin/publications');
    },
  });

  const onSubmit = (data: any) => save(buildFormData(data));

  const abstractValue = watch('abstract');

  return (
    <div>
      <div className="mb-6">
        <Link to="/admin/publications" className="inline-flex items-center gap-1.5 text-sm text-secondary-500 hover:text-primary-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Publications
        </Link>
        <AdminPageHeader title={isEdit ? 'Edit Publication' : 'New Publication'} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-secondary-900">Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title" className="form-label">Title *</label>
              <input id="title" {...register('title', { required: 'Title is required' })} className="form-input" />
              {errors.title && <p className="form-error">{String(errors.title.message)}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Abstract</label>
              <RichTextEditor
                value={abstractValue}
                onChange={(v) => setValue('abstract', v)}
                placeholder="Enter abstract…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="pub-type" className="form-label">Type *</label>
                <select id="pub-type" {...register('publicationType')} className="form-select">
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="pub-year" className="form-label">Year *</label>
                <select id="pub-year" {...register('year', { valueAsNumber: true })} className="form-select">
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Authors */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-secondary-900">Authors</h2>
              <button type="button" onClick={() => appendAuthor({ name: '', affiliation: '', isCorresponding: false, order: authorFields.length })} className="btn-secondary btn-sm">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {authorFields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input placeholder="Author name" {...register(`authors.${i}.name`)} className="form-input text-sm" />
                    <input placeholder="Affiliation" {...register(`authors.${i}.affiliation`)} className="form-input text-sm" />
                  </div>
                  <label className="flex items-center gap-1.5 mt-2 text-xs text-secondary-600 shrink-0 cursor-pointer">
                    <input type="checkbox" {...register(`authors.${i}.isCorresponding`)} className="w-3.5 h-3.5" />
                    Corr.
                  </label>
                  <button type="button" onClick={() => removeAuthor(i)} className="btn-ghost btn-icon text-red-400 mt-0.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Publication Details */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-secondary-900">Publication Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Journal</label>
                <input {...register('journal')} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Conference</label>
                <input {...register('conference')} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Publisher</label>
                <input {...register('publisher')} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">DOI</label>
                <input {...register('doi')} placeholder="10.xxxx/xxxxx" className="form-input font-mono text-sm" />
              </div>
              <div className="form-group">
                <label className="form-label">Volume</label>
                <input {...register('volume')} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Issue / Pages</label>
                <div className="flex gap-2">
                  <input {...register('issue')} placeholder="Issue" className="form-input" />
                  <input {...register('pages')} placeholder="Pages" className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ISBN</label>
                <input {...register('isbn')} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">ISSN</label>
                <input {...register('issn')} className="form-input" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Keywords (comma-separated)</label>
              <input {...register('keywords')} placeholder="machine learning, robotics, AI" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">External URL</label>
              <input type="url" {...register('externalUrl')} className="form-input" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-secondary-900">Publish</h2>
            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select id="status" {...register('status')} className="form-select">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="visibility" className="form-label">Visibility</label>
              <select id="visibility" {...register('visibility')} className="form-select">
                <option>PUBLIC</option>
                <option>PRIVATE</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('featured')} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-secondary-700">Featured</span>
            </label>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-secondary-900">Research Areas</h2>
            {(areas as any[]).map((area) => (
              <label key={area._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={area._id}
                  {...register('researchAreas')}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-secondary-700">{area.name}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Update Publication' : 'Create Publication'}
            </button>
            <Link to="/admin/publications" className="btn-outline text-center">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
