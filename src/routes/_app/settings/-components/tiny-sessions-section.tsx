export function TinySessionsSection({
  initial,
}: {
  initial: {
    tinySessions: {
      active: { id: string; permission: string; expiresAt: Date }[]
      recent: { id: string; permission: string; createdAt: Date }[]
    }
  }
}) {
  return (
    <section className="space-y-3 rounded-lg border p-4 lg:col-span-2">
      <h2 className="text-base font-semibold">Tiny Sessions</h2>
      <p className="text-muted-foreground text-sm">
        Scan-based sessions last 10 minutes. Recent entries are shown below.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2 rounded-md border p-3">
          <h3 className="text-sm font-medium">Active</h3>
          <ul className="space-y-1">
            {initial.tinySessions.active.map((session) => (
              <li key={session.id} className="text-sm">
                {session.permission} • expires{' '}
                {new Date(session.expiresAt).toLocaleTimeString()}
              </li>
            ))}
            {initial.tinySessions.active.length === 0 && (
              <li className="text-muted-foreground text-sm">
                No active tiny sessions.
              </li>
            )}
          </ul>
        </div>
        <div className="space-y-2 rounded-md border p-3">
          <h3 className="text-sm font-medium">Recent</h3>
          <ul className="space-y-1">
            {initial.tinySessions.recent.slice(0, 8).map((session) => (
              <li key={session.id} className="text-sm">
                {session.permission} • created{' '}
                {new Date(session.createdAt).toLocaleString()}
              </li>
            ))}
            {initial.tinySessions.recent.length === 0 && (
              <li className="text-muted-foreground text-sm">
                No tiny sessions yet.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
