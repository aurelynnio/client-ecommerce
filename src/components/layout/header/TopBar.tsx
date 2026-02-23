"use client";
import Link from "next/link";
import { useAppSelector } from "@/hooks/hooks";
import { useMyShop } from "@/hooks/queries/useShop";
import {
  MapPin,
  Phone,
  HelpCircle,
  Heart,
  User,
  ChevronDown,
  Globe,
  Smartphone,
  Store,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils/cn";

interface TopBarLinkProps {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const TopBarLink = ({ href, icon, children, className }: TopBarLinkProps) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-1 text-[11px] text-gray-600 hover:text-[#E53935] transition-colors duration-200",
      className,
    )}
  >
    {icon}
    <span>{children}</span>
  </Link>
);

const Divider = () => (
  <span className="h-3 w-px bg-gray-300 mx-3 hidden sm:block" />
);

export default function TopBar() {
  const { isAuthenticated, data } = useAppSelector((state) => state.auth);
  const { data: myShop } = useMyShop({ enabled: isAuthenticated });

  // Check if user has seller or admin role (can have a shop)
  const canHaveShop =
    data?.roles === "seller" ||
    data?.roles === "admin" ||
    (Array.isArray(data?.roles) &&
      (data.roles.includes("seller") || data.roles.includes("admin")));

  // Determine seller link based on role and shop status
  // If user has shop or is seller/admin, go to seller dashboard
  const hasShopAccess = myShop || canHaveShop;
  const sellerLink = hasShopAccess ? "/seller" : "/seller/register";
  const sellerText = hasShopAccess
    ? "Kênh người bán"
    : "Bán hàng cùng chúng tôi";

  return (
    <div className="w-full bg-muted border-b border-border hidden md:block">
      <div className="container mx-auto px-4 h-8 flex items-center justify-between max-w-[1400px]">
        {/* Left Side */}
        <div className="flex items-center">
          {/* Location */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-[#E53935] transition-colors duration-200 outline-none">
              <MapPin className="h-3 w-3" />
              <span>Giao đến: Việt Nam</span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-44 bg-white shadow-lg border-gray-200"
            >
              <DropdownMenuItem className="text-[11px] hover:bg-[#FFEBEE] hover:text-[#E53935] cursor-pointer">
                🇻🇳 Việt Nam
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] hover:bg-[#FFEBEE] hover:text-[#E53935] cursor-pointer">
                🇺🇸 Hoa Kỳ
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] hover:bg-[#FFEBEE] hover:text-[#E53935] cursor-pointer">
                🇯🇵 Nhật Bản
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] hover:bg-[#FFEBEE] hover:text-[#E53935] cursor-pointer">
                🇰🇷 Hàn Quốc
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Divider />

          {/* User greeting or login prompt */}
          {isAuthenticated && data ? (
            <span className="text-[11px] text-gray-600">
              Xin chào,{" "}
              <Link
                href="/profile"
                className="text-[#E53935] hover:underline font-medium"
              >
                {data.username || data.email?.split("@")[0]}
              </Link>
            </span>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-gray-600">
              <span>Xin chào,</span>
              <Link
                href="/login"
                className="text-[#E53935] hover:underline font-medium"
              >
                Đăng nhập
              </Link>
              <span>hoặc</span>
              <Link
                href="/register"
                className="text-[#E53935] hover:underline font-medium"
              >
                Đăng ký
              </Link>
            </div>
          )}

          <Divider />

          {/* Download App */}
          <TopBarLink
            href="/download"
            icon={<Smartphone className="h-3 w-3" />}
          >
            Tải ứng dụng
          </TopBarLink>

          <Divider />

          {/* Seller Center */}
          <TopBarLink
            href={sellerLink}
            icon={<Store className="h-3 w-3" />}
            className="font-medium text-[#E53935] hover:text-[#D32F2F]"
          >
            {sellerText}
          </TopBarLink>
        </div>

        {/* Right Side */}
        <div className="flex items-center">
          {/* Quick Links */}
          {isAuthenticated && (
            <>
              <TopBarLink
                href="/profile?tab=orders"
                icon={<User className="h-3 w-3" />}
              >
                Đơn hàng
              </TopBarLink>
              <Divider />
              <TopBarLink href="/wishlist" icon={<Heart className="h-3 w-3" />}>
                Yêu thích
              </TopBarLink>
              <Divider />
            </>
          )}

          {/* Support */}
          <TopBarLink href="/support" icon={<Phone className="h-3 w-3" />}>
            Hotline: 1900-6868
          </TopBarLink>

          <Divider />

          <TopBarLink href="/help" icon={<HelpCircle className="h-3 w-3" />}>
            Trợ giúp
          </TopBarLink>

          <Divider />

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-[#E53935] transition-colors duration-200 outline-none">
              <Globe className="h-3 w-3" />
              <span>Tiếng Việt</span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 bg-white shadow-lg border-gray-200"
            >
              <DropdownMenuItem className="text-[11px] hover:bg-[#FFEBEE] hover:text-[#E53935] cursor-pointer">
                🇻🇳 Tiếng Việt
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] hover:bg-[#FFEBEE] hover:text-[#E53935] cursor-pointer">
                🇺🇸 Tiếng Anh
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] hover:bg-[#FFEBEE] hover:text-[#E53935] cursor-pointer">
                🇯🇵 日本語
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] hover:bg-[#FFEBEE] hover:text-[#E53935] cursor-pointer">
                🇰🇷 한국어
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
