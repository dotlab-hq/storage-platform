import { useMemo } from "react"
import { useShellView } from "@/components/shell/global-shell-actions"

export function useHomeShellActions() {
    const homeActions = useMemo( () => ( {
        commandActions: [
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
