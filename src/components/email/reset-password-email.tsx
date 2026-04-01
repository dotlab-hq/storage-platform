type ResetPasswordEmailProps = {
  name: string
  resetUrl: string
  placement: "top" | "bottom"
}

export function ResetPasswordEmail( { name, resetUrl, placement }: ResetPasswordEmailProps ) {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-slate-200 p-6">
      <p className="mb-2 text-sm text-slate-500">Placement: {placement}</p>
      <h1 className="mb-2 text-xl font-semibold text-slate-900">Reset your password</h1>
      <p className="mb-4 text-sm text-slate-700">
        Hi {name}, use the link below to set or reset your password for DOT Storage Platform.
      </p>
      <a className="inline-block rounded bg-slate-900 px-4 py-2 text-sm text-white" href={resetUrl}>
        Set password
      </a>
      <p className="mt-4 break-all text-xs text-slate-500">{resetUrl}</p>
    </div>
  )
}
