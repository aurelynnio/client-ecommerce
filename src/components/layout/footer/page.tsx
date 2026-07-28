'use client';
import { type FormEvent, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Facebook, Twitter, Instagram, Youtube, ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCategoryTree, useSubscribeNewsletter } from '@/hooks/queries';
import { getSafeErrorMessage } from '@/api';

import { BRAND_CONFIG } from '@/constants';

const FooterSection = ({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) => (
  <div className="space-y-4">
    <h4 className="font-semibold tracking-wide text-xs uppercase text-foreground/70">{title}</h4>
    <ul className="space-y-3 text-xs text-muted-foreground">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            href={link.href}
            className="hover:text-foreground transition-colors hover:underline"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default function FooterLayout() {
  const path = usePathname();
  const { data: categoryTree = [] } = useCategoryTree();
  const subscribeNewsletterMutation = useSubscribeNewsletter();
  const [email, setEmail] = useState('');

  const categoryLinks = useMemo(
    () =>
      categoryTree
        .filter((category) => Boolean(category.slug))
        .slice(0, 5)
        .map((category) => ({
          label: category.name,
          href: `/products?category=${category.slug}`,
        })),
    [categoryTree],
  );

  const socialLinks = useMemo(() => {
    const iconMap: Record<string, typeof Instagram> = {
      Facebook: Facebook,
      Instagram: Instagram,
      Twitter: Twitter,
      Youtube: Youtube,
    };

    return BRAND_CONFIG.socials
      .filter((social): social is { name: string; href: string } => Boolean(social.href))
      .map((social) => ({
        icon: iconMap[social.name] || Globe,
        href: social.href,
        name: social.name,
      }));
  }, []);

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      toast.error('Vui lòng nhập email');
      return;
    }

    try {
      const result = await subscribeNewsletterMutation.mutateAsync({
        email: normalizedEmail,
        source: 'footer',
      });
      toast.success(
        result.alreadySubscribed
          ? 'Email này đã đăng ký bản tin trước đó'
          : 'Đăng ký nhận bản tin thành công',
      );
      setEmail('');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể đăng ký bản tin'));
    }
  };

  if (path.startsWith('/admin')) return null;

  return (
    <footer className="w-full bg-muted/30 border-t border-border">
      <div className="aura-container py-12 sm:py-14">
        <div className="mb-12 grid grid-cols-1 gap-9 md:grid-cols-4">
          {/* Brand & Newsletter */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="block">
              <span className="text-lg font-bold tracking-tight text-primary">
                {BRAND_CONFIG.name.toUpperCase()}
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-[280px]">
              Đăng ký bản tin của chúng tôi để cập nhật những thông tin mới nhất, ưu đãi độc quyền
              và nhiều hơn thế nữa.
            </p>
            <form className="flex gap-2 max-w-[280px]" onSubmit={handleSubscribe}>
              <Input
                placeholder="Địa chỉ Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribeNewsletterMutation.isPending}
                className="bg-card border-border focus-visible:ring-primary text-xs h-9 rounded-lg px-4"
              />
              <Button
                type="submit"
                size="icon"
                disabled={subscribeNewsletterMutation.isPending}
                className="h-9 w-9 rounded-lg shrink-0"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>

            <div className="flex gap-1 pt-2">
              {socialLinks.map(({ icon: Icon, href, name }) => (
                <Button
                  key={href}
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
                >
                  <Link href={href} target="_blank" rel="noreferrer" aria-label={name}>
                    <Icon className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <FooterSection
            title="Cửa hàng"
            links={
              categoryLinks.length > 0
                ? categoryLinks
                : [{ label: 'Tất cả sản phẩm', href: '/products' }]
            }
          />

          <FooterSection
            title="Tài khoản"
            links={[
              { label: 'Quản lý tài khoản', href: '/profile' },
              { label: 'Đơn hàng', href: '/profile?tab=orders' },
              { label: 'Đổi trả', href: '/returns' },
              { label: 'Yêu thích', href: '/wishlist' },
            ]}
          />

          <FooterSection
            title="Chính sách"
            links={[
              { label: 'Điều khoản sử dụng', href: '/terms' },
              { label: 'Chính sách bảo mật', href: '/privacy' },
              { label: 'Chính sách Cookie', href: '/cookies' },
              { label: 'Chính sách vận chuyển', href: '/shipping' },
            ]}
          />
        </div>

        <Separator className="bg-border" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-muted-foreground pt-8">
          <p>{BRAND_CONFIG.copyright}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:underline">
              Điều khoản sử dụng
            </Link>
            <Link href="/sales" className="hover:underline">
              Bán hàng và Hoàn tiền
            </Link>
            <Link href="/legal" className="hover:underline">
              Pháp lý
            </Link>
            <Link href="/sitemap" className="hover:underline">
              Sơ đồ trang web
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
