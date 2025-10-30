'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Job } from '@/types';
import { addJob, updateJob } from '@/app/volunteer/actions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface JobFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  job: Job | null;
  token: string;
  onFormSubmit: () => void;
}

const JobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  category: z.enum(['Lead', 'Volunteer']),
  additionalQuestions: z.string().optional(),
});

export function JobFormDialog({ isOpen, setIsOpen, job, token, onFormSubmit }: JobFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof JobSchema>>({
    resolver: zodResolver(JobSchema),
  });
  
  useEffect(() => {
    if (isOpen) {
        if (job) {
          form.reset({
            title: job.title,
            description: job.description,
            category: job.category,
            additionalQuestions: job.additionalQuestions?.join('\n') || '',
          });
        } else {
          form.reset({
            title: '',
            description: '',
            category: 'Volunteer',
            additionalQuestions: '',
          });
        }
    }
  }, [job, form, isOpen]);

  async function onSubmit(values: z.infer<typeof JobSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('category', values.category);
    formData.append('additionalQuestions', values.additionalQuestions || '');

    const result = job
      ? await updateJob(job.id, formData, token)
      : await addJob(formData, token);

    if (result.success && result.job) {
      toast({ title: 'Success', description: result.success });
      onFormSubmit();
      setIsOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{job ? 'Edit Job' : 'Add New Job'}</DialogTitle>
          <DialogDescription>
            {job ? 'Update the details for this job posting.' : 'Create a new job posting for volunteers or leads.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto min-h-0">
          <ScrollArea className="h-full">
            <div className="px-2 pr-6 py-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Social Media Lead" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? 'Volunteer'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Volunteer">Volunteer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the responsibilities for this role..." className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additionalQuestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Questions</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Why do you want to volunteer?
What is your past experience?" className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormDescription>
                          Add any extra questions you want to ask applicants. Each question should be on a new line.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </ScrollArea>
        </div>
        <DialogFooter className="flex-shrink-0">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {job ? 'Save Changes' : 'Create Job'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
