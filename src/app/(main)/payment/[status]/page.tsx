'use client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShoppingBag,
  Home,
  RefreshCcw,
  ReceiptText,
  Truck,
  Shield,
} from 'lucide-react';

export default function PaymentResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = (params.status as string) || 'error';
  const orderId = searchParams.get('orderId');
  const normalizedStatus = status === 'success' || status === 'failed' ? status : 'error';

  const contentConfig = {
    success: {
      title: 'Thanh toán thành công',
      description:
        'Đơn hàng của bạn đã được xác nhận. Hệ thống sẽ xử lý và cập nhật trạng thái giao hàng sớm nhất.',
      icon: CheckCircle2,
      iconWrapperClass: 'bg-success/15',
      iconClass: 'text-success',
      noteClass: 'border-success/30 bg-success/10 text-foreground',
      note: 'Bạn có thể theo dõi tiến độ ở mục Đơn hàng.',
      primaryActionLabel: 'Xem đơn hàng của tôi',
      primaryActionIcon: ShoppingBag,
      primaryAction: () => router.push('/profile?tab=orders'),
      secondaryActionLabel: 'Tiếp tục mua sắm',
      secondaryActionIcon: Home,
      secondaryAction: () => router.push('/'),
      quickItems: [
        {
          icon: ReceiptText,
          title: 'Xác nhận đơn hàng',
          text: 'Đơn hàng đã ghi nhận trong hệ thống.',
        },
        {
          icon: Truck,
          title: 'Chuẩn bị giao hàng',
          text: 'Shop sẽ đóng gói và bàn giao cho đơn vị vận chuyển.',
        },
      ],
    },
    failed: {
      title: 'Thanh toán thất bại',
      description:
        'Giao dịch chưa hoàn tất. Vui lòng kiểm tra lại phương thức thanh toán và thử lại.',
      icon: XCircle,
      iconWrapperClass: 'bg-destructive/15',
      iconClass: 'text-destructive',
      noteClass: 'border-destructive/30 bg-destructive/10 text-foreground',
      note: 'Nếu đã bị trừ tiền, vui lòng liên hệ hỗ trợ để kiểm tra giao dịch.',
      primaryActionLabel: 'Quay lại giỏ hàng',
      primaryActionIcon: RefreshCcw,
      primaryAction: () => router.push('/cart'),
      secondaryActionLabel: 'Về trang chủ',
      secondaryActionIcon: Home,
      secondaryAction: () => router.push('/'),
      quickItems: [
        {
          icon: Shield,
          title: 'Kiểm tra bảo mật',
          text: 'Xác nhận thông tin thẻ hoặc ví điện tử trước khi thử lại.',
        },
        {
          icon: ReceiptText,
          title: 'Kiểm tra lịch sử',
          text: 'Xem lại trạng thái đơn trong tài khoản cá nhân.',
        },
      ],
    },
    error: {
      title: 'Đã xảy ra lỗi',
      description:
        'Không thể xác minh trạng thái thanh toán vào lúc này. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
      icon: AlertCircle,
      iconWrapperClass: 'bg-warning/15',
      iconClass: 'text-warning',
      noteClass: 'border-warning/30 bg-warning/10 text-foreground',
      note: 'Chúng tôi đang xử lý sự cố để khôi phục dịch vụ sớm nhất.',
      primaryActionLabel: 'Về trang chủ',
      primaryActionIcon: Home,
      primaryAction: () => router.push('/'),
      secondaryActionLabel: 'Xem đơn hàng',
      secondaryActionIcon: ShoppingBag,
      secondaryAction: () => router.push('/profile?tab=orders'),
      quickItems: [
        {
          icon: AlertCircle,
          title: 'Lỗi hệ thống tạm thời',
          text: 'Vui lòng thử lại sau vài phút.',
        },
        {
          icon: ReceiptText,
          title: 'Giữ lại thông tin giao dịch',
          text: 'Bạn có thể dùng mã giao dịch để liên hệ hỗ trợ.',
        },
      ],
    },
  } as const;

  const config = contentConfig[normalizedStatus];
  const StatusIcon = config.icon;
  const PrimaryActionIcon = config.primaryActionIcon;
  const SecondaryActionIcon = config.secondaryActionIcon;

  return (
    <main className="min-h-[70vh] bg-background py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-6 border-b border-border pb-4">
          <h1 className="text-xl font-semibold text-foreground">Kết quả thanh toán</h1>
        </div>

        <section className="rounded-xl border border-border bg-card p-6 md:p-8">
          <div className="max-w-[700px] mx-auto text-center">
            <div
              className={`mx-auto flex size-16 items-center justify-center rounded-full ${config.iconWrapperClass}`}
            >
              <StatusIcon className={`h-11 w-11 ${config.iconClass}`} />
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {config.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
              {config.description}
            </p>

            {orderId && (
              <div className="mt-5 rounded-lg border border-border bg-muted/40 p-4 text-left">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Mã đơn hàng</p>
                <p className="font-mono text-lg font-semibold text-foreground">
                  #{orderId.slice(-8).toUpperCase()}
                </p>
              </div>
            )}

            <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${config.noteClass}`}>
              {config.note}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-left">
              {config.quickItems.map((item) => (
                <div key={item.title} className="rounded-lg border border-border p-4">
                  <item.icon className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button onClick={config.primaryAction} className="h-11 flex-1 text-sm font-medium">
                <PrimaryActionIcon className="h-4 w-4 mr-2" />
                {config.primaryActionLabel}
              </Button>
              <Button
                onClick={config.secondaryAction}
                variant="outline"
                className="h-11 flex-1 text-sm"
              >
                <SecondaryActionIcon className="h-4 w-4 mr-2" />
                {config.secondaryActionLabel}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
