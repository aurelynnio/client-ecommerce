import {
  ShoppingCart,
  Users,
  Package,
  Settings,
  Bell,
  Album,
  LayoutDashboardIcon,
  Image as ImageIcon,
  Store,
  Zap,
  Tag,
  Shield,
  Star,
  Bot,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';
import { PERMISSIONS } from './permissions';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  permission?: string; // Required permission to view this item
}

export const ADMIN_NAVIGATION: NavigationItem[] = [
  {
    name: 'Bảng điều khiển',
    href: '/admin/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    name: 'Sản phẩm',
    href: '/admin/products',
    icon: Package,
    permission: PERMISSIONS.PRODUCT_READ,
  },
  {
    name: 'Đơn hàng',
    href: '/admin/orders',
    icon: ShoppingCart,
    permission: PERMISSIONS.ORDER_READ,
  },
  {
    name: 'Người dùng',
    href: '/admin/users',
    icon: Users,
    permission: PERMISSIONS.USER_READ,
  },
  {
    name: 'Quyền hạn',
    href: '/admin/permissions',
    icon: Shield,
    permission: PERMISSIONS.USER_MANAGE,
  },
  {
    name: 'Cửa hàng',
    href: '/admin/shops',
    icon: Store,
    permission: PERMISSIONS.SHOP_READ,
  },
  {
    name: 'Danh mục',
    href: '/admin/categories',
    icon: Album,
    permission: PERMISSIONS.CATEGORY_READ,
  },
  {
    name: 'Mã giảm giá',
    href: '/admin/vouchers',
    icon: Tag,
    permission: PERMISSIONS.VOUCHER_READ,
  },
  {
    name: 'Đánh giá',
    href: '/admin/reviews',
    icon: Star,
  },
  {
    name: 'Flash Sale',

    href: '/admin/flash-sale',
    icon: Zap,
    badge: 'Mới',
    permission: PERMISSIONS.FLASH_SALE_READ,
  },
  {
    name: 'Banner',
    href: '/admin/banners',
    icon: ImageIcon,
    permission: PERMISSIONS.BANNER_READ,
  },
  {
    name: 'Thông báo',
    href: '/admin/notifications',
    icon: Bell,
    permission: PERMISSIONS.NOTIFICATION_READ,
  },
  {
    name: 'Trợ lý AI',
    href: '/admin/chatbot',
    icon: Bot,
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: 'Cài đặt',

    href: '/admin/settings',
    icon: Settings,
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
];
