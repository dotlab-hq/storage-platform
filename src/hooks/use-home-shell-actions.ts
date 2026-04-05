import { useMemo } from "react"
import { useShellView } from "@/components/shell/shell-actions-registry"

export function useHomeShellActions() {
    const homeActions = useMemo( () => ( {
        commandActions: [
            {
                id: "create-new-file",
                label: "Create New File",
                onSelect: () => window.dispatchEvent( new Event( "dot:create-new-file" ) ),
            },
            {
                id: "upload-files",
                label: "Upload Files",
                onSelect: () => window.dispatchEvent( new Event( "dot:open-upload" ) ),
            },
            {
                id: "new-folder",
                label: "New Folder",
                onSelect: () => window.dispatchEvent( new Event( "dot:open-new-folder" ) ),
            },
        ],
        contextActions: [
            {
                id: "ctx-create-new-file",
                label: "Create New File",
                onSelect: () => window.dispatchEvent( new Event( "dot:create-new-file" ) ),
            },
            {
                id: "ctx-upload-files",
                label: "Upload Files",
                onSelect: () => window.dispatchEvent( new Event( "dot:open-upload" ) ),
            },
            {
                id: "ctx-new-folder",
                label: "New Folder",
                onSelect: () => window.dispatchEvent( new Event( "dot:open-new-folder" ) ),
            },
        ],
    } ), [] )

    useShellView( "home", homeActions )
}
