import { trustItems } from '@/constants/trustbar';
import { cn } from '@/utils/cn';

export default function TrustBar() {
  return (
    <section className="border-y border-border bg-card">
      <div className="aura-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border">
          {trustItems.map(({ icon: Icon, title, description }, index) => {
            const isCol0 = index % 2 === 0;
            const isRow0 = index < 2;

            return (
              <div
                key={title}
                className={cn(
                  'flex items-center gap-3 px-3 py-4 transition-colors hover:bg-primary-light sm:px-4 lg:px-6',
                  isCol0 && 'border-r border-border lg:border-r-0',
                  isRow0 && 'border-b border-border lg:border-b-0',
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="truncate text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
