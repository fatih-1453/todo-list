"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // Assuming shadcn ui or similar
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
//   CommandSeparator,
// } from "@/components/ui/command"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

// Since I don't know if shadcn is fully installed or where components are, I will build a custom dropdown if needed or try to use standard logic.
// However, the Sidebar uses standard HTML/Tailwind. I'll stick to that style to avoid missing component errors.

export function SwitchOrganization({ isExpanded }: { isExpanded: boolean }) {
    const router = useRouter()
    const { data: session } = authClient.useSession()
    const [organizations, setOrganizations] = React.useState<any[]>([])
    const [isOpen, setIsOpen] = React.useState(false)
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [newOrgName, setNewOrgName] = React.useState("")
    const [newOrgSlug, setNewOrgSlug] = React.useState("")
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    const activeOrgId = session?.session?.activeOrganizationId
    const activeOrg = organizations.find(org => org.id === activeOrgId)

    React.useEffect(() => {
        const fetchOrgs = async () => {
            const { data } = await authClient.organization.list()
            if (data) {
                setOrganizations(data)
            }
        }
        fetchOrgs()
    }, [session, isOpen]) // refetch on open to ensure fresh

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSwitch = async (orgId: string) => {
        await authClient.organization.setActive({
            organizationId: orgId
        })
        if (orgId) {
            localStorage.setItem('activeOrgId', orgId)
        } else {
            localStorage.removeItem('activeOrgId')
        }
        setIsOpen(false)
        router.refresh()
        // Window location reload might be needed to refresh strict server components if any
        window.location.reload()
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newOrgName || !newOrgSlug) return

        await authClient.organization.create({
            name: newOrgName,
            slug: newOrgSlug
        }, {
            onSuccess: () => {
                setNewOrgName("")
                setNewOrgSlug("")
                setIsCreateOpen(false)
                setIsOpen(false)
                // optionally auto switch
                // should refetch list
                authClient.organization.list().then(({ data }) => {
                    if (data) setOrganizations(data)
                })
            },
            onError: (ctx) => {
                alert(ctx.error.message)
            }
        })
    }

    return (
        <div className="relative w-full px-2" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center w-full p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 border border-transparent hover:border-gray-200",
                    isExpanded ? "justify-between" : "justify-center"
                )}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">
                        {activeOrg?.logo ? (
                            <img src={activeOrg.logo} alt={activeOrg.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <span>{activeOrg?.name?.charAt(0).toUpperCase() || "P"}</span> // P for Personal or fallback
                        )}
                    </div>
                    {isExpanded && (
                        <div className="flex flex-col items-start truncate">
                            <span className="font-bold text-sm text-gray-900 truncate w-full text-left">
                                {activeOrg?.name || "Personal Workspace"}
                            </span>
                            <span className="text-xs text-gray-500 truncate w-full text-left">
                                {activeOrg?.slug || "personal"}
                            </span>
                        </div>
                    )}
                </div>
                {isExpanded && <ChevronsUpDown className="w-4 h-4 text-gray-400" />}
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute top-full left-0 z-50 w-64 bg-white rounded-xl shadow-xl border border-gray-100 mt-2 p-2 animate-in fade-in zoom-in-95 duration-200",
                    !isExpanded && "left-14" // Push out if sidebar collapsed
                )}>
                    <div className="text-xs font-semibold text-gray-400 px-2 py-1 mb-1">Organizations</div>

                    {/* Organization List */}
                    <div className="max-h-[200px] overflow-y-auto space-y-1">
                        {organizations.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => handleSwitch(org.id)}
                                className={cn(
                                    "flex items-center w-full p-2 rounded-lg text-sm transition-colors",
                                    activeOrgId === org.id ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
                                )}
                            >
                                <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0 text-black">
                                    {org.logo ? <img src={org.logo} className="w-full h-full rounded" /> : org.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate flex-1 text-left">{org.name}</span>
                                {activeOrgId === org.id && <Check className="w-4 h-4 ml-2" />}
                            </button>
                        ))}
                        {/* Personal - often 'null' orgId implies personal in better-auth if configured, but better-auth organization plugin strictly usually implies being IN an org or NOT (which is personal). 
                             However, `setActive({ organizationId: null })` switches to personal. */}
                        <button
                            onClick={() => handleSwitch(null as any)}
                            className={cn(
                                "flex items-center w-full p-2 rounded-lg text-sm transition-colors",
                                !activeOrgId ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
                            )}
                        >
                            <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0 text-black">
                                P
                            </div>
                            <span className="truncate flex-1 text-left">Personal</span>
                            {!activeOrgId && <Check className="w-4 h-4 ml-2" />}
                        </button>
                    </div>

                    <div className="h-px bg-gray-100 my-2" />

                    {/* Create New Action */}
                    {!isCreateOpen ? (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center w-full p-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            <span>Create Organization</span>
                        </button>
                    ) : (
                        <form onSubmit={handleCreate} className="p-1 space-y-2">
                            <input
                                autoFocus
                                placeholder="Org Name"
                                value={newOrgName}
                                onChange={e => {
                                    setNewOrgName(e.target.value)
                                    setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')) // simple slugify
                                }}
                                className="w-full p-2 text-sm border rounded hover:border-gray-400 focus:border-black outline-none transition-colors"
                            />
                            <input
                                placeholder="Slug (unique)"
                                value={newOrgSlug}
                                onChange={e => setNewOrgSlug(e.target.value)}
                                className="w-full p-2 text-xs border rounded bg-gray-50 text-gray-600 focus:border-black outline-none transition-colors"
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-black text-white py-1.5 rounded text-xs font-medium hover:bg-gray-800">Create</button>
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-3 py-1.5 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200">Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    )
}
