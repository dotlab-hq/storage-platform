type DummyEmailPayload = {
  to: string
  subject: string
  html: string
  placement: "top" | "bottom"
}

export async function sendDummyEmail( payload: DummyEmailPayload ): Promise<void> {
  console.log( "[dummy-email] delivery", {
    to: payload.to,
    subject: payload.subject,
    placement: payload.placement,
    htmlLength: payload.html.length,
  } )
}
