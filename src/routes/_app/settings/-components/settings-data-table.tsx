import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'

type SettingsDataTableProps<TData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  emptyMessage: string
  onRowAction?: (row: TData) => void
  rowActionLabel?: string
}

export function SettingsDataTable<TData>({
  data,
  columns,
  emptyMessage,
  onRowAction,
  rowActionLabel = 'Open details',
}: SettingsDataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/85 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-muted/60 text-left backdrop-blur">
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
                <th className="w-10 px-4 py-3" aria-hidden="true" />
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/40 transition-colors last:border-b-0 hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className="px-4 py-4 text-right text-muted-foreground">
                    {onRowAction ? (
                      <button
                        type="button"
                        aria-label={rowActionLabel}
                        className="ml-auto inline-flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => onRowAction(row.original)}
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    ) : (
                      <ChevronRight className="ml-auto size-4" />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
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