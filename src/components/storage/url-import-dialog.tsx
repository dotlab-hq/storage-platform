'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UrlImportForm } from '@/components/storage/url-import-form'
import type { UrlImportDialogProps } from '@/components/storage/url-import-dialog-types'
import { validateUrlByHead } from '@/components/storage/url-import-dialog-utils'
import { useUrlImportDialog } from '@/components/storage/use-url-import-dialog'

export function UrlImportDialog({
  open,
  onOpenChange,
  currentFolderId,
  onImportComplete,
}: UrlImportDialogProps) {
  const model = useUrlImportDialog({ currentFolderId, onImportComplete })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import from Internet</DialogTitle>
          <DialogDescription>
            Queue a URL fetch job. It retries up to 10 times and uploads
            directly to your provider.
          </DialogDescription>
        </DialogHeader>
        <UrlImportForm
          state={model.state}
          validation={model.validation}
          onUrlChange={(value) =>
            model.setState((prev) => ({ ...prev, url: value }))
          }
          onSavePathChange={(value) =>
            model.setState((prev) => ({ ...prev, savePath: value }))
          }
          onMethodChange={model.setMethod}
          onHeadersChange={(value) =>
            model.setState((prev) => ({ ...prev, headersRaw: value }))
          }
          onCookiesChange={(value) =>
            model.setState((prev) => ({ ...prev, cookiesRaw: value }))
          }
          onCurlChange={model.handleCurlChange}
          generatedCurl={model.generatedCurl}
          curlError={model.curlError}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              model.setValidation((prev) => ({ ...prev, loading: true }))
              void validateUrlByHead(model.state.url).then((result) => {
                model.setValidation({ loading: false, ...result })
              })
            }}
            disabled={model.validation.loading}
          >
            Validate URL
          </Button>
          <Button
            onClick={() => model.createJobMutation.mutate()}
            disabled={!model.canQueue || model.createJobMutation.isPending}
          >
            Queue Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
