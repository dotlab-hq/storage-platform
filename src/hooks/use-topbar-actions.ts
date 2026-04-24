'use client'

import { useEffect, useState } from 'react'

type UseTopbarActionsProps = {
  openUploadFiles?: boolean
  onOpenUploadFilesChange?: (open: boolean) => void
  openUploadFolder?: boolean
  onOpenUploadFolderChange?: (open: boolean) => void
  openUrlImport?: boolean
  onOpenUrlImportChange?: (open: boolean) => void
}

export function useTopbarActions({
  openUploadFiles,
  onOpenUploadFilesChange,
  openUploadFolder,
  onOpenUploadFolderChange,
  openUrlImport,
  onOpenUrlImportChange,
}: UseTopbarActionsProps) {
  const [uncontrolledUploadFilesOpen, setUncontrolledUploadFilesOpen] =
    useState(false)
  const [uncontrolledUploadFolderOpen, setUncontrolledUploadFolderOpen] =
    useState(false)
  const [uncontrolledUrlImportOpen, setUncontrolledUrlImportOpen] =
    useState(false)
  const [newFolderOpen, setNewFolderOpen] = useState(false)

  const uploadFilesOpen = openUploadFiles ?? uncontrolledUploadFilesOpen
  const setUploadFilesOpen =
    onOpenUploadFilesChange ?? setUncontrolledUploadFilesOpen
  const uploadFolderOpen = openUploadFolder ?? uncontrolledUploadFolderOpen
  const setUploadFolderOpen =
    onOpenUploadFolderChange ?? setUncontrolledUploadFolderOpen
  const urlImportOpen = openUrlImport ?? uncontrolledUrlImportOpen
  const setUrlImportOpen = onOpenUrlImportChange ?? setUncontrolledUrlImportOpen

  useEffect(() => {
    const openUploadFile = () => {
      if (onOpenUploadFilesChange) onOpenUploadFilesChange(true)
      else setUncontrolledUploadFilesOpen(true)
    }
    const openUploadFolder = () => {
      if (onOpenUploadFolderChange) onOpenUploadFolderChange(true)
      else setUncontrolledUploadFolderOpen(true)
    }
    const openUrlImport = () => {
      if (onOpenUrlImportChange) onOpenUrlImportChange(true)
      else setUncontrolledUrlImportOpen(true)
    }
    const openNewFolder = () => setNewFolderOpen(true)

    window.addEventListener('dot:open-upload', openUploadFile)
    window.addEventListener('dot:open-upload-folder', openUploadFolder)
    window.addEventListener('dot:open-url-import', openUrlImport)
    window.addEventListener('dot:open-new-folder', openNewFolder)

    return () => {
      window.removeEventListener('dot:open-upload', openUploadFile)
      window.removeEventListener('dot:open-upload-folder', openUploadFolder)
      window.removeEventListener('dot:open-url-import', openUrlImport)
      window.removeEventListener('dot:open-new-folder', openNewFolder)
    }
  }, [onOpenUploadFilesChange, onOpenUploadFolderChange, onOpenUrlImportChange])

  return {
    uploadFilesOpen,
    setUploadFilesOpen,
    uploadFolderOpen,
    setUploadFolderOpen,
    urlImportOpen,
    setUrlImportOpen,
    newFolderOpen,
    setNewFolderOpen,
  }
}
