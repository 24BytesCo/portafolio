export default function ProjectLoading() {
  return (
    <main className="my-14 flex-1">
      <div className="container mx-auto">
        <div className="bg-muted mb-6 h-8 w-3/4 animate-pulse rounded" />
        <div className="bg-muted mb-8 h-4 w-2/3 animate-pulse rounded" />
        <div className="bg-muted my-12 aspect-video w-full animate-pulse rounded-lg" />
        <div className="prose min-w-full space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted h-4 w-full animate-pulse rounded"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
