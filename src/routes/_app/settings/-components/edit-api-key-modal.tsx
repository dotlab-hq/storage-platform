'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity } from '@/components/ui/activity'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TagInput } from '@/components/ui/tag-input'
import { toast } from 'sonner'
import type { ApiScope } from '@/lib/permissions/scopes'
import { getScopeDisplayName } from '@/lib/permissions/scopes'
import { updateChatApiKeyFn } from './-settings-server'

type EditApiKeyModalProps = {
  open: boolean
  onOpenChange: ( open: boolean ) => void
  apiKey: {
    id: string
    name: string
    scopes: string[]
  } | null
  onSuccess?: () => void
}

export function EditApiKeyModal( {
  open,
  onOpenChange,
  apiKey,
  onSuccess,
}: EditApiKeyModalProps ) {
  const formRef = useRef<HTMLFormElement>( null )
  const [keyName, setKeyName] = useState( '' )
  const [selectedScopes, setSelectedScopes] = useState<string[]>( [] )
  const [errors, setErrors] = useState<{ name?: string; scopes?: string }>( {} )
  const [isSubmitting, setIsSubmitting] = useState( false )

  const queryClient = useQueryClient()

  const updateMutation = useMutation( {
    mutationFn: async ( {
      id,
      name,
      scopes,
    }: {
      id: string
      name: string
      scopes: ApiScope[]
    } ) => {
      return updateChatApiKeyFn( { data: { id, name, scopes } } )
    },
    onSuccess: () => {
      queryClient.invalidateQueries( { queryKey: ['settings'] } )
      onSuccess?.()
      toast.success( 'API key updated successfully' )
    },
    onError: ( error: Error ) => {
      toast.error( error.message || 'Failed to update API key' )
    },
  } )

  // Reset form when opening with new data
  useEffect( () => {
    if ( apiKey ) {
      setKeyName( apiKey.name )
      setSelectedScopes( apiKey.scopes )
      setErrors( {} )
    }
  }, [apiKey] )

  // Update form when apiKey prop changes
  useEffect( () => {
    if ( open && apiKey ) {
      setKeyName( apiKey.name )
      setSelectedScopes( apiKey.scopes )
      setErrors( {} )
    }
  }, [open, apiKey] )

  const handleSubmit = ( e: React.FormEvent ) => {
    e.preventDefault()
    const newErrors: { name?: string; scopes?: string } = {}

    if ( !keyName.trim() ) {
      newErrors.name = 'Key name is required'
    }

    if ( selectedScopes.length === 0 ) {
      newErrors.scopes = 'At least one scope must be selected'
    }

    setErrors( newErrors )

    if ( Object.keys( newErrors ).length > 0 ) {
      return
    }

    if ( !apiKey ) return

    setIsSubmitting( true )
    updateMutation
      .mutateAsync( {
        id: apiKey.id,
        name: keyName.trim(),
        scopes: selectedScopes as ApiScope[],
      } )
      .finally( () => setIsSubmitting( false ) )
  }

  const handleScopesChange = ( scopes: string[] ) => {
    setSelectedScopes( scopes )
    if ( scopes.length === 0 ) {
      setErrors( ( prev ) => ( {
        ...prev,
        scopes: 'At least one scope must be selected',
      } ) )
    } else {
      setErrors( ( prev ) => ( { ...prev, scopes: undefined } ) )
    }
  }

  const handleOpenChange = ( newOpen: boolean ) => {
    if ( !newOpen ) {
      setKeyName( '' )
      setSelectedScopes( [] )
      setErrors( {} )
      setIsSubmitting( false )
    }
    onOpenChange( newOpen )
  }

  const canSubmit =
    !isSubmitting &&
    keyName.trim().length > 0 &&
    selectedScopes.length > 0 &&
    apiKey !== null

  if ( !apiKey ) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogDescription>
            Modify the name and permissions for this API key.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Key Name */}
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="My API Key"
                value={keyName}
                onChange={( e ) => {
                  setKeyName( e.target.value )
                  if ( e.target.value.trim() ) {
                    setErrors( ( prev ) => ( { ...prev, name: undefined } ) )
                  }
                }}
                className={errors.name ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-destructive text-xs">{errors.name}</p>
              )}
            </div>

            {/* Scopes Selection */}
            <div className="space-y-2">
              <Label>Scopes (Permissions)</Label>
              <TagInput
                value={selectedScopes}
                onChange={handleScopesChange}
                placeholder="Select scopes..."
                disabled={isSubmitting}
                className={errors.scopes ? 'border-destructive' : ''}
              />
              <p className="text-muted-foreground text-xs">
                Start typing to see available scopes. Click on a scope to add it
                as a tag.
              </p>
              {errors.scopes && (
                <p className="text-destructive text-xs">{errors.scopes}</p>
              )}

              {/* Quick selection helpers */}
              <div className="flex flex-wrap gap-1 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedScopes( ['chat:completions'] )}
                  disabled={isSubmitting}
                >
                  Chat Only
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedScopes( ['files:full', 'folders:full'] )
                  }
                  disabled={isSubmitting}
                >
                  Files & Folders
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedScopes( ['s3:full'] )}
                  disabled={isSubmitting}
                >
                  Full S3
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedScopes( [
                      'chat:completions',
                      'chat:tool:web',
                      'chat:tool:storage',
                      'chat:memory',
                    ] )
                  }
                  disabled={isSubmitting}
                >
                  Full Chat Access
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedScopes( [] )}
                  disabled={isSubmitting}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Selected Scopes Preview */}
            {selectedScopes.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Scopes:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedScopes.map( ( scope ) => (
                    <div
                      key={scope}
                      className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium"
                    >
                      {getScopeDisplayName( scope as ApiScope )}
                      <span className="ml-1 opacity-70">({scope})</span>
                    </div>
                  ) )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange( false )}
              disabled={isSubmitting}
            >
              Cancel
              <KeyboardShortcut keys="Escape" className="ml-2" />
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              <Activity when={isSubmitting} fallback="Save Changes">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </Activity>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
