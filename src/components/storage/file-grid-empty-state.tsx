export function FileGridEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted mb-4 rounded-full p-4">
                <svg
                    className="text-muted-foreground h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                </svg>
            </div>
            <h3 className="text-foreground mb-1 text-sm font-medium">
                No files yet
            </h3>
            <p className="text-muted-foreground text-sm">
                Upload files or create a folder to get started
            </p>
        </div>
    )
}
