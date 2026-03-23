type SharedFolderTree = {
    folders: { id: string; name: string; parentFolderId: string | null; depth: number }[]
    files: { id: string; name: string; sizeInBytes: number; folderId: string | null }[]
}

type ShareFolderTreeProps = {
    tree: SharedFolderTree
    formatBytes: ( bytes: number ) => string
}

export function ShareFolderTree( { tree, formatBytes }: ShareFolderTreeProps ) {
    const folderDepthMap = new Map<string, number>()
    tree.folders.forEach( ( folder ) => {
        folderDepthMap.set( folder.id, folder.depth )
    } )

    return (
        <div className="bg-card text-left rounded-md border p-3 w-full max-w-xl space-y-1">
            {tree.folders.map( ( folder ) => (
                <div
                    key={folder.id}
                    className="text-sm"
                    style={{ paddingLeft: `${Math.max( 0, folder.depth ) * 12}px` }}
                >
                    📁 {folder.name}
                </div>
            ) )}
            {tree.files.map( ( file ) => (
                <div
                    key={file.id}
                    className="text-muted-foreground text-xs"
                    style={{ paddingLeft: `${( folderDepthMap.get( file.folderId ?? "" ) ?? 0 ) * 12 + 12}px` }}
                >
                    📄 {file.name} ({formatBytes( file.sizeInBytes )})
                </div>
            ) )}
        </div>
    )
}
