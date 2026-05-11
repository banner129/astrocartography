"use client";

import dynamic from "next/dynamic";

function GeneratorLoading() {
  return (
    <section
      id="generator"
      className="relative bg-transparent py-8"
      aria-busy="true"
    >
      <div className="container">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-9 w-4/5 max-w-md animate-pulse rounded-md bg-muted/50" />
            <div className="mx-auto h-5 w-3/5 max-w-sm animate-pulse rounded-md bg-muted/40" />
          </div>
          <div className="min-h-[28rem] animate-pulse rounded-xl border border-white/10 bg-white/5" />
        </div>
      </div>
    </section>
  );
}

/** Code-split heavy generator; default SSR keeps HTML useful for crawlers. */
export default dynamic(() => import("./index"), {
  loading: () => <GeneratorLoading />,
});
