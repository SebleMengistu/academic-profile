import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { submitContact } from '../../services/public';
import { useQuery } from '@tanstack/react-query';
import { fetchProfile, fetchExternalProfiles } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import SectionHeader from '../../components/common/SectionHeader';
import toast from 'react-hot-toast';
import { Mail, MapPin, Phone, ExternalLink, Send, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consent: z.literal(true, { errorMap: () => ({ message: 'You must agree to the privacy policy' }) }),
});

type FormData = z.infer<typeof schema>;

export default function Contact() {
  const [sent, setSent] = useState(false);
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile, staleTime: Infinity });
  const { data: extProfiles } = useQuery({ queryKey: ['external-profiles'], queryFn: fetchExternalProfiles, staleTime: Infinity });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Omit<FormData, 'consent'>) => submitContact(data),
    onSuccess: () => {
      setSent(true);
      reset();
    },
    onError: () => toast.error('Failed to send message. Please try again.'),
  });

  const onSubmit = ({ consent: _, ...data }: FormData) => mutate(data);

  return (
    <>
      <SEOHead title="Contact" description="Get in touch for collaboration, inquiries, or general questions." />
      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title="Contact" subtitle="Reach out for collaboration opportunities or inquiries" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">Message Sent!</h3>
                <p className="text-secondary-500 mb-6">Thank you for your message. I'll get back to you as soon as possible.</p>
                <button onClick={() => setSent(false)} className="btn-outline">Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Name <span className="text-red-500" aria-hidden="true">*</span></label>
                    <input id="name" type="text" autoComplete="name" {...register('name')} className="form-input" aria-required="true" aria-describedby={errors.name ? 'name-error' : undefined} />
                    {errors.name && <p id="name-error" className="form-error" role="alert">{errors.name.message}</p>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email <span className="text-red-500" aria-hidden="true">*</span></label>
                    <input id="email" type="email" autoComplete="email" {...register('email')} className="form-input" aria-required="true" aria-describedby={errors.email ? 'email-error' : undefined} />
                    {errors.email && <p id="email-error" className="form-error" role="alert">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <input id="subject" type="text" {...register('subject')} className="form-input" />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message <span className="text-red-500" aria-hidden="true">*</span></label>
                  <textarea id="message" rows={6} {...register('message')} className="form-textarea" aria-required="true" aria-describedby={errors.message ? 'message-error' : undefined} />
                  {errors.message && <p id="message-error" className="form-error" role="alert">{errors.message.message}</p>}
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" id="consent" {...register('consent')} className="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                  <label htmlFor="consent" className="text-sm text-secondary-600 cursor-pointer">
                    I agree to the storage of my data for the purpose of this contact inquiry.
                  </label>
                </div>
                {errors.consent && <p className="form-error" role="alert">{errors.consent.message}</p>}

                <button type="submit" className="btn-primary btn-lg w-full" disabled={isPending}>
                  {isPending ? 'Sending…' : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <aside className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold text-secondary-900 mb-4">Contact Information</h2>
              <div className="space-y-4 text-sm">
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-secondary-700 hover:text-primary-600 transition-colors">
                    <Mail className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
                    {profile.email}
                  </a>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-3 text-secondary-700">
                    <Phone className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
                    {profile.phone}
                  </div>
                )}
                {profile?.address && (
                  <div className="flex items-start gap-3 text-secondary-700">
                    <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{profile.address}</span>
                  </div>
                )}
                {profile?.office && (
                  <div className="text-secondary-700">
                    <span className="font-medium">Office: </span>{profile.office}
                  </div>
                )}
              </div>
            </div>

            {extProfiles && extProfiles.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-secondary-900 mb-4">Find Me Online</h2>
                <ul className="space-y-2">
                  {extProfiles.filter((p) => p.active).map((p) => (
                    <li key={p._id}>
                      <a href={p.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        {p.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
