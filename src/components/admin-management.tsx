'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addAdmin, removeAdmin } from '@/app/volunteer/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import type { AdminUser } from '@/types';

interface AdminManagementProps {
  initialAdmins: AdminUser[];
  token: string;
  currentUserUid: string;
  onRefresh: () => void;
}

const AddAdminSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type AddAdminFormValues = z.infer<typeof AddAdminSchema>;

export function AdminManagement({ initialAdmins, token, currentUserUid, onRefresh }: AdminManagementProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddAdminFormValues>({
    resolver: zodResolver(AddAdminSchema),
  });

  const onAddAdmin: SubmitHandler<AddAdminFormValues> = async (data) => {
    setIsSubmitting(true);
    const result = await addAdmin(data.email, token);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else if (result.admin) {
      toast({ title: 'Success', description: `Added ${result.admin.email} as an admin.` });
      onRefresh();
      reset();
    }
    setIsSubmitting(false);
  };

  const onRemoveAdmin = async (uid: string, email: string) => {
    setIsDeleting(uid);
    const result = await removeAdmin(uid, token);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      toast({ title: 'Success', description: `Admin ${email} removed successfully.` });
      onRefresh();
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onAddAdmin)} className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-full flex-grow">
              <Input
                id="email"
                type="email"
                placeholder="Enter user's email address"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Admin
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialAdmins.map((admin) => (
                  <TableRow key={admin.uid}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting === admin.uid || admin.uid === currentUserUid}
                            title={admin.uid === currentUserUid ? "You cannot remove yourself" : "Remove admin"}
                          >
                            {isDeleting === admin.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            <span className="sr-only">Remove Admin</span>
                          </Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove admin privileges for {admin.email}. They will no longer be able to access this page.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onRemoveAdmin(admin.uid, admin.email)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                 {initialAdmins.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            No administrators found. Add one above.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
