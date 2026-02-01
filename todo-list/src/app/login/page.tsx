"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api-client"
import { Loader2, Mail, Lock, MapPin } from "lucide-react"
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

    // Precise coordinates for Pins to match the new SVG paths
    const positions = [
        { id: 1, x: 22, y: 32, labelPos: 'left' },   // Q1'25
        { id: 2, x: 45, y: 35, labelPos: 'top' },    // Q2'25
        { id: 3, x: 65, y: 48, labelPos: 'right' },  // Q3'25
        { id: 4, x: 68, y: 72, labelPos: 'right' },  // Q4'25
        { id: 5, x: 48, y: 88, labelPos: 'bottom' }, // Q1'26
        { id: 6, x: 22, y: 92, labelPos: 'left' }    // Q2'26
    ]

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-gray-50 overflow-hidden">
            {/* Left Side - Visuals */}
            <div className="w-full lg:w-[60%] relative flex flex-col items-center justify-center p-4 lg:p-12 bg-[#F8F9FA]">
                <div className="absolute top-10 left-10">
                    <h1 className="text-4xl font-light text-gray-800 tracking-tight">
                        <span className="font-bold">ROADMAP</span> TEMPLATE
                    </h1>
                    <p className="text-gray-400 text-xs mt-1 tracking-widest uppercase">Lorem ipsum dolor sit amet</p>
                </div>

                <div className="absolute top-10 right-10 flex items-center gap-2 opacity-60">
                    <span className="font-bold text-gray-700">MY PRODUCT</span> <span className="font-light text-gray-500">ROADMAP</span>
                </div>

                {loadingRoadmap ? (
                    <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                ) : (
                    <div className="relative w-full max-w-4xl aspect-[16/9] mt-10 scale-90 lg:scale-100">
                        {/* SVG Layer */}
                        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                                    <feOffset dx="2" dy="4" result="offsetblur" />
                                    <feComponentTransfer>
                                        <feFuncA type="linear" slope="0.2" />
                                    </feComponentTransfer>
                                    <feMerge>
                                        <feMergeNode />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* 1. Teal Light (Start) */}
                            <path d="M 5 35 L 30 32 L 30 42 L 5 45 Z" fill="#D0F8F3" filter="url(#soft-shadow)" />

                            {/* 2. Teal Medium */}
                            <path d="M 32 32 L 55 35 L 53 46 L 32 42 Z" fill="#8BEDE2" filter="url(#soft-shadow)" />

                            {/* 3. Teal Dark (Curve Down) */}
                            <path d="M 57 36 C 75 40, 80 50, 75 60 L 65 60 C 68 52, 65 48, 55 46 Z" fill="#58D8CD" filter="url(#soft-shadow)" />

                            {/* 4. Blue (Curve Back) */}
                            <path d="M 74 63 C 70 80, 60 85, 40 90 L 38 80 C 55 78, 62 72, 64 63 Z" fill="#6CB2EB" filter="url(#soft-shadow)" />

                            {/* 5. Purple Light (Bottom) */}
                            <path d="M 36 90 L 15 88 L 18 78 L 36 80 Z" fill="#7E9BF3" filter="url(#soft-shadow)" />

                            {/* 6. Arrow (Pointer) */}
                            <path d="M 13 88 L -5 80 L 16 78 L 13 88 Z" fill="#8B5CF6" filter="url(#soft-shadow)" />

                            {/* Text Labels on Path */}
                            <text x="15" y="47" fontSize="2" fill="white" fontWeight="bold" opacity="0.6">Q1'25</text>
                            <text x="42" y="48" fontSize="2" fill="white" fontWeight="bold" opacity="0.6">Q2'25</text>
                            <text x="60" y="58" fontSize="2" fill="white" fontWeight="bold" opacity="0.6">Q3'25</text>
                            <text x="58" y="78" fontSize="2" fill="white" fontWeight="bold" opacity="0.6">Q4'25</text>
                            <text x="35" y="82" fontSize="2" fill="white" fontWeight="bold" opacity="0.6">Q1'26</text>
                            <text x="20" y="82" fontSize="2" fill="white" fontWeight="bold" opacity="0.6">Q2'26</text>
                        </svg>

                        {/* Interactive Pins */}
                        {roadmapItems.slice(0, 6).map((item, index) => {
                            const pos = positions[index];
                            if (!pos) return null;

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="absolute"
                                    style={{
                                        left: `${pos.x}%`,
                                        top: `${pos.y}%`,
                                        transform: 'translate(-50%, -100%)'
                                    }}
                                >
                                    <div className="relative group">
                                        {/* Pin Shape */}
                                        <div className="relative flex flex-col items-center">
                                            {/* Pin Head */}
                                            <div
                                                className="w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-20 transition-transform group-hover:scale-110"
                                                style={{ backgroundColor: item.color || '#3B82F6' }}
                                            >
                                                <div className="w-3 h-3 bg-white rounded-full" />
                                            </div>
                                            {/* Pin Point */}
                                            <div
                                                className="w-4 h-4 -mt-2 rotate-45 z-10"
                                                style={{ backgroundColor: item.color || '#3B82F6' }}
                                            />
                                            {/* Shadow */}
                                            <div className="w-8 h-2 bg-black/20 rounded-full blur-sm mt-1" />
                                        </div>

                                        {/* Info Card */}
                                        <div className={`
                                            absolute w-40 z-30 pointer-events-none group-hover:pointer-events-auto
                                            transition-all duration-300 opacity-90 group-hover:opacity-100
                                            ${pos.labelPos === 'left' ? 'right-[120%] top-0 text-right' : ''}
                                            ${pos.labelPos === 'right' ? 'left-[120%] top-0 text-left' : ''}
                                            ${pos.labelPos === 'top' ? 'bottom-[120%] left-1/2 -translate-x-1/2 text-center' : ''}
                                            ${pos.labelPos === 'bottom' ? 'to-[120%] left-1/2 -translate-x-1/2 text-center' : ''}
                                        `}>
                                            <div className={`flex items-center gap-2 mb-1 ${pos.labelPos === 'left' ? 'justify-end' : pos.labelPos === 'right' ? 'justify-start' : 'justify-center'}`}>
                                                {pos.labelPos === 'left' && <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />}
                                                <h3 className="font-bold text-sm uppercase text-gray-800 leading-none">{item.title}</h3>
                                                {pos.labelPos !== 'left' && <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />}
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-medium leading-tight">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-[40%] bg-white flex flex-col justify-center p-8 lg:p-16 shadow-2xl z-50">
                <div className="max-w-sm mx-auto w-full">
                    <div className="mb-8">
                        <div className="w-20 h-20 relative mb-4">
                            <img src="/logo.png" alt="Company Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                        <p className="text-gray-500 text-sm">Welcome back! Please enter your details.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>
                        )}
                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-sm focus:border-black focus:outline-none transition-colors"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 block">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-sm focus:border-black focus:outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-3 h-3 rounded text-black focus:ring-black border-gray-300" />
                                <span className="text-xs text-gray-500">Remember me</span>
                            </label>
                            <Link href="#" className="text-xs font-medium text-gray-500 hover:text-black">
                                Forgot?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white h-11 rounded-lg font-bold text-sm tracking-wide hover:bg-gray-800 transition-all shadow-lg shadow-black/10 mt-6"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sign In"}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-medium">Or</span></div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            await authClient.signIn.social({
                                provider: "github",
                                callbackURL: "/"
                            })
                        }}
                        className="w-full border border-gray-200 h-11 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        GitHub
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        Don't have an account? <Link href="/register" className="text-black font-bold hover:underline">Register now</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
