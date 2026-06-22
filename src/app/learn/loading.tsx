export default function LearnLoading() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="space-y-4 w-full max-w-md">
        <div className="h-8 w-48 bg-border rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-full bg-border rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
