import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'

type SettingsDataTableProps<TData extends { id: string }> = {
  data: TData[]
  // Columns mix value types (string, Date, ...), hence `any` for the value.
  columns: ColumnDef<TData, any>[]
  emptyMessage: string
  /** When set, each row gets a button that calls this with the row. */
  onRowAction?: (row: TData) => void
  rowActionLabel?: string
}

/** Compact read-only table used by the Settings sections. */
export function SettingsDataTable<TData extends { id: string }>({
  data,
  columns,
  emptyMessage,
  onRowAction,
  rowActionLabel = 'Open details',
}: SettingsDataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  })
  const rows = table.getRowModel().rows
  const columnCount = columns.length + (onRowAction ? 1 : 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/85 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60 text-left">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border/60">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 font-semibold text-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
                {onRowAction && (
                  <th className="w-10 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/40 transition-colors last:border-b-0 hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                  {onRowAction && (
                    <td className="px-4 py-4 text-right text-muted-foreground">
                      <button
                        type="button"
                        aria-label={rowActionLabel}
                        className="ml-auto inline-flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => onRowAction(row.original)}
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
