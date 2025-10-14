export default function BlogLoading() {
  return (
    <main className="my-14 flex-1">
      <section className="relative flex min-h-[calc(40dvh)] items-center justify-center" id="hero">
        <div className="flex flex-col items-center md:max-w-7xl">
          <div className="h-12 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mt-6 h-1 w-64 animate-pulse rounded bg-muted" />
        </div>
      </section>
      <section className="grid w-full grid-cols-1 gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative flex h-full flex-col justify-between rounded-lg border p-3"
          >
            <div className="mb-2 aspect-video w-full animate-pulse rounded-md bg-muted" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-9 w-10 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </section>
    </main>
  );
}

