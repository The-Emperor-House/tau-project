import Image from "next/image";
import Link from "next/link";
import PageShell from "@/shared/components/site/PageShell";
import { DESIGN_TYPES } from "./designTypes";

export const metadata = {
  title: "Design - TAURUS : WE RENEW",
};

function DesignTile({ type, priority }) {
  return (
    <Link
      href={`/design/${type.value}`}
      className="group block bg-white/[0.04] ring-1 ring-white/10 hover:ring-site-accent/50 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-accent"
    >
      <div className="relative w-full overflow-hidden aspect-[100/58]">
        <Image
          src={type.cover}
          alt={type.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
        />
      </div>
      <div className="px-6 md:px-10 py-6 md:py-8 text-center">
        <h2 className="text-white font-light uppercase tracking-[0.18em] md:tracking-[0.28em] text-[1.1rem] md:text-[1.75rem] leading-tight transition-colors group-hover:text-site-accent">
          {type.title}
        </h2>
        <p className="mt-2 text-white/50 text-sm">{type.subtitle}</p>
        <span className="mx-auto mt-4 block h-px w-10 bg-site-accent transition-all duration-500 group-hover:w-24" />
      </div>
    </Link>
  );
}

export default function DesignPage() {
  return (
    <PageShell className="max-w-[1400px] md:px-8">
      <div className="text-right mb-8 md:mb-12">
        <h1 className="text-white font-light uppercase tracking-[0.4em] md:tracking-[0.6em] text-[1.6rem] md:text-[3rem]">
          Design
        </h1>
        <span className="ml-auto mt-3 block h-px w-24 md:w-40 bg-gradient-to-l from-site-accent to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {DESIGN_TYPES.map((t, i) => (
          <DesignTile key={t.value} type={t} priority={i === 0} />
        ))}
      </div>
    </PageShell>
  );
}
