import { Store } from '@tanstack/store'

type FileSummaryDialogState = {
  open: boolean
  targetFileId: string | null
}

const initialState: FileSummaryDialogState = {
  open: false,
  targetFileId: null,
}

export const fileSummaryDialogStore = new Store<FileSummaryDialogState>(
  initialState,
)

export function openFileSummaryDialog(fileId: string): void {
  fileSummaryDialogStore.setState(() => ({
    open: true,
    targetFileId: fileId,
  }))
}

export function closeFileSummaryDialog(): void {
  fileSummaryDialogStore.setState((previous) => ({
    open: false,
    targetFileId: previous.targetFileId,
  }))
}

export function resetFileSummaryDialogTarget(): void {
  fileSummaryDialogStore.setState(() => ({
    open: false,
    targetFileId: null,
  }))
}
