import type { ChatStatus } from 'ai'
import {
  Attachment,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from '@/components/ai-elements/attachments'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input'

type ChatPageComposerProps = {
  value: string
  isSending: boolean
  onChange: ( value: string ) => void
  onSubmit: ( value: string ) => void
}

function ComposerAttachments() {
  const attachments = usePromptInputAttachments()

  if ( attachments.files.length === 0 ) {
    return null
  }

  return (
    <Attachments variant="inline" className="mb-2 px-2">
      {attachments.files.map( ( file ) => (
        <Attachment
          key={file.id}
          data={file}
          onRemove={() => attachments.remove( file.id )}
        >
          <AttachmentPreview />
          <AttachmentInfo />
          <AttachmentRemove />
        </Attachment>
      ) )}
    </Attachments>
  )
}

export function ChatPageComposer( {
  value,
  isSending,
  onChange,
  onSubmit,
}: ChatPageComposerProps ) {
  const status: ChatStatus = isSending ? 'submitted' : 'ready'

  return (
    <div className="sticky bottom-0 mt-2 border bg-background/90 p-2 shadow-lg backdrop-blur sm:p-3">
      <PromptInput
        onSubmit={( { text } ) => {
          const next = text.trim()
          if ( next.length === 0 ) {
            return
          }
          onSubmit( next )
        }}
      >
        <PromptInputBody>
          <ComposerAttachments />
          <PromptInputTextarea
            value={value}
            onChange={( event ) => onChange( event.currentTarget.value )}
            placeholder="Type your message..."
            className="min-h-20"
          />
        </PromptInputBody>

        <PromptInputFooter className="border-t border-border pt-2">
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
                <PromptInputActionAddScreenshot />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>

          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-xs">
              Enter to send, Shift+Enter for newline
            </p>
            <PromptInputSubmit
              status={status}
              disabled={isSending || value.trim().length === 0}
            />
          </div>
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
