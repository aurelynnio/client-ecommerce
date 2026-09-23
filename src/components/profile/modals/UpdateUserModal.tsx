'use client';
import { useEffect } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useUpdateProfile } from '@/hooks/queries/useProfile';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '@/api';

interface UpdateUserProfileProps {
  open: boolean;
  setOpen?: (open: boolean) => void;
  user?: User;
}

const formSchema = z.object({
  fullName: z.string().max(100).optional(),
  username: z.string().min(2, {
    message: 'Tên người dùng phải có ít nhất 2 ký tự.',
  }),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, { message: 'Số điện thoại không hợp lệ (10-11 chữ số).' })
    .or(z.literal(''))
    .optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function UpdateUserProfile({ open, setOpen, user }: UpdateUserProfileProps) {
  const updateProfileMutation = useUpdateProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      username: '',
      phone: '',
      gender: undefined,
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        fullName: user.fullName || '',
        username: user.username || '',
        phone: user.phone || '',
        gender: (user.gender as 'male' | 'female' | 'other') || undefined,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      });
    }
  }, [user, open, form]);

  async function onSubmit(values: FormValues) {
    try {
      await updateProfileMutation.mutateAsync({
        username: values.username,
        fullName: values.fullName || undefined,
        phone: values.phone || undefined,
        gender: values.gender || null,
        dateOfBirth: values.dateOfBirth || null,
      });
      toast.success('Cập nhật hồ sơ thành công');
      if (setOpen) setOpen(false);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Cập nhật hồ sơ thất bại'));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin hồ sơ của bạn tại đây. Nhấn lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên người dùng</FormLabel>
                  <FormControl>
                    <Input placeholder="tên người dùng" {...field} />
                  </FormControl>
                  <FormDescription>Tên hiển thị công khai.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="0987654321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || undefined)}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen && setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
