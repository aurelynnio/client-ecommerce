import {trustItems} from "@/constants/trustbar";



export default function TrustBar() {
  return (
    <section className="border-y border-border bg-card">
      <div className="aura-container grid grid-cols-2 gap-px overflow-hidden bg-border lg:grid-cols-4">
        {trustItems.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-center gap-3 bg-card px-4 py-4 transition-colors hover:bg-primary-light"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
