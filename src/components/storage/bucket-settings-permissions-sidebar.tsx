import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'
import type { BucketSettingsUpdate } from '@/components/storage/bucket-settings-types'

type BucketSettingsPermissionsSidebarProps = {
  bucketName: string
  onUpdate: (update: BucketSettingsUpdate) => void
  onSetPolicy: (value: string) => void
  isPending: boolean
}

const publicReadTemplate = (bucketName: string) =>
  `{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Principal": "*",\n      "Action": ["s3:GetObject"],\n      "Resource": ["arn:aws:s3:::${bucketName}/*"]\n    }\n  ]\n}`

export function BucketSettingsPermissionsSidebar({
  bucketName,
  onUpdate,
  onSetPolicy,
  isPending,
}: BucketSettingsPermissionsSidebarProps) {
  const [pendingConfirm, setPendingConfirm] = useState<{
    update: BucketSettingsUpdate
    title: string
    description: string
    confirmLabel: string
    variant: 'primary' | 'warning'
  } | null>(null)

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Templates
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSetPolicy(publicReadTemplate(bucketName))}
          className="w-full justify-start border-border/60 bg-muted/20 text-foreground"
        >
          Template: Public Read
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSetPolicy('')}
          className="w-full justify-start border-red-500/40 text-red-200 hover:bg-red-500/10"
        >
          Clear Policy
        </Button>
        <div className="pt-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            ACL templates
          </p>
          <div className="mt-2 grid gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setPendingConfirm({
                  update: {
                    action: 'acl',
                    bucketName,
                    cannedAcl: 'private',
                  },
                  title: 'Make bucket private?',
                  description: 'Public access will be removed from this bucket.',
                  confirmLabel: 'Make private',
                  variant: 'primary',
                })
              }
              className="w-full justify-start border-border/60 bg-muted/20 text-foreground"
              disabled={isPending}
            >
              Template: Make Private
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setPendingConfirm({
                  update: {
                    action: 'acl',
                    bucketName,
                    cannedAcl: 'public-read',
                  },
                  title: 'Make bucket public?',
                  description:
                    'Objects will be readable by anyone with the URL.',
                  confirmLabel: 'Allow public read',
                  variant: 'warning',
                })
              }
              className="w-full justify-start border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
              disabled={isPending}
            >
              Template: Make Public Read
            </Button>
          </div>
        </div>
        <div className="pt-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Public access
          </p>
          <div className="mt-2 grid gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setPendingConfirm({
                  update: {
                    action: 'public-access',
                    bucketName,
                    blockPublicAccess: false,
                  },
                  title: 'Allow public ACLs?',
                  description:
                    'This enables public ACLs on bucket objects. Use with caution.',
                  confirmLabel: 'Allow public ACLs',
                  variant: 'warning',
                })
              }
              className="w-full justify-start border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
              disabled={isPending}
            >
              Allow Public ACL
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setPendingConfirm({
                  update: {
                    action: 'public-access',
                    bucketName,
                    blockPublicAccess: true,
                  },
                  title: 'Enforce private access?',
                  description:
                    'This blocks all public ACLs for bucket objects.',
                  confirmLabel: 'Enforce private access',
                  variant: 'primary',
                })
              }
              className="w-full justify-start border-border/60 bg-muted/20 text-foreground"
              disabled={isPending}
            >
              Enforce Private Access
            </Button>
          </div>
        </div>
      </div>

      <ConfirmActionDialog
        open={pendingConfirm !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingConfirm(null)
          }
        }}
        title={pendingConfirm?.title ?? 'Confirm'}
        description={pendingConfirm?.description ?? ''}
        confirmLabel={pendingConfirm?.confirmLabel ?? 'Confirm'}
        confirmVariant={pendingConfirm?.variant ?? 'primary'}
        onConfirm={() => {
          if (pendingConfirm) {
            onUpdate(pendingConfirm.update)
            setPendingConfirm(null)
          }
        }}
      />
    </>
  )
}

