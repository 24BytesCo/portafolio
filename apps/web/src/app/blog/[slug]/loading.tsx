export default function BlogPostLoading() {
  return (
    <main className="my-24 flex-1 px-4">
      <div className="container rounded-xl border py-12 md:px-8">
        <div className="mb-2 h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-8 w-28 animate-pulse rounded bg-muted" />
      </div>
      <article className="container grid grid-cols-1 px-0 py-8 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-1 flex-col space-y-4 p-4">
          <div className="prose flex-1 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 border-l p-4 text-sm">
          <div>
            <div className="mb-1 h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </div>
          <div>
            <div className="mb-1 h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </article>
    </main>
  );
}

