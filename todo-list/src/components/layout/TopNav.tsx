"use client"

import * as React from "react"
import { Bell, Search, ChevronRight, Menu, LogOut, User, Loader2, Building2, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/providers/SidebarProvider"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useAuth } from "@/hooks/use-auth"
import { useTodayReminders } from "@/hooks/use-reminders"
import { useOrganization } from "@/components/providers/OrganizationContext"

export function TopNav() {
    const { toggle } = useSidebar()
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
    const [isNotifOpen, setIsNotifOpen] = React.useState(false)
    const [isOrgDropdownOpen, setIsOrgDropdownOpen] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])
    const [searchQuery, setSearchQuery] = React.useState("")
    const router = useRouter()

    // Organization context
    const { organizations, activeOrg, activeOrgId, setActiveOrgId, isLoading: isOrgLoading } = useOrganization()

    // safe-guard: ensure useAuth is available or fail gracefully
    const { user, isLoading: isAuthLoading } = useAuth()
    const { data: reminders, isLoading: isRemindersLoading } = useTodayReminders()

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login")
                },
            },
        })
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/tasks?search=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleOrgSwitch = (orgId: number) => {
        setActiveOrgId(orgId)
        setIsOrgDropdownOpen(false)
    }

    // Get initials from name
    const getInitials = (name?: string) => {
        if (!name) return "U"
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    }

    return (
        <header className="flex h-16 md:h-20 items-center justify-between px-3 md:px-8 py-3 md:py-4 bg-transparent relative z-30">
            {/* Left: Org Switcher & Menu */}
            <div className="flex items-center gap-4 md:gap-6 flex-1">
                {/* Mobile Menu Button - Visible only on mobile */}
                <button
                    onClick={toggle}
                    className="p-2 -ml-2 text-gray-500 hover:text-black md:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Organization Switcher */}
                <div className="relative">
                    <button
                        onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                        className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <Building2 className="w-4 h-4 text-blue-600" />
                        {isOrgLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <span className="font-semibold text-sm whitespace-nowrap max-w-[150px] truncate">
                                    {activeOrg?.name || "Select Org"}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </>
                        )}
                    </button>

                    {isOrgDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsOrgDropdownOpen(false)} />
                            <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 overflow-hidden">
                                <div className="px-4 py-2 border-b border-gray-50">
                                    <h3 className="font-bold text-sm text-gray-700">Switch Organization</h3>
                                    <p className="text-xs text-gray-400">Data will refresh automatically</p>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {organizations.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-gray-400">No organizations</div>
                                    ) : (
                                        organizations.map(org => (
                                            <button
                                                key={org.id}
                                                onClick={() => handleOrgSwitch(org.id)}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors",
                                                    activeOrgId === org.id && "bg-blue-50"
                                                )}
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{org.name}</p>
                                                    <p className="text-xs text-gray-400">{org.role || 'Member'}</p>
                                                </div>
                                                {activeOrgId === org.id && (
                                                    <Check className="w-4 h-4 text-blue-600" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Date Display - Desktop only */}
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                    <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="p-2 text-gray-400 hover:text-black transition-colors rounded-full bg-white/50 hover:bg-white shadow-sm hidden md:block relative"
                    >
                        <Bell className="w-5 h-5" />
                        {reminders && reminders.length > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        )}
                    </button>

                    {isNotifOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 overflow-hidden">
                                <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-sm">Notifications</h3>
                                    <span className="text-xs text-gray-400">{reminders?.length || 0} today</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {isRemindersLoading ? (
                                        <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 animate-spin text-gray-300" /></div>
                                    ) : reminders && reminders.length > 0 ? (
                                        reminders.map(rem => (
                                            <div key={rem.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                                <p className="text-sm text-gray-800 font-medium">Activity Reminder</p>
                                                <p className="text-xs text-gray-500">{rem.time} - Check your schedule</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-xs text-gray-400">No notifications</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="relative hidden md:block group">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-4 pr-10 py-2 rounded-full bg-white/50 hover:bg-white focus:bg-white shadow-sm border border-transparent focus:border-gray-200 focus:outline-none text-sm w-32 focus:w-48 transition-all"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black">
                        <Search className="w-4 h-4" />
                    </button>
                </form>

                {/* Profile Dropdown */}
                <div className="relative">
                    <div
                        className="flex items-center gap-3 pl-0 md:pl-4 md:border-l border-gray-200 cursor-pointer"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="bg-white px-2 md:px-4 py-2 rounded-full shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors">
                            {isAuthLoading || !mounted ? (
                                <div className="w-24 h-5 bg-gray-100 animate-pulse rounded" />
                            ) : (
                                <>
                                    <span className="text-sm font-semibold hidden md:block max-w-[120px] truncate">
                                        {user?.name || "Guest"}
                                    </span>
                                    {user?.image ? (
                                        <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-[var(--accent-yellow)] text-black flex items-center justify-center text-xs font-bold border-2 border-white">
                                            {getInitials(user?.name)}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-3 border-b border-gray-100 mb-1">
                                    <p className="font-semibold text-sm truncate">{user?.name || "Guest User"}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email || "No email"}</p>
                                </div>

                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                    <User className="w-4 h-4" />
                                    Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
