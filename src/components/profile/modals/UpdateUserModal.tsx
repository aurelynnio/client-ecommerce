'use client';
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

interface UpdateUserProfileProps {
  open: boolean;
  setOpen?: (prev: boolean) => void;
}

const formSchema = z.object({
  avatar: z.string().url({ message: 'Vui lòng nhập URL hợp lệ.' }),
  username: z.string().min(2, {
    message: 'Tên người dùng phải có ít nhất 2 ký tự.',
  }),
  email: z.string().email({ message: 'Vui lòng nhập địa chỉ email hợp lệ.' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' }).optional(),
});

export default function UpdateUserProfile({ open, setOpen }: UpdateUserProfileProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      avatar: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Profile update is handled by useUpdateProfile hook in parent component
    void values; // Placeholder until backend integration
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@vi-du.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen && setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
