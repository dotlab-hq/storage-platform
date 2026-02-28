"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function Command( {
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive> ) {
    return (
        <CommandPrimitive
            className={cn(
                "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
                className
            )}
            {...props}
        />
    )
}

export function CommandInput( {
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> ) {
    return (
        <div className="flex items-center border-b px-3">
            <Search className="text-muted-foreground mr-2 h-4 w-4 shrink-0" />
            <CommandPrimitive.Input
                className={cn(
                    "placeholder:text-muted-foreground flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            />
        </div>
    )
}

export function CommandList( {
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.List> ) {
    return (
        <CommandPrimitive.List
            className={cn(
                "max-h-75 overflow-y-auto overflow-x-hidden",
                className
            )}
            {...props}
        />
    )
}

export function CommandEmpty(
    props: React.ComponentProps<typeof CommandPrimitive.Empty>
) {
    return (
        <CommandPrimitive.Empty
            className="py-6 text-center text-sm"
            {...props}
        />
    )
}

export function CommandGroup( {
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Group> ) {
    return (
        <CommandPrimitive.Group
            className={cn(
                "text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium",
                className
            )}
            {...props}
        />
    )
}

export function CommandSeparator( {
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator> ) {
    return (
        <CommandPrimitive.Separator
            className={cn( "bg-border -mx-1 h-px", className )}
            {...props}
        />
    )
}

export function CommandItem( {
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Item> ) {
    return (
        <CommandPrimitive.Item
            className={cn(
                "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
                className
            )}
            {...props}
        />
    )
}

export function CommandShortcut( {
    className,
    ...props
}: React.ComponentProps<"span"> ) {
    return (
        <span
            className={cn(
                "text-muted-foreground ml-auto text-xs tracking-widest",
                className
            )}
            {...props}
        />
    )
}
