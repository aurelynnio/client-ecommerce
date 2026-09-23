import { trustItems } from '@/constants/trustbar';
import { cn } from '@/utils/cn';

export default function TrustBar() {
  return (
    <section className="py-3 sm:py-4 bg-background">
      <div className="aura-container">
        <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border/60">
            {trustItems.map(({ icon: Icon, title, description }, index) => {
              const isCol0 = index % 2 === 0;
              const isRow0 = index < 2;

              return (
                <div
                  key={title}
                  className={cn(
                    'group flex items-center gap-3 sm:gap-3.5 p-3.5 sm:p-4 lg:px-6 transition-all duration-200 hover:bg-muted/30',
                    isCol0 && 'border-r border-border/60 lg:border-r-0',
                    isRow0 && 'border-b border-border/60 lg:border-b-0',
                  )}
                >
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/15 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-sm">
                    <Icon
                      className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-normal mt-0.5 whitespace-normal">
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

