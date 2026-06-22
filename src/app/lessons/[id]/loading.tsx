export default function LessonsLoading() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="space-y-4 w-full max-w-lg">
        <div className="h-4 w-full bg-border rounded animate-pulse" />
        <div className="h-8 w-64 bg-border rounded animate-pulse mx-auto" />
        <div className="space-y-3 pt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-full bg-border rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
