export default function DashboardLoading() {
  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-5xl mx-auto animate-pulse">
      {/* ClarityPanel skeleton */}
      <div className="rounded-3xl h-48 bg-muted" />
      {/* AccountCards skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="rounded-2xl h-24 bg-muted" />)}
        </div>
        <div className="rounded-2xl h-12 bg-muted" />
      </div>
      {/* Bottom grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-3xl h-64 bg-muted" />
        <div className="space-y-4">
          <div className="rounded-3xl h-28 bg-muted" />
          <div className="rounded-3xl h-28 bg-muted" />
        </div>
      </div>
    </div>
  )
}
