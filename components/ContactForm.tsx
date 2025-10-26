'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { FadeIn } from './animations';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  recipientEmail: string;
}

export function ContactForm({ recipientEmail }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      console.log('Submitting contact form...', {
        name: data.name,
        email: data.email,
        subject: data.subject
      });

      // Use our API route instead of calling Web3Forms directly
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        }),
      });

      console.log('API Response status:', response.status);

      const result = await response.json();
      console.log('API Response body:', result);

      if (result.success) {
        setSubmitStatus('success');
        reset();
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        console.error('API error:', result);
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openGmail = () => {
    const values = getValues();
    const subject = encodeURIComponent(values.subject || 'Contact from Portfolio');
    const body = encodeURIComponent(
      `Hi Liron,\n\n${values.message || ''}\n\nBest regards,\n${values.name || ''}\n${values.email || ''}`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {submitStatus === 'success' && (
        <FadeIn>
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100">Message sent successfully!</h4>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                Thank you for reaching out. I'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </FadeIn>
      )}

      {submitStatus === 'error' && (
        <FadeIn>
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100">Failed to send message</h4>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                Please try again or use the Gmail button to contact me directly.
              </p>
            </div>
          </div>
        </FadeIn>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FadeIn delay={0.1}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Your name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              {...register('subject')}
              type="text"
              id="subject"
              className="w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="What's this about?"
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('message')}
              id="message"
              rows={6}
              className="w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              placeholder="Tell me about your project or inquiry..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={openGmail}
              className="flex-1"
            >
              <Mail className="mr-2 h-4 w-4" />
              Open in Gmail
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.6}>
          <p className="text-xs text-muted-foreground text-center">
            Your information is secure and will only be used to respond to your inquiry.
          </p>
        </FadeIn>
      </form>
    </div>
  );
}
