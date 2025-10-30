'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Announcement } from '@/types';
import { manageAnnouncement, deleteAnnouncement } from '@/app/announcements/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Loader2, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { MarkdownPreview } from './markdown-preview';
import { Label } from './ui/label';

interface AnnouncementManagementProps {
  initialAnnouncements: Announcement[];
  token: string;
  onRefresh: () => void;
}

const AnnouncementSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
});

type AnnouncementFormValues = z.infer<typeof AnnouncementSchema>;

function AnnouncementForm({
  isOpen,
  setIsOpen,
  announcement,
  token,
  onSave,
}: {
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  announcement: Announcement | null,
  token: string,
  onSave: () => void,
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: { content: announcement?.content || '' },
  });

  const onSubmit = async (values: AnnouncementFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    if (announcement?.id) {
      formData.append('id', announcement.id);
    }
    formData.append('content', values.content);

    const result = await manageAnnouncement(formData, token);
    if (result.success) {
      toast({ title: 'Success', description: `Announcement ${announcement ? 'updated' : 'created'}.` });
      onSave();
      setIsOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{announcement ? 'Edit Announcement' : 'Add New Announcement'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField 
              control={form.control} 
              name="content" 
              render={({ field }) => ( 
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[150px]" />
                  </FormControl>
                  <FormDescription>
                    You can use Markdown for formatting (e.g., **bold**, [link](https://...)).
                  </FormDescription>
                  <FormMessage />
                </FormItem> 
              )} 
            />
             <div>
              <Label>Preview</Label>
              <Card className="mt-2">
                <CardContent className="p-4 min-h-[50px]">
                  <MarkdownPreview content={form.watch('content')} />
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function AnnouncementManagement({ initialAnnouncements, token, onRefresh }: AnnouncementManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const { toast } = useToast();
  
  const handleAdd = () => {
    setSelected(null);
    setIsFormOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelected(announcement);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteAnnouncement(id, token);
    if (result.success) {
      toast({ title: 'Success', description: 'Announcement deleted.' });
      onRefresh();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Announcement
        </Button>
      </div>
      <div className="space-y-4">
        {initialAnnouncements.map(ann => (
          <Card key={ann.id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Posted on {format(new Date(ann.createdAt), 'PPP p')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownPreview content={ann.content} />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
               <Button variant="outline" size="sm" onClick={() => handleEdit(ann)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this announcement.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(ann.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
        {initialAnnouncements.length === 0 && (
           <div className="text-center py-16 border rounded-lg">
                <p className="text-muted-foreground text-lg">No announcements have been posted yet.</p>
            </div>
        )}
      </div>

      {isFormOpen && (
        <AnnouncementForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          announcement={selected}
          token={token}
          onSave={onRefresh}
        />
      )}
    </div>
  );
}
