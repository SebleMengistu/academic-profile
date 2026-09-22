import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminGetSettings, adminUpdateSettings } from '../../services/admin';
import AdminPageHeader from '../components/AdminPageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function SettingsAdmin() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ['admin', 'settings'], queryFn: adminGetSettings });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      siteName: '', siteUrl: '', maintenanceMode: false, allowContactForm: true,
      analyticsEnabled: true, googleAnalyticsId: '', footerText: '',
      'seo.title': '', 'seo.description': '', 'seo.twitterHandle': '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        siteName: settings.siteName || '',
        siteUrl: settings.siteUrl || '',
        maintenanceMode: settings.maintenanceMode || false,
        allowContactForm: settings.allowContactForm !== false,
        analyticsEnabled: settings.analyticsEnabled !== false,
        googleAnalyticsId: settings.googleAnalyticsId || '',
        footerText: settings.footerText || '',
        'seo.title': settings.seo?.title || '',
        'seo.description': settings.seo?.description || '',
        'seo.twitterHandle': settings.seo?.twitterHandle || '',
      });
    }
  }, [settings, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => {
      const { 'seo.title': seoTitle, 'seo.description': seoDesc, 'seo.twitterHandle': seoTwitter, ...rest } = data;
      return adminUpdateSettings({ ...rest, seo: { title: seoTitle, description: seoDesc, twitterHandle: seoTwitter } });
    },
    onSuccess: () => { toast.success('Settings saved'); queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] }); },
  });

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;

  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Configure site-wide settings" />
      <form onSubmit={handleSubmit((d) => mutate(d))} className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* General */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-secondary-900">General</h2>
          <div className="form-group"><label className="form-label">Site Name</label><input {...register('siteName')} className="form-input" /></div>
          <div className="form-group"><label className="form-label">Site URL</label><input type="url" {...register('siteUrl')} className="form-input" /></div>
          <div className="form-group"><label className="form-label">Footer Text</label><input {...register('footerText')} className="form-input" /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('allowContactForm')} className="w-4 h-4 rounded" /><span className="text-sm">Allow Contact Form</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('maintenanceMode')} className="w-4 h-4 rounded" /><span className="text-sm text-red-600">Maintenance Mode</span></label>
        </div>

        {/* SEO */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-secondary-900">SEO</h2>
          <div className="form-group"><label className="form-label">Meta Title</label><input {...register('seo.title')} className="form-input" /></div>
          <div className="form-group"><label className="form-label">Meta Description</label><textarea {...register('seo.description')} rows={3} className="form-textarea" /></div>
          <div className="form-group"><label className="form-label">Twitter Handle</label><input {...register('seo.twitterHandle')} className="form-input" placeholder="@username" /></div>
        </div>

        {/* Analytics */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-secondary-900">Analytics</h2>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('analyticsEnabled')} className="w-4 h-4 rounded" /><span className="text-sm">Enable Analytics</span></label>
          <div className="form-group"><label className="form-label">Google Analytics ID</label><input {...register('googleAnalyticsId')} className="form-input" placeholder="G-XXXXXXXXXX" /></div>
        </div>

        <div className="lg:col-span-2">
          <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? 'Saving…' : 'Save Settings'}</button>
        </div>
      </form>
    </div>
  );
}
