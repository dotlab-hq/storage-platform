import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import {
  createUrlImportJobFn,
  getUrlImportJobStatusFn,
} from '@/lib/url-import/server'
import { upsertUrlImportJob } from '@/components/storage/url-import-store'
import type {
  UrlImportDialogState,
  UrlValidationState,
} from '@/components/storage/url-import-dialog-types'
import {
  normalizeUrlImportMode,
  URL_IMPORT_MODE_EVENT,
  URL_IMPORT_MODE_STORAGE_KEY,
} from '@/components/storage/url-import-mode'
import { parsePairs } from '@/components/storage/url-import-dialog-utils'
import {
  buildCurlFromState,
  parseCurlToState,
} from '@/components/storage/url-import-curl'
import { useUrlImportStatusSync } from '@/components/storage/url-import-effects'

const initialState: UrlImportDialogState = {
  mode: 'form',
  url: '',
  savePath: '',
  method: 'GET',
  headersRaw: '',
  cookiesRaw: '',
  curlCommand: '',
  jobId: null,
}

export function useUrlImportDialog(input: {
  currentFolderId: string | null
  onImportComplete: () => Promise<void> | void
}) {
  const [state, setState] = React.useState<UrlImportDialogState>(initialState)
  const [validation, setValidation] = React.useState<UrlValidationState>({
    loading: false,
    ok: false,
    message: 'Enter a URL and validate it.',
  })
  const [curlError, setCurlError] = React.useState<string | null>(null)
  const queryClient = useQueryClient()

  React.useEffect(() => {
    const applyMode = (modeValue: string | null) => {
      setState((prev) => ({ ...prev, mode: normalizeUrlImportMode(modeValue) }))
    }
    applyMode(localStorage.getItem(URL_IMPORT_MODE_STORAGE_KEY))
    const handleMode = (event: Event) => {
      applyMode((event as CustomEvent<string>).detail)
    }
    window.addEventListener(URL_IMPORT_MODE_EVENT, handleMode as EventListener)
    return () => {
      window.removeEventListener(
        URL_IMPORT_MODE_EVENT,
        handleMode as EventListener,
      )
    }
  }, [])

  const onImportComplete = input.onImportComplete
  const currentFolderId = input.currentFolderId

  const createJobMutation = useMutation({
    mutationFn: async () => {
      return createUrlImportJobFn({
        data: {
          url: state.url.trim(),
          method: state.method,
          headers: parsePairs(state.headersRaw),
          cookies: parsePairs(state.cookiesRaw),
          savePath: state.savePath.trim(),
          parentFolderId: currentFolderId,
        },
      })
    },
    onSuccess: (result) => {
      setState((prev) => ({ ...prev, jobId: result.jobId }))
      upsertUrlImportJob({
        jobId: result.jobId,
        url: state.url.trim(),
        savePath: state.savePath.trim(),
        status: 'queued',
        error: null,
        queuedAtIso: new Date().toISOString(),
      })
      toast.success('Import queued. Worker will process it shortly.')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Could not queue import',
      )
    },
  })

  const statusQuery = useQuery({
    queryKey: ['url-import-status', state.jobId],
    enabled: Boolean(state.jobId),
    queryFn: async () => {
      if (!state.jobId) {
        throw new Error('Missing job id')
      }
      return getUrlImportJobStatusFn({ data: { jobId: state.jobId } })
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return !status || status === 'queued' || status === 'running'
        ? 2000
        : false
    },
  })

  useUrlImportStatusSync({
    status: statusQuery.data,
    onImportComplete,
    invalidateHomeSnapshot: async () => {
      await queryClient.invalidateQueries({ queryKey: ['home-snapshot'] })
    },
  })

  const generatedCurl = React.useMemo(() => buildCurlFromState(state), [state])
  const canQueue =
    state.url.trim().length > 0 &&
    state.savePath.trim().length > 0 &&
    validation.ok &&
    !curlError

  const setMethod = (value: string) => {
    const candidate = value.toUpperCase()
    if (
      candidate === 'GET' ||
      candidate === 'POST' ||
      candidate === 'PUT' ||
      candidate === 'PATCH'
    ) {
      setState((prev) => ({ ...prev, method: candidate }))
    }
  }

  const handleCurlChange = (value: string) => {
    setState((prev) => ({ ...prev, curlCommand: value }))
    const parsed = parseCurlToState(value)
    if (!parsed.ok) {
      setCurlError(parsed.error)
      return
    }

    setCurlError(null)
    setState((prev) => ({
      ...prev,
      method: parsed.parsed.method,
      url: parsed.parsed.url,
      headersRaw: parsed.parsed.headersRaw,
      cookiesRaw: parsed.parsed.cookiesRaw,
      curlCommand: value,
    }))
    if (validation.ok) {
      setValidation((prev) => ({
        ...prev,
        ok: false,
        message: 'Re-validate URL.',
      }))
    }
  }

  return {
    state,
    setState,
    validation,
    setValidation,
    curlError,
    generatedCurl,
    canQueue,
    createJobMutation,
    setMethod,
    handleCurlChange,
  }
}
