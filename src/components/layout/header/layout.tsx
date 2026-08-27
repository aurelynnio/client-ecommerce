'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Heart,
  Loader2,
  Menu,
  MessageCircle,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
  Zap,
  Ticket,
  Sparkles,
  Store,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import NotificationModel from '@/components/notifications/NotificationModel';
import TopUtilityBar from './TopUtilityBar';
import { BRAND_CONFIG, pathArray } from '@/constants';
import { toggleChat } from '@/features/chat/chatSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCart } from '@/hooks/queries/useCart';
import { useCategoryTree } from '@/hooks/queries/useCategories';
import { useUnreadNotificationCount } from '@/hooks/queries/useNotifications';
import { useSearchSuggestions } from '@/hooks/queries/useSearch';
import { useWishlistCount } from '@/hooks/queries/useWishlist';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import { AnimatePresence } from 'framer-motion';
import { AnimatedDropdown } from '@/components/motion/primitives';

function Count({ value }: { value: number }) {
  if (!value) return null;
  return (
    <Badge
      variant="default"
      className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
    >
      {value > 99 ? '99+' : value}
    </Badge>
  );
}

function IconLink({
  href,
  label,
  children,
  count,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
      <Count value={count ?? 0} />
    </Link>
  );
}

export default function HeaderLayout() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, data } = useAppSelector((state) => state.auth);
  const isChatOpen = useAppSelector((state) => state.chat.isOpen);
  const { data: cartQueryData } = useCart({ enabled: isAuthenticated });
  const { data: categoryTree = [] } = useCategoryTree();
  const { data: wishlistCount = 0 } = useWishlistCount({ enabled: isAuthenticated });
  const { data: unreadCount = 0 } = useUnreadNotificationCount({ enabled: isAuthenticated });
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  });
  const categoryRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearching } = useSearchSuggestions(
    debouncedQuery.trim(),
    6,
  );

  const categories = useMemo(() => categoryTree.slice(0, 10), [categoryTree]);
  const cartCount = cartQueryData?.items?.reduce((total, item) => total + item.quantity, 0) ?? 0;

  useEffect(() => {
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (categoryRef.current && !categoryRef.current.contains(target)) {
        setCategoriesOpen(false);
        setHoveredCategory(null);
      }
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCategoriesOpen(false);
        setHoveredCategory(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  if (pathArray.includes(pathname)) return null;

  const submitSearch = (event?: React.FormEvent, term = searchQuery) => {
    event?.preventDefault();
    const query = term.trim();
    if (!query) return;
    const next = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 6);
    setRecentSearches(next);
    localStorage.setItem('recentSearches', JSON.stringify(next));
    setSearchQuery('');
    setSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  const renderSearchBox = (mobile = false) => {
    const showClearButton = searchQuery.length > 0;
    const panelId = mobile ? 'mobile-search-panel' : 'desktop-search-panel';

    return (
      <div
        ref={mobile ? undefined : searchRef}
        className={cn('relative', mobile ? 'w-full' : 'hidden min-w-0 flex-1 md:block')}
      >
        <form
          onSubmit={submitSearch}
          className="flex h-10 items-center rounded-lg border border-input bg-card overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-ring"
        >
          <div className="flex items-center pl-3 pr-2 text-muted-foreground">
            {isSearching ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
          </div>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setSearchOpen(true)}
            placeholder="Tìm sản phẩm, thương hiệu, mã giảm giá..."
            className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Tìm kiếm sản phẩm"
            aria-autocomplete="list"
            aria-expanded={searchOpen && !mobile}
            aria-controls={searchOpen && !mobile ? panelId : undefined}
            role="combobox"
            autoComplete="off"
          />
          {showClearButton && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchOpen(false);
              }}
              aria-label="Xoá từ khoá tìm kiếm"
              className="mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          <button
            type="submit"
            className="h-full shrink-0 bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            Tìm
          </button>
        </form>
        {searchOpen && !mobile && (
          <AnimatePresence>
            <AnimatedDropdown
              id={panelId}
              role="listbox"
              aria-label="Gợi ý tìm kiếm"
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-lg border border-border bg-popover p-2 shadow-lg"
            >
              {searchQuery.trim().length >= 2 ? (
                isSearching ? (
                  <p className="p-3 text-sm text-muted-foreground">Đang tìm kiếm...</p>
                ) : searchResults?.products?.length || searchResults?.shops?.length ? (
                  <div className="space-y-1">
                    {searchResults?.products?.slice(0, 5).map((product) => (
                      <button
                        type="button"
                        key={product._id}
                        onClick={() => {
                          setSearchOpen(false);
                          router.push(`/products/${product.slug}`);
                        }}
                        className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-muted"
                      >
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                          {product.images?.[0] && (
                            <Image src={product.images[0]} alt="" fill className="object-cover" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{product.name}</span>
                          <span className="text-sm text-primary">
                            {formatCurrency(
                              product.price?.discountPrice || product.price?.currentPrice || 0,
                            )}
                          </span>
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => submitSearch()}
                      className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-primary hover:bg-muted"
                    >
                      Xem tất cả kết quả cho “{searchQuery}”
                    </button>
                  </div>
                ) : (
                  <p className="p-3 text-sm text-muted-foreground">Không tìm thấy kết quả phù hợp.</p>
                )
              ) : (
                <div className="p-2">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Tìm gần đây</p>
                    {recentSearches.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem('recentSearches');
                        }}
                        aria-label="Xoá lịch sử tìm kiếm"
                        className="rounded p-1 text-muted-foreground hover:bg-muted"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {recentSearches.length ? (
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button
                          type="button"
                          key={term}
                          onClick={() => submitSearch(undefined, term)}
                          className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-primary"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="py-2 text-sm text-muted-foreground">Nhập từ khoá để tìm sản phẩm.</p>
                  )}
                </div>
              )}
            </AnimatedDropdown>
          </AnimatePresence>
        )}
      </div>
    );
  };

  const renderMobileCategoryLinks = (onNavigate?: () => void) => (
    <nav aria-label="Danh mục sản phẩm" className="grid gap-1 sm:grid-cols-2">
      {categories.map((category) => (
        <div key={category._id} className="rounded-md p-2 hover:bg-muted">
          <Link
            href={`/products?category=${category.slug}`}
            onClick={onNavigate}
            className="block text-sm font-medium text-foreground hover:text-primary"
          >
            {category.name}
          </Link>
          {category.subcategories?.slice(0, 4).map((child) => (
            <Link
              key={child._id}
              href={`/products?category=${category.slug}&subcategory=${child.slug}`}
              onClick={onNavigate}
              className="mt-1 block text-sm text-muted-foreground hover:text-primary"
            >
              {child.name}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );

  // Tmall-style mega menu: left rail of categories + right panel of subcategories
  const hoveredCat = categories.find((c) => c._id === hoveredCategory);

  return (
    <>
      <TopUtilityBar />
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        {/* Main row: logo + mega search + actions */}
        <div className="aura-container flex h-16 items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Mở danh mục"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(22rem,90vw)]">
              <SheetHeader>
                <SheetTitle>Danh mục</SheetTitle>
              </SheetHeader>
              <div className="mt-5">
                {renderSearchBox(true)}
                <div className="mt-5">{renderMobileCategoryLinks()}</div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex shrink-0 items-center" aria-label={BRAND_CONFIG.name}>
            <Image
              src="/images/logo-aura-red.png"
              alt={BRAND_CONFIG.name}
              width={110}
              height={40}
              className="h-9 w-28 object-contain"
              priority
            />
          </Link>

          {renderSearchBox()}

          <div className="ml-auto flex items-center gap-1">
            {isAuthenticated && (
              <>
                <IconLink href="/wishlist" label="Danh sách yêu thích" count={wishlistCount}>
                  <Heart className="h-5 w-5" />
                </IconLink>
                <button
                  type="button"
                  aria-label="Mở trợ lý Mia"
                  aria-expanded={isChatOpen}
                  aria-haspopup="dialog"
                  onClick={() => dispatch(toggleChat())}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Thông báo"
                  onClick={() => setNotificationsOpen(true)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Bell className="h-5 w-5" />
                  <Count value={unreadCount} />
                </button>
              </>
            )}
            <IconLink href="/cart" label="Giỏ hàng" count={cartCount}>
              <ShoppingCart className="h-5 w-5" />
            </IconLink>
            {isAuthenticated ? (
              <Link
                href="/profile"
                aria-label="Tài khoản"
                className="hidden h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium hover:bg-muted sm:inline-flex"
              >
                {data?.avatar ? (
                  <span className="relative h-7 w-7 overflow-hidden rounded-full">
                    <Image src={data.avatar} alt="" fill className="object-cover" />
                  </span>
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="hidden lg:inline">Tài khoản</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted sm:inline-flex"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>

        {/* Category nav row — Tmall-style horizontal bar with mega menu */}
        <div className="hidden border-t border-border bg-card md:block">
          <div
            className="aura-container relative flex h-11 items-center gap-1"
            ref={categoryRef}
            onMouseLeave={() => {
              setCategoriesOpen(false);
              setHoveredCategory(null);
            }}
          >
            <button
              type="button"
              aria-expanded={categoriesOpen}
              aria-controls="desktop-category-panel"
              onClick={() => setCategoriesOpen((open) => !open)}
              onMouseEnter={() => setCategoriesOpen(true)}
              className="inline-flex h-8 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              <Menu className="h-3.5 w-3.5" aria-hidden="true" />
              Tất cả danh mục
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform duration-200', categoriesOpen && 'rotate-180')}
                aria-hidden="true"
              />
            </button>

            <nav className="flex items-center gap-0.5" aria-label="Khám phá">
              <Link
                href="/flash-sale"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Flash Sale
              </Link>
              <Link
                href="/vouchers"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Ticket className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Vouchers
              </Link>
              <Link
                href="/new-arrivals"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Hàng mới về
              </Link>
              <Link
                href="/seller"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Store className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Kênh người bán
              </Link>
            </nav>

            <AnimatePresence>
              {categoriesOpen && (
                <AnimatedDropdown
                  id="desktop-category-panel"
                  role="region"
                  aria-label="Danh mục sản phẩm"
                  className="absolute left-0 top-[calc(100%+0.5rem)] z-50 flex w-[min(56rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                >
                  {/* Left rail — category list */}
                  <ul className="w-56 shrink-0 overflow-y-auto border-r border-border bg-muted/20 p-1.5 space-y-0.5">
                    {categories.map((category) => (
                      <li key={category._id}>
                        <button
                          type="button"
                          onMouseEnter={() => setHoveredCategory(category._id)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors',
                            hoveredCategory === category._id
                              ? 'bg-primary-light font-semibold text-primary'
                              : 'text-foreground hover:bg-muted hover:text-primary',
                          )}
                        >
                          {category.name}
                          <ChevronDown className="h-3 w-3 -rotate-90 opacity-50" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Right panel — subcategories grid */}
                  <div className="flex-1 p-4">
                    {hoveredCat ? (
                      <>
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-foreground">
                            {hoveredCat.name}
                          </h3>
                          <Link
                            href={`/products?category=${hoveredCat.slug}`}
                            onClick={() => {
                              setCategoriesOpen(false);
                              setHoveredCategory(null);
                            }}
                            className="text-xs font-medium text-primary hover:text-primary-hover"
                          >
                            Xem tất cả →
                          </Link>
                        </div>
                        {hoveredCat.subcategories?.length ? (
                          <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                            {hoveredCat.subcategories.map((child) => (
                              <Link
                                key={child._id}
                                href={`/products?category=${hoveredCat.slug}&subcategory=${child.slug}`}
                                onClick={() => {
                                  setCategoriesOpen(false);
                                  setHoveredCategory(null);
                                }}
                                className="truncate rounded px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-primary-light hover:text-primary"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="py-4 text-sm text-muted-foreground">
                            Chưa có danh mục con.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="py-4 text-sm text-muted-foreground">
                        Di chuột lên danh mục để xem chi tiết.
                      </p>
                    )}
                  </div>
                </AnimatedDropdown>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
      <NotificationModel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
