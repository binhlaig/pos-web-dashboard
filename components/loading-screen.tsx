export type LoadingScreenProps = {
  variant?: "page" | "section" | "inline";
  title?: string;
  description?: string;
  className?: string;
};

/** Hook-free and usable from server or client components. Inline markup is also
 * valid inside paragraphs; table callers must keep their existing tr/td wrapper. */
export function LoadingScreen({
  variant = "page",
  title = "Loading…",
  description,
  className = "",
}: LoadingScreenProps) {
  const inline = variant === "inline";
  const container = variant === "page"
    ? "flex min-h-dvh w-full items-center justify-center bg-slate-50 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06),transparent_65%)] px-5 py-10 dark:bg-slate-950"
    : variant === "section"
      ? "flex min-h-40 w-full items-center justify-center px-4 py-8"
      : "inline-flex max-w-full items-center gap-2 align-middle";

  return (
    <span role="status" aria-live="polite" aria-atomic="true" className={`${container} text-slate-700 dark:text-slate-200 ${className}`}>
      <span className={inline ? "inline-flex min-w-0 items-center gap-2" : "flex w-full max-w-sm flex-col items-center gap-4 text-center"}>
        <span aria-hidden="true" className={`relative inline-flex shrink-0 items-center justify-center ${inline ? "size-5" : "size-14"}`}>
          <span className="absolute inset-0 rounded-full border-2 border-blue-200/70 border-t-blue-600 motion-safe:animate-spin dark:border-blue-900 dark:border-t-blue-400" />
          <span className={`font-semibold text-blue-700 dark:text-blue-300 ${inline ? "text-[9px]" : "text-xl"}`}>B</span>
        </span>
        <span className={inline ? "min-w-0 text-xs leading-5" : "min-w-0 space-y-2"}>
          <span className={inline ? "sr-only" : "block text-xs font-semibold tracking-[0.18em] text-blue-700 dark:text-blue-300"}>Binhlaig</span>
          <span className={inline ? "font-medium" : "block text-sm font-medium leading-6 sm:text-base"}>{title}</span>
          {description && <span className={`${inline ? "ml-2" : "block"} text-xs leading-5 text-slate-500 dark:text-slate-400`}>{description}</span>}
        </span>
      </span>
    </span>
  );
}
