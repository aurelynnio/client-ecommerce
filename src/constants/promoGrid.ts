import { CreditCard, Headphones, RotateCcw, Truck } from 'lucide-react';

export const services = [
  {
    title: 'Giao hàng rõ ràng',
    description: 'Theo dõi chính sách và trạng thái giao hàng.',
    href: '/shipping',
    icon: Truck,
  },
  {
    title: 'Đổi trả dễ hiểu',
    description: 'Xem hướng dẫn đổi trả trước khi mua.',
    href: '/returns',
    icon: RotateCcw,
  },
  {
    title: 'Thanh toán an toàn',
    description: 'Lựa chọn phương thức phù hợp ở bước thanh toán.',
    href: '/sales',
    icon: CreditCard,
  },
  {
    title: 'Cần hỗ trợ?',
    description: 'Tìm câu trả lời hoặc gửi yêu cầu hỗ trợ.',
    href: '/support',
    icon: Headphones,
  },
];