import type { ComponentProps, HTMLAttributes } from 'react'
import type { ChatRole } from './-chat-types'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type ChatMessageShellProps = HTMLAttributes<HTMLDivElement> & {
    from: ChatRole
}

export function ChatMessageShell( {
    className,
    from,
    ...props
}: ChatMessageShellProps ) {
    return (
        <div
            className={cn(
                'group flex w-full max-w-[95%] flex-col gap-2',
                from === 'user' ? 'is-user ml-auto justify-end' : 'is-assistant',
                className,
            )}
            {...props}
        />
    )
}

type ChatMessageContentProps = HTMLAttributes<HTMLDivElement>

export function ChatMessageContent( {
    children,
    className,
    ...props
}: ChatMessageContentProps ) {
    return (
        <div
            className={cn(
                'is-user:dark flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm',
                'group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground',
                'group-[.is-assistant]:text-foreground',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    )
}

type ChatMessageActionsProps = ComponentProps<'div'>

export function ChatMessageActions( {
    className,
    children,
    ...props
}: ChatMessageActionsProps ) {
    return (
        <div className={cn( 'flex items-center gap-1', className )} {...props}>
            {children}
        </div>
    )
}

type ChatMessageActionButtonProps = ComponentProps<typeof Button> & {
    tooltip?: string
    label?: string
}

export function ChatMessageActionButton( {
    tooltip,
    children,
    label,
    variant = 'ghost',
    size = 'icon-sm',
    ...props
}: ChatMessageActionButtonProps ) {
    const button = (
        <Button size={size} type="button" variant={variant} {...props}>
            {children}
            <span className="sr-only">{label ?? tooltip}</span>
        </Button>
    )

    if ( !tooltip ) {
        return button
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent>
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}