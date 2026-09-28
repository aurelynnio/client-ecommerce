import Link from 'next/link';
import {services} from "@/constants/promoGrid";

/** A compact service row, deliberately not another promo-card grid. */
export default function PromoGrid() {
  return (
    <div className="grid gap-y-3 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
      {services.map(({ title, description, href, icon: Icon }) => (
        <Link
          key={title}
          href={href}
          className="group flex gap-3 py-4 first:pt-0 last:pb-0 sm:py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-sm font-medium text-foreground group-hover:text-primary">
              {title}
            </span>
            <span className="mt-1 block text-sm leading-5 text-muted-foreground">
              {description}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
