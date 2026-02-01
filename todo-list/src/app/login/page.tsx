"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api-client"
import { Loader2, Mail, Lock, CheckCircle2, Circle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

type RoadmapItem = {
    id: number
    quarter: string
    title: string
    description: string
    status: 'completed' | 'in-progress' | 'upcoming'
    displayOrder: number
    color: string
}

// Reference colors from the image
const STAGE_COLORS = [
    "#F43F5E", // Red/Pink
    "#FBBF24", // Yellow/Orange
    "#10B981", // Green
    "#0EA5E9", // Blue
    "#1E293B", // Dark Blue/Black
    "#8B5CF6"  // Purple (Extra)
]

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([])
    const [loadingRoadmap, setLoadingRoadmap] = useState(true)

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const data = await apiClient.get<RoadmapItem[]>('/roadmap')
                const sortedData = data.sort((a, b) => a.displayOrder - b.displayOrder)
                setRoadmapItems(sortedData)
            } catch (err) {
                console.error("Failed to fetch roadmap", err)
            } finally {
                setLoadingRoadmap(false)
            }
        }
        fetchRoadmap()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        await authClient.signIn.email({ email, password }, {
            onSuccess: () => router.push("/"),
            onError: (ctx) => { setError(ctx.error.message); setLoading(false) }
        })
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans overflow-hidden">

            {/* Left/Main Area - Winding Roadmap */}
            <div className="w-full lg:w-[65%] xl:w-[70%] bg-gray-50 flex flex-col p-6 lg:p-12 relative overflow-y-auto">

                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">ROADMAP</h1>
                        <p className="text-gray-500 mt-2">Our strategic journey and milestones.</p>
                    </div>
                </div>

                {loadingRoadmap ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                    </div>
                ) : (
                    <div className="relative flex-1 min-h-[600px] flex gap-8">
                        {/* 1. Timeline Column (Dates & Blocks) */}
                        <div className="flex flex-col w-48 lg:w-64 flex-shrink-0 pt-4 relative">
                            {roadmapItems.map((item, index) => {
                                const color = STAGE_COLORS[index % STAGE_COLORS.length];
                                return (
                                    <div key={item.id} className="h-32 mb-8 relative flex items-center">
                                        {/* Colored Block */}
                                        <div
                                            className="w-full h-full rounded-l-xl rounded-r-none shadow-sm flex flex-col justify-center px-4 relative z-10 transition-transform hover:scale-105 origin-left"
                                            style={{ backgroundColor: color }}
                                        >
                                            <p className="text-white/80 text-xs uppercase font-bold tracking-wider mb-1">
                                                {item.quarter}
                                            </p>
                                            <h3 className="text-white font-bold text-sm lg:text-base leading-snug">
                                                {item.title}
                                            </h3>
                                        </div>

                                        {/* Connector Number */}
                                        <div
                                            className="absolute -right-6 w-12 h-12 rounded-full border-4 border-gray-50 bg-white flex items-center justify-center z-20 font-bold text-lg shadow-md"
                                            style={{ color: color }}
                                        >
                                            {index + 1}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Connector Line running down the numbers */}
                            <div className="absolute right-0 top-16 bottom-16 w-[2px] bg-gray-200 -z-10" />
                        </div>

                        {/* 2. Process Area (Winding Path) */}
                        <div className="flex-1 relative pt-20">
                            <svg className="w-full h-full absolute top-0 left-0 pointer-events-none" style={{ minHeight: '100%' }}>
                                <defs>
                                    <linearGradient id="gradientPath" x1="0%" y1="0%" x2="0%" y2="100%">
                                        {STAGE_COLORS.map((c, i) => (
                                            <stop key={i} offset={`${(i / (STAGE_COLORS.length - 1)) * 100}%`} stopColor={c} />
                                        ))}
                                    </linearGradient>
                                </defs>

                                {/* Draw Winding Path */}
                                {roadmapItems.map((_, index) => {
                                    if (index >= roadmapItems.length - 1) return null;

                                    // Calculate relative coordinates
                                    const yStart = (index * 160) + 64; // Base block height + spacing
                                    const yEnd = ((index + 1) * 160) + 64;
                                    const xStart = 20; // Near numbers
                                    const xLoop = 300 + (index % 2 * 50); // Loop width variation

                                    // Generate Path Data for "Loop Right" style
                                    // Start -> Right -> Curve Down -> Left -> End
                                    const pathD = `
                                        M ${xStart} ${yStart} 
                                        L ${xLoop} ${yStart} 
                                        Q ${xLoop + 60} ${yStart} ${xLoop + 60} ${yStart + 80} 
                                        Q ${xLoop + 60} ${yEnd} ${xLoop} ${yEnd} 
                                        L ${xStart} ${yEnd}
                                    `;

                                    const colorStart = STAGE_COLORS[index % STAGE_COLORS.length];
                                    const colorEnd = STAGE_COLORS[(index + 1) % STAGE_COLORS.length];

                                    return (
                                        <g key={index}>
                                            {/* Gradient Pipe */}
                                            <path
                                                d={pathD}
                                                fill="none"
                                                stroke={`url(#grad-${index})`}
                                                strokeWidth="24"
                                                strokeLinecap="round"
                                                className="opacity-20"
                                            />
                                            {/* Core Line */}
                                            <path
                                                d={pathD}
                                                fill="none"
                                                stroke={`url(#grad-${index})`}
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeDasharray="8 4"
                                            />

                                            {/* Gradient Def just for this segment */}
                                            <defs>
                                                <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor={colorStart} />
                                                    <stop offset="100%" stopColor={colorEnd} />
                                                </linearGradient>
                                            </defs>
                                        </g>
                                    )
                                })}
                            </svg>

                            {/* Content Nodes on the "Shelves" */}
                            {roadmapItems.map((item, index) => {
                                const yPos = (index * 160) + 64;

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.2 }}
                                        className="absolute left-24 top-0 w-64 p-4 bg-white rounded-xl shadow-lg border border-gray-100 group hover:-translate-y-1 transition-transform cursor-pointer"
                                        style={{ top: yPos - 50 }} // Offset to center on line
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: STAGE_COLORS[index % STAGE_COLORS.length] }}>
                                                {item.status === 'completed' ? <CheckCircle2 className="w-4 h-4" color={STAGE_COLORS[index % STAGE_COLORS.length]} /> : <Circle className="w-4 h-4" color={STAGE_COLORS[index % STAGE_COLORS.length]} />}
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.status}</span>
                                        </div>
                                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                                            {item.description}
                                        </p>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-[35%] xl:w-[30%] bg-white border-l border-gray-100 shadow-2xl z-20 flex flex-col justify-center p-8 lg:p-12">
                <div className="max-w-xs mx-auto w-full">
                    <div className="mb-8 text-center">
                        <div className="w-full h-24 relative mb-4 flex justify-center">
                            <img src="/logo-full.png" alt="DOMYADHU Logo" className="h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                        <p className="text-gray-500 text-sm">Access your dashboard.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white h-11 rounded-lg font-bold text-sm tracking-wide hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-gray-400 font-medium">Or</span></div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            await authClient.signIn.social({
                                provider: "github",
                                callbackURL: "/"
                            })
                        }}
                        className="w-full border border-gray-200 h-10 rounded-lg font-bold text-gray-700 text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        GitHub
                    </button>

                </div>
            </div>
        </div>
    )
}
