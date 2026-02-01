"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api-client"
import { Loader2, Mail, Lock, CheckCircle2, Circle, Sparkles, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type RoadmapItem = {
    id: number
    quarter: string
    title: string
    description: string
    status: 'completed' | 'in-progress' | 'upcoming'
    displayOrder: number
    color: string
}

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
        <div className="h-screen w-screen flex flex-col lg:flex-row font-sans bg-white overflow-hidden">

            {/* Left Side - The "Perfect" Visual (Fit to Screen & Interactive) */}
            <div className="w-full lg:w-[65%] xl:w-[70%] bg-slate-50 relative flex flex-col items-center p-4 lg:p-6 h-full overflow-hidden">

                {/* Brand Ambient Background */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-orange-200/30 blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-green-200/30 blur-[120px]" />
                </div>

                <div className="relative z-10 w-full max-w-5xl h-full flex flex-col">
                    {/* Header - Fixed & Compact */}
                    <div className="text-center flex-shrink-0 mb-2 lg:mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-white rounded-full shadow-sm border border-gray-100 mb-2">
                            <Sparkles className="w-3 h-3 text-orange-500" />
                            <span className="text-[10px] font-semibold tracking-wide text-gray-600 uppercase">Strategic Roadmap</span>
                        </div>
                        <h1 className="text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight">Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">Future</span></h1>
                    </div>

                    {loadingRoadmap ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                        </div>
                    ) : (
                        // Main Container - Flex Column, Justify Evenly, NO SCROLL
                        <div className="flex-1 relative flex flex-col justify-center h-full min-h-0">
                            {/* Central Line */}
                            <div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-gray-200 -translate-x-1/2 rounded-full hidden lg:block" />
                            <motion.div
                                className="absolute left-1/2 top-4 w-[2px] bg-gradient-to-b from-orange-500 via-green-500 to-blue-500 -translate-x-1/2 rounded-full hidden lg:block"
                                initial={{ height: 0 }}
                                animate={{ height: '90%' }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />

                            {/* Items Container */}
                            <div className="flex flex-col w-full h-full min-h-0 justify-evenly items-center lg:items-stretch py-2">
                                {roadmapItems.map((item, index) => {
                                    const isEven = index % 2 === 0;
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05, duration: 0.4 }}
                                            className={`flex flex-col lg:flex-row items-center w-full ${isEven ? 'lg:flex-row-reverse' : ''} group relative px-4 lg:px-0`}
                                        >
                                            {/* Side Spacer (Mobile hidden, Desktop 50%) */}
                                            <div className="hidden lg:block w-1/2" />

                                            {/* Center Node */}
                                            <div className="relative z-10 flex-shrink-0 lg:mx-4 mb-2 lg:mb-0">
                                                <div className={`
                                                    w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shadow-[0_0_0_3px_white] border-2 transition-all duration-300
                                                    ${item.status === 'completed' ? 'bg-white border-green-500 text-green-600' :
                                                        item.status === 'in-progress' ? 'bg-orange-500 border-orange-500 text-white scale-110 shadow-orange-200' :
                                                            'bg-white border-gray-300 text-gray-300'}
                                                `}>
                                                    {item.status === 'completed' ? <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4" /> :
                                                        item.status === 'in-progress' ? <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" /> :
                                                            <Circle className="w-2.5 h-2.5" />}
                                                </div>
                                            </div>

                                            {/* Card Content - Compact & Truncated */}
                                            <div className={`w-full lg:w-1/2 flex ${isEven ? 'lg:justify-end pr-0 lg:pr-6' : 'lg:justify-start pl-0 lg:pl-6'}`}>

                                                {/* Hover Popover Container - Positioned absolutely relative to this half */}
                                                <div className="relative w-full max-w-sm">

                                                    {/* The Card */}
                                                    <div className={`
                                                        relative p-2.5 lg:p-3 bg-white rounded-xl shadow-sm border border-gray-100 w-full transition-all duration-300
                                                        ${item.status === 'in-progress' ? 'ring-1 ring-orange-500/20 bg-orange-50/5' : ''}
                                                        hover:shadow-lg hover:border-orange-200 hover:z-50
                                                        group-hover:scale-[1.02]
                                                    `}>
                                                        {/* Arrow Pointer */}
                                                        <div className={`
                                                            absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-t border-r border-gray-100 rotate-45 hidden lg:block
                                                            ${isEven ? '-right-[5px] border-l-0 border-b-0 group-hover:border-orange-200' : '-left-[5px] border-t-0 border-r-0 border-b border-l group-hover:border-orange-200'}
                                                        `}></div>

                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <span className={`
                                                                px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider
                                                                ${item.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                                    item.status === 'in-progress' ? 'bg-orange-50 text-orange-700' :
                                                                        'bg-gray-100 text-gray-500'}
                                                            `}>
                                                                {item.quarter}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-1 group-hover:line-clamp-none">
                                                            {item.title}
                                                        </h3>

                                                        {/* Truncated Description (Visible Default) */}
                                                        <p className="text-[10px] text-gray-400 leading-snug mt-0.5 line-clamp-1 group-hover:opacity-0 transition-opacity duration-0">
                                                            {item.description}
                                                        </p>

                                                        {/* Full Description (Visible Hover - Overlay) */}
                                                        {(() => {
                                                            const isBottomItem = item.quarter.includes("2029") || item.quarter.includes("2030");
                                                            return (
                                                                <div className={`absolute left-0 w-full bg-white p-3 rounded-xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50 text-left ${isBottomItem ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                                                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                                                        {item.description}
                                                                    </p>
                                                                </div>
                                                            )
                                                        })()}

                                                        {/* Alternative: In-place expansion via absolute positioning over the truncated text 
                                                            Actually, the 'popover below' strategy keeps the grid stable. 
                                                            Let's try a cleaner approach: The card ITSELF contains the full text but only shows it on hover 
                                                            via absolute positioning to not push layout?
                                                            
                                                            Let's use a "Tooltip" style overlay for the whole card content on hover? 
                                                            No, user wants "dekat kursor maka menampilkan".
                                                            
                                                            Strategy: 
                                                            1. Show strict 1-line truncation.
                                                            2. On Hover, show a stylized tooltip/bubble with the full text.
                                                        */}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Login Form (Fixed) */}
            <div className="w-full lg:w-[35%] xl:w-[30%] bg-white border-l border-gray-50 shadow-2xl z-20 flex flex-col justify-center p-8 h-full">
                <div className="max-w-xs mx-auto w-full">
                    <div className="mb-6 text-center">
                        <div className="w-full h-14 relative mb-2 flex justify-center">
                            <img src="/logo-full.png" alt="DOMYADHU Logo" className="h-full object-contain" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Sign In</h1>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3">
                        {error && (
                            <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>
                        )}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 text-xs focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all h-9"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 text-xs focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all h-9"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white h-9 rounded-lg font-bold text-xs tracking-wide hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Sign In"}
                        </button>
                    </form>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-gray-400 font-medium">Or</span></div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            await authClient.signIn.social({
                                provider: "github",
                                callbackURL: "/"
                            })
                        }}
                        className="w-full border border-gray-200 h-9 rounded-lg font-bold text-gray-700 text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        GitHub
                    </button>

                </div>
            </div>
        </div>
    )
}
