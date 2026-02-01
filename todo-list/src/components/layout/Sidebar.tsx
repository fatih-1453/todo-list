"use client"

import * as React from "react"
import Link from "next/link"
import { SwitchOrganization } from "./SwitchOrganization"
import { usePathname } from "next/navigation"
import {
    House,
    Share2,
    Upload,
    Star,
    Plus,
    Database,
    Calendar,
    Send,
    AlertTriangle,
    Settings,
    LogOut,
    Users,
    ChevronRight,
    ChevronLeft,
    Briefcase,
    UserCog,
    Building2,
    Target,
    ListTodo,
    KanbanSquare,
    LayoutDashboard,
    ClipboardCheck,
    Layers,
    FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { User } from "@/types/user"
import { useRouter } from "next/navigation"
import { useSidebar } from "@/components/providers/SidebarProvider"
import { toast } from "sonner"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className, ...props }: SidebarProps) {
    const { isOpen, close, isExpanded, toggleExpand } = useSidebar()
    const pathname = usePathname()
    const router = useRouter()

    // Fetch Current User with Group Permissions using /users/me endpoint
    const { data: session } = authClient.useSession();

    const { data: me } = useQuery({
        queryKey: ['users', 'me'],
        queryFn: () => apiClient.get<User>('/users/me').catch(() => null),
        enabled: !!session?.user?.id,
        retry: false
    });

    const permissions = me?.group?.permissions || [];

    const [openDropdowns, setOpenDropdowns] = React.useState<Record<string, boolean>>({
        "todo_list": true
    })

    const toggleDropdown = (id: string) => {
        if (!isExpanded) {
            toggleExpand() // Auto expand sidebar if collapsed
            setTimeout(() => {
                setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }))
            }, 150) // Small delay for smooth transition
            return
        }
        setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }))
    }


    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login")
                },
            },
        })
    }

    type NavItem = {
        id: string
        icon: any
        label: string
        href?: string
        children?: NavItem[]
    }

    const navItems: NavItem[] = [
        {
            id: "master",
            icon: Briefcase,
            label: "Master",
            children: [
                { id: "employees", icon: Users, label: "Pegawai", href: "/employees" },
                { id: "users", icon: UserCog, label: "Manajemen Pengguna", href: "/users" },
                { id: "organizations", icon: Building2, label: "Organisasi", href: "/organizations" },
                { id: "departments", icon: Building2, label: "Departemen", href: "/departments" },
            ]
        },
        {
            id: "todo_list",
            icon: Database,
            label: "Todo list",
            children: [
                { id: "home", icon: House, label: "Home", href: "/" },
                { id: "tasks", icon: ListTodo, label: "Tasks", href: "/tasks" },
                { id: "alerts", icon: AlertTriangle, label: "Alerts", href: "/alerts" },
                { id: "favorites", icon: Star, label: "Favorites", href: "/favorites" },

            ]
        },
        {
            id: "kpi",
            icon: Target,
            label: "KPI",
            children: [
                { id: "kpi_dashboard", icon: LayoutDashboard, label: "Dashboard KPI", href: "/kpi/dashboard" },
                { id: "action_plan", icon: Calendar, label: "Action Plan", href: "/kpi/action-plan" },
                { id: "timeline", icon: KanbanSquare, label: "Timeline", href: "/kpi/timeline" },
                { id: "share", icon: Share2, label: "Share", href: "/share" },
                { id: "team", icon: Users, label: "Team", href: "/team" },
                { id: "upload", icon: Upload, label: "Upload", href: "/upload" },
            ]
        },
        { id: "assessment", icon: ClipboardCheck, label: "Assessment", href: "/assessment" },
        { id: "programs", icon: Layers, label: "Programs Hub", href: "/programs" },
        { id: "reporting", icon: FileText, label: "Reporting", href: "/reporting" },
        {
            id: "canvassing",
            icon: Target, // Using Target icon temporarily, or maybe create a new one/find better match like 'Map' or 'Megaphone'
            label: "Canvassing",
            children: [
                { id: "canvassing_dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/canvassing/dashboard" },
                { id: "crm", icon: Users, label: "CRM", href: "/canvassing/crm" },
                { id: "big_data", icon: Database, label: "Data Penginputan", href: "/canvassing/big-data" },
                { id: "target", icon: Target, label: "Target", href: "/canvassing/target" },
            ]
        },

        { id: "chat", icon: Send, label: "Chat", href: "/chat" },
    ]

    // Auto-expand dropdowns when visiting a child page
    React.useEffect(() => {
        const activeParent = navItems.find(item =>
            item.children?.some(child => child.href && isActive(child.href))
        )

        if (activeParent) {
            if (!isExpanded) {
                toggleExpand()
            }
            if (!openDropdowns[activeParent.id]) {
                setOpenDropdowns(prev => ({
                    ...prev,
                    [activeParent.id]: true
                }))
            }
        }
    }, [pathname])

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/"
        return pathname.startsWith(href)
    }

    const isChildActive = (item: NavItem) => {
        if (!item.children) return false
        return item.children.some(child => child.href && isActive(child.href))
    }

    // Permission Filter Logic
    const hasPermission = (key: string) => {
        // User requested that all menus should always be visible regardless of organization or role.
        return true;

        // Original Logic Preserved in comments if needed later:
        // const sessionUser = session?.user as any;
        // const userRole = me?.role || sessionUser?.role;
        // if (['admin', 'owner'].includes(userRole?.toLowerCase() || '')) return true;
        // if (['canvassing', 'programs', 'assessment'].includes(key)) return true;
        // if (!permissions || permissions.length === 0) return false;
        // return permissions.includes(key);
    };

    const filterNavItems = (items: NavItem[]): NavItem[] => {
        return items.reduce((acc, item) => {
            // Check if item itself has a permission key. 
            // My NavItems use `id` which maps to `key` in GroupModal.
            // Mapping:
            // "todo-list" -> "todo_list"
            // "master" -> "master"
            // "employees" -> "employees"
            // etc.
            // I need to ensure IDs match.
            // Sidebar IDs: "todo-list", "home", "share", "master", "employees", etc.
            // GroupModal Keys: "todo_list", "home", "share", "master", "employees", etc.
            // Mismatch: "todo-list" vs "todo_list".

            const permissionKey = item.id.replace(/-/g, '_');

            // If it's a parent (has children), check if ANY child is visible OR if parent itself is permitted?
            // Usually if parent is permitted, show it? Or only show if children are permitted?
            // Let's simple check: 
            // 1. If user has permission for this Item ID.
            // 2. OR if it's a structural group (like Master), maybe it's always visible if it has visible children?
            // Let's use the explicit permission check first.

            const isPermitted = hasPermission(permissionKey);

            if (item.children) {
                const filteredChildren = filterNavItems(item.children);
                if (filteredChildren.length > 0) {
                    // If it has visible children, show it (even if parent key not explicitly checked? 
                    // Usually parent key implies access to the SECTION label).
                    // But strictly, let's start with: Show if permitted OR (has children AND at least one is permitted).
                    // Actually, if I check "Master", I probably want to see Master. 
                    // If I uncheck "Master", I shouldn't see it even if "Employees" is checked? 
                    // GroupModal implies hierarchy. If I check child, parent usually auto-checks or partial.
                    // Let's assume strict check: Item must be permitted OR contain permitted children (if it's just a folder).

                    // Simply: Check if `permissionKey` is in `permissions`.
                    if (isPermitted || filteredChildren.length > 0) {
                        acc.push({ ...item, children: filteredChildren });
                    }
                }
            } else {
                if (isPermitted) {
                    acc.push(item);
                }
            }

            return acc;
        }, [] as NavItem[]);
    };

    // Fetch Conversations for Global Unread Count
    const { data: conversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => apiClient.get<any[]>('/chat/conversations').catch(() => []),
        enabled: !!session?.user?.id,
        refetchInterval: 10000 // Check every 10s
    });

    const totalUnreadCount = React.useMemo(() => {
        if (!conversations) return 0;
        return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
    }, [conversations]);

    // Toast Notification for New Messages
    const prevUnreadCountRef = React.useRef(totalUnreadCount);

    React.useEffect(() => {
        if (totalUnreadCount > prevUnreadCountRef.current) {
            // Check if it's not the initial load (0 -> X)
            // Or maybe we want to notify on initial load if there are unread?
            // Usually only on *new* arrivals while app is open.
            // Let's assume initial load we don't spam.
            if (prevUnreadCountRef.current !== 0 || totalUnreadCount > 0) {
                // But wait, initial load prev is 0. If current is 5, it triggers.
                // We might want to skip the very first sync?
                // Let's use a mounted flag or just allow it (user opens app, sees "You have new messages").
                // Actually, "You have new messages" on load is fine.
                toast.success(`You have ${totalUnreadCount - prevUnreadCountRef.current} new message(s)!`, {
                    description: "Check your chat inbox.",
                    action: {
                        label: "Open Chat",
                        onClick: () => router.push('/chat')
                    }
                });
            }
        }
        prevUnreadCountRef.current = totalUnreadCount;
    }, [totalUnreadCount, router]);

    const filteredNavItems = filterNavItems(navItems);

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={close}
                />
            )}

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col h-full py-6 items-center bg-white/80 backdrop-blur-xl border-r border-white/20 transition-all duration-300 ease-in-out md:translate-x-0 md:static md:flex",
                isOpen ? "translate-x-0" : "-translate-x-full",
                isExpanded ? "w-64 px-4" : "w-20",
                className
            )} {...props}>
                {/* Logo Area */}
                <div className="mb-4 relative w-full px-2">
                    <SwitchOrganization isExpanded={isExpanded} />
                </div>

                {/* Collapse/Expand Toggle Button */}
                <button
                    onClick={toggleExpand}
                    className={cn(
                        "hidden md:flex absolute -right-3 top-10 z-50 w-6 h-6 items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-black hover:bg-gray-50 transition-all duration-200 hover:scale-110",
                        !isExpanded && "top-14"
                    )}
                    title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>

                <div className="flex-1 flex flex-col gap-2 w-full overflow-y-auto no-scrollbar pt-4">
                    {filteredNavItems.map((item) => (
                        <div key={item.id} className="w-full">
                            {item.children ? (
                                <>
                                    <button
                                        onClick={() => toggleDropdown(item.id)}
                                        className={cn(
                                            "flex items-center w-full p-3 rounded-xl transition-all duration-200 group relative hover:bg-white/50",
                                            isExpanded ? "justify-between px-4" : "justify-center"
                                        )}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className={cn("w-6 h-6 flex-shrink-0 transition-colors", isChildActive(item) ? "text-black" : "text-gray-400")} />
                                            {isExpanded && (
                                                <span className="ml-3 font-medium text-sm whitespace-nowrap text-gray-600 group-hover:text-black">
                                                    {item.label}
                                                </span>
                                            )}
                                        </div>
                                        {isExpanded && (
                                            <ChevronRight className={cn(
                                                "w-4 h-4 text-gray-400 transition-transform duration-200",
                                                openDropdowns[item.id] ? "rotate-90" : ""
                                            )} />
                                        )}
                                    </button>

                                    {/* Dropdown Content */}
                                    <div className={cn(
                                        "overflow-hidden transition-all duration-300 ease-in-out",
                                        openDropdowns[item.id] && isExpanded ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
                                    )}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={child.href || "#"}
                                                onClick={() => {
                                                    if (window.innerWidth < 768) close()
                                                }}
                                                className={cn(
                                                    "flex items-center p-2 rounded-lg transition-all duration-200 group relative ml-4", // Indent children
                                                    isActive(child.href || "")
                                                        ? "text-white bg-black shadow-sm"
                                                        : "text-gray-400 hover:text-gray-600 hover:bg-white/50",
                                                    isExpanded ? "justify-start px-3" : "justify-center"
                                                )}
                                            >
                                                <child.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive(child.href || "") ? "text-black" : "")} />
                                                {isExpanded && (
                                                    <span className="ml-3 font-medium text-sm whitespace-nowrap">
                                                        {child.label}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <Link
                                    href={item.href || "#"}
                                    onClick={() => {
                                        if (window.innerWidth < 768) close()
                                    }}
                                    className={cn(
                                        "flex items-center p-3 rounded-xl transition-all duration-200 group relative",
                                        isActive(item.href || "")
                                            ? "text-white bg-black shadow-md shadow-black/20"
                                            : "text-gray-400 hover:text-gray-600 hover:bg-white/50",
                                        isExpanded ? "justify-start px-4" : "justify-center"
                                    )}
                                >
                                    <item.icon className={cn("w-6 h-6 flex-shrink-0 transition-colors", isActive(item.href || "") ? "text-black" : "")} />

                                    <span className={cn(
                                        "ml-3 font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 origin-left",
                                        isExpanded ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
                                    )}>
                                        {item.label}
                                    </span>

                                    {/* Chat Notification Badge */}
                                    {item.id === "chat" && totalUnreadCount > 0 && (
                                        <div className={cn(
                                            "flex items-center justify-center bg-orange-500 text-white font-bold rounded-full shadow-sm absolute",
                                            isExpanded ? "right-3" : "top-2 right-2 w-4 h-4 text-[10px]",
                                            isExpanded ? "w-5 h-5 text-xs" : ""
                                        )}>
                                            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                                        </div>
                                    )}

                                    {isActive(item.href || "") && !isExpanded && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black rounded-r-full -ml-0" />
                                    )}
                                    {isActive(item.href || "") && isExpanded && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black rounded-r-full ml-[-1rem]" />
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto flex flex-col gap-4 w-full px-2">
                    <Link
                        href="/settings"
                        className={cn(
                            "flex items-center p-3 text-gray-400 hover:text-black transition-colors rounded-xl hover:bg-white/50",
                            isExpanded ? "justify-start px-4" : "justify-center"
                        )}>
                        <Settings className="w-6 h-6 flex-shrink-0" />
                        <span className={cn(
                            "ml-3 font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
                            isExpanded ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
                        )}>
                            Settings
                        </span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center p-3 text-white bg-accent-red rounded-xl shadow-lg hover:shadow-xl hover:bg-red-500 transition-all",
                            isExpanded ? "justify-start px-4" : "justify-center"
                        )}
                    >
                        <LogOut className="w-6 h-6 flex-shrink-0" />
                        <span className={cn(
                            "ml-3 font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
                            isExpanded ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
                        )}>
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </>
    )
}
