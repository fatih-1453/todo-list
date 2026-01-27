"use client"

import * as React from "react"

interface SidebarContextType {
    isOpen: boolean
    toggle: () => void
    close: () => void
    isExpanded: boolean
    toggleExpand: () => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isExpanded, setIsExpanded] = React.useState(false)

    const toggle = () => setIsOpen((prev) => !prev)
    const close = () => setIsOpen(false)
    const toggleExpand = () => setIsExpanded((prev) => !prev)

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, close, isExpanded, toggleExpand }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = React.useContext(SidebarContext)
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider")
    }
    return context
}
