import Link from "next/link";

const groups = [
  {
    title: "Mua sắm",
    links: [
      { href: "/", label: "Trang chủ" },
      { href: "/products", label: "Sản phẩm" },
      { href: "/categories", label: "Danh mục" },
      { href: "/flash-sale", label: "Flash Sale" },
      { href: "/vouchers", label: "Voucher" },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { href: "/profile", label: "Hồ sơ" },
      { href: "/profile?tab=orders", label: "Đơn hàng" },
      { href: "/wishlist", label: "Yêu thích" },
      { href: "/cart", label: "Giỏ hàng" },
    ],
  },
  {
    title: "Thông tin",
    links: [
      { href: "/help", label: "Trợ giúp" },
      { href: "/support", label: "Hỗ trợ" },
      { href: "/terms", label: "Điều khoản" },
      { href: "/privacy", label: "Bảo mật" },
      { href: "/shipping", label: "Vận chuyển" },
    ],
  },
];

export default function SiteMapPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f7] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sơ đồ trang web</h1>
          <p className="text-sm md:text-base text-gray-600">
            Danh sách các khu vực chính để truy cập nhanh.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {groups.map((group) => (
            <section key={group.title} className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">{group.title}</h2>
              <ul className="space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#E53935] hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
