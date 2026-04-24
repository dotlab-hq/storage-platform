import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Key, Shield } from 'lucide-react'

export function AuthMethodsSection({
  initial,
}: {
  initial: {
    user: { role: string }
    methods: { id: string; providerId: string; accountId: string }[]
  }
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-muted/30 p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
          <Shield className="text-primary size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Authentication Methods</h2>
          <p className="text-muted-foreground text-sm">
            Manage your login security
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Role Card */}
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="text-muted-foreground size-4" />
              <span className="text-sm font-medium">Account Role</span>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {initial.user.role}
            </Badge>
          </div>
        </div>

        {/* Auth Methods Table */}
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Account ID</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initial.methods.length > 0 ? (
                initial.methods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium capitalize">
                      {method.providerId}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground text-xs">
                      {method.accountId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="text-green-500 size-4" />
                        <span className="text-green-600 text-xs font-medium">
                          Active
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground py-8 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Key className="size-8 opacity-50" />
                      <span>No authentication methods linked</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
