export default function ProjectLoading() {
  return (
    <main className="my-14 flex-1">
      <div className="container mx-auto">
        <div className="mb-6 h-8 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mb-8 h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="my-12 aspect-video w-full animate-pulse rounded-lg bg-muted" />
        <div className="prose min-w-full space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}

