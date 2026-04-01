import { renderToStaticMarkup } from "react-dom/server"
import { ResetPasswordEmail } from "@/components/email/reset-password-email"
import { sendDummyEmail } from "@/lib/email/dummy-email-delivery"

type SendResetPasswordEmailArgs = {
  to: string
  resetUrl: string
  token: string
  recipientName: string
  placement: "top" | "bottom"
}

export async function sendResetPasswordEmail( args: SendResetPasswordEmailArgs ): Promise<void> {
  const html = renderToStaticMarkup(
    <ResetPasswordEmail
      name={args.recipientName}
      resetUrl={args.resetUrl}
      placement={args.placement}
    />,
  )

  await sendDummyEmail( {
    to: args.to,
    subject: "Set your password",
    html: `<!-- token:${args.token} -->${html}`,
    placement: args.placement,
  } )
}
