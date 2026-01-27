import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export function BentoGrid({
    className,
    children,
}: {
    className?: string
    children?: ReactNode
}) {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    )
}

export function BentoGridItem({
    className,
    title,
    description,
    header,
    icon,
    children,
}: {
    className?: string
    title?: string | ReactNode
    description?: string | ReactNode
    header?: ReactNode
    icon?: ReactNode
    children?: ReactNode
}) {
    return (
        <div
            className={cn(
                // Base styles for the bento card
                "row-span-1 rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-white border border-transparent justify-between flex flex-col space-y-4",
                className
            )}
        >
            {header}
            {children}
            {(title || description || icon) && (
                <div className="group-hover/bento:translate-x-2 transition duration-200">
                    {icon}
                    {title && <div className="font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
                        {title}
                    </div>}
                    {description && <div className="font-normal text-neutral-600 text-xs dark:text-neutral-300">
                        {description}
                    </div>}
                </div>
            )}
        </div>
    )
}
