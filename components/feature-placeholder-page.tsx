import type { LucideIcon } from "lucide-react";

type FeaturePlaceholderPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function FeaturePlaceholderPage({
  title,
  description,
  icon: Icon,
}: FeaturePlaceholderPageProps) {
  return (
    <main className="min-h-[70dvh] bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#06101f] dark:text-white sm:px-6">
      <section className="mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#0b3a75]/10 text-[#0b3a75] dark:bg-blue-400/10 dark:text-blue-200">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-white/60">
              {description}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
