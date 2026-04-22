export function AuthMethodsSection({
  initial,
}: {
  initial: {
    user: { role: string }
    methods: { id: string; providerId: string; accountId: string }[]
  }
}) {
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h2 className="text-base font-semibold">Authentication Methods</h2>
      <p className="text-muted-foreground text-sm">Role: {initial.user.role}</p>
      <p className="text-muted-foreground text-sm">Passkeys: Not configured</p>
      <ul className="space-y-1">
        {initial.methods.map((method) => (
          <li key={method.id} className="text-sm">
            {method.providerId} • {method.accountId}
          </li>
        ))}
        {initial.methods.length === 0 && (
          <li className="text-muted-foreground text-sm">No linked methods</li>
        )}
      </ul>
    </section>
  )
}
