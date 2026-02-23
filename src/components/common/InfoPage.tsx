import Link from "next/link";

interface InfoLink {
  href: string;
  label: string;
}

interface InfoSection {
  title: string;
  items: string[];
  links?: InfoLink[];
}

interface InfoPageProps {
  title: string;
  description: string;
  sections: InfoSection[];
  updatedAt?: string;
}

export default function InfoPage({
  title,
  description,
  sections,
  updatedAt,
}: InfoPageProps) {
  const quickLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/help", label: "Trợ giúp" },
    { href: "/support", label: "Hỗ trợ" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-2.5 py-1 rounded-full bg-[#f7f7f7] hover:bg-gray-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm md:text-base text-gray-600">{description}</p>
          {updatedAt ? (
            <p className="text-xs text-gray-400">Cập nhật lần cuối: {updatedAt}</p>
          ) : null}
        </header>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">{section.title}</h2>
              <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {section.links && section.links.length > 0 ? (
                <div className="flex flex-wrap gap-3 pt-1">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-[#E53935] hover:underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <footer className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Cần hỗ trợ thêm? Truy cập{" "}
            <Link href="/support" className="text-[#E53935] hover:underline">
              Trung tâm hỗ trợ
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
