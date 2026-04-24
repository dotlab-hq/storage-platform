import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Clock, Shield } from 'lucide-react'

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
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-muted/30 p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
          <Shield className="text-primary size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Tiny Sessions</h2>
          <p className="text-muted-foreground text-sm">
            Scan-based sessions last 10 minutes
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Sessions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="bg-green-500/10 flex size-6 items-center justify-center rounded-full">
              <span className="bg-green-500 size-2 rounded-full" />
            </div>
            <h3 className="font-medium">Active Sessions</h3>
            <Badge variant="secondary" className="ml-auto">
              {initial.tinySessions.active.length}
            </Badge>
          </div>

          {initial.tinySessions.active.length > 0 ? (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initial.tinySessions.active.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium capitalize">
                        {session.permission}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(session.expiresAt).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8">
              <Shield className="text-muted-foreground/50 size-8" />
              <span className="text-muted-foreground text-sm">
                No active tiny sessions
              </span>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-muted-foreground" />
            <h3 className="font-medium">Recent Sessions</h3>
            <Badge variant="secondary" className="ml-auto">
              {initial.tinySessions.recent.length}
            </Badge>
          </div>

          {initial.tinySessions.recent.length > 0 ? (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initial.tinySessions.recent.slice(0, 5).map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium capitalize">
                        {session.permission}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8">
              <Clock className="text-muted-foreground/50 size-8" />
              <span className="text-muted-foreground text-sm">
                No tiny sessions yet
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
