import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

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

/** Shared readable document layout for policy, help and service content. */
export default function InfoPage({ title, description, sections, updatedAt }: InfoPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="aura-container grid gap-8 py-8 lg:grid-cols-[12rem_minmax(0,46rem)] lg:py-12">
        <aside className="lg:pt-1">
          <nav aria-label="Điều hướng thông tin" className="flex gap-1 overflow-x-auto lg:flex-col">
            <Link
              href="/"
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Trang chủ
            </Link>
            <Link
              href="/help"
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Trợ giúp
            </Link>
            <Link
              href="/support"
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Hỗ trợ
            </Link>
          </nav>
        </aside>
        <article className="min-w-0">
          <header className="border-b border-border pb-7">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              {description}
            </p>
            {updatedAt ? (
              <p className="mt-4 text-sm text-muted-foreground">Cập nhật lần cuối: {updatedAt}</p>
            ) : null}
          </header>
          <div className="divide-y divide-border">
            {sections.map((section) => (
              <section key={section.title} className="py-7">
                <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <ChevronRight
                        className="mt-1 h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                {section.links?.length ? (
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {section.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm font-medium text-primary hover:text-primary-hover"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
          <footer className="border-t border-border pt-5 text-sm text-muted-foreground">
            Cần hỗ trợ thêm?{' '}
            <Link href="/support" className="font-medium text-primary hover:text-primary-hover">
              Liên hệ trung tâm hỗ trợ
            </Link>
            .
          </footer>
        </article>
      </div>
    </main>
  );
}
