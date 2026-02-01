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

    // Precise coordinates matching visual segments
    const positions = [
        { id: 1, x: 18, y: 35, labelPos: 'left' },   // Segment 1 (Teal Light)
        { id: 2, x: 42, y: 32, labelPos: 'top' },    // Segment 2 (Teal Medium)
        { id: 3, x: 62, y: 45, labelPos: 'right' },  // Segment 3 (Grey Curve)
        { id: 4, x: 62, y: 68, labelPos: 'right' },  // Segment 4 (Blue Curve)
        { id: 5, x: 45, y: 82, labelPos: 'bottom' }, // Segment 5 (Purple Straight)
        { id: 6, x: 20, y: 85, labelPos: 'left' }    // Segment 6 (Arrow)
    ]

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-gray-50 overflow-hidden">
            {/* Left Side - Visuals */}
            <div className="w-full lg:w-[60%] relative flex flex-col items-center justify-center p-4 lg:p-12 bg-[#F0F2F5]">
                <div className="absolute top-10 left-10 z-10">
                    <h1 className="text-4xl font-light text-gray-800 tracking-tight">
                        <span className="font-bold">ROADMAP</span> TEMPLATE
                    </h1>
                    <p className="text-gray-400 text-xs mt-1 tracking-widest uppercase">Lorem ipsum dolor sit amet</p>
                </div>

                <div className="absolute top-10 right-10 flex items-center gap-2 opacity-60 z-10">
                    <span className="font-bold text-gray-700">MY PRODUCT</span> <span className="font-light text-gray-500">ROADMAP</span>
                </div>

                {loadingRoadmap ? (
                    <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                ) : (
                    <div className="relative w-full max-w-5xl aspect-[16/9] mt-10 scale-95 lg:scale-105">
                        {/* 3D Segmented SVG Roadmap */}
                        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                                    <feOffset dx="0" dy="2" result="offsetblur" />
                                    <feComponentTransfer>
                                        <feFuncA type="linear" slope="0.3" />
                                    </feComponentTransfer>
                                    <feMerge>
                                        <feMergeNode />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Segment 1: Start (Teal Light) */}
                            {/* 3D Side */}
                            <path d="M 5 40 L 30 38 L 30 40 L 5 42 Z" fill="#A0E0D8" />
                            {/* Top Face */}
                            <path d="M 5 35 L 30 33 L 30 38 L 5 40 Z" fill="#CFFBF6" filter="url(#drop-shadow)" />

                            {/* Segment 2: Middle Top (Teal Medium) */}
                            {/* 3D Side */}
                            <path d="M 32 38 L 55 40 L 55 42 L 32 40 Z" fill="#6BDDD0" />
                            {/* Top Face */}
                            <path d="M 32 33 L 55 35 L 55 40 L 32 38 Z" fill="#8BEDE2" filter="url(#drop-shadow)" />

                            {/* Segment 3: Curve Down (Grey) */}
                            {/* 3D Side */}
                            <path d="M 57 40 C 75 42, 78 52, 72 62 L 68 62 C 74 52, 71 44, 57 42 Z" fill="#888" />
                            {/* Top Face */}
                            <path d="M 57 35 C 75 37, 78 47, 72 57 L 62 57 C 68 47, 65 39, 57 35 Z" fill="#A0AEC0" filter="url(#drop-shadow)" />

                            {/* Segment 4: Curve Back (Blue) */}
                            {/* 3D Side */}
                            <path d="M 70 65 C 68 75, 60 82, 45 85 L 43 85 C 58 82, 65 75, 66 65 Z" fill="#4A90E2" />
                            {/* Top Face */}
                            <path d="M 71 60 C 69 70, 61 77, 46 80 L 41 80 C 60 77, 68 67, 70 60 Z" fill="#6CB2EB" filter="url(#drop-shadow)" />

                            {/* Segment 5: Bottom Straight (Purple) */}
                            {/* 3D Side */}
                            <path d="M 43 87 L 22 84 L 22 86 L 43 89 Z" fill="#6B46C1" />
                            {/* Top Face */}
                            <path d="M 43 82 L 22 79 L 22 84 L 43 87 Z" fill="#805AD5" filter="url(#drop-shadow)" />

                            {/* Segment 6: Arrow Head (Dark Purple) */}
                            {/* 3D Side */}
                            <path d="M 20 86 L -5 82 L 18 78 L 20 86 Z" fill="#553C9A" />
                            {/* Top Face */}
                            <path d="M 20 81 L -5 77 L 18 73 L 20 81 Z" fill="#8B5CF6" filter="url(#drop-shadow)" />


                            {/* Labels ON the ribbon */}
                            <text x="15" y="39" fontSize="1.5" fill="#555" fontWeight="bold">Q1'25</text>
                            <text x="42" y="39" fontSize="1.5" fill="#555" fontWeight="bold">Q2'25</text>
                            <text x="60" y="45" fontSize="1.5" fill="white" fontWeight="bold">Q3'25</text>
                            <text x="58" y="70" fontSize="1.5" fill="white" fontWeight="bold">Q4'25</text>
                            <text x="32" y="85" fontSize="1.5" fill="white" fontWeight="bold">Q1'26</text>
                            <text x="10" y="81" fontSize="1.5" fill="white" fontWeight="bold">Q2'26</text>
                        </svg>

                        {/* Pins & Cards */}
                        {roadmapItems.slice(0, 6).map((item, index) => {
                            const pos = positions[index];
                            if (!pos) return null;

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.15 }}
                                    className="absolute"
                                    style={{
                                        left: `${pos.x}%`,
                                        top: `${pos.y}%`,
                                        transform: 'translate(-50%, -100%)'
                                    }}
                                >
                                    <div className="relative group flex flex-col items-center">
                                        {/* Pin */}
                                        <div className="relative z-20 transition-transform duration-300 group-hover:scale-110">
                                            <div style={{ color: item.color || '#4FD1C5' }}>
                                                <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                                                    <path d="M20 0C8.954 0 0 8.954 0 20C0 35 20 50 20 50C20 50 40 35 40 20C40 8.954 31.046 0 20 0Z" fill="currentColor" />
                                                    <circle cx="20" cy="20" r="8" fill="white" />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* Pin Shadow */}
                                        <div className="w-8 h-2 bg-black/20 rounded-full blur-sm -mt-1 z-10" />

                                        {/* Content Card */}
                                        <div className={`
                                            absolute w-48 pointer-events-none group-hover:pointer-events-auto z-30
                                            ${pos.labelPos === 'left' ? 'right-[110%] top-0 text-right pr-4' : ''}
                                            ${pos.labelPos === 'right' ? 'left-[110%] top-0 text-left pl-4' : ''}
                                            ${pos.labelPos === 'top' ? 'bottom-[110%] left-1/2 -translate-x-1/2 text-center pb-2' : ''}
                                            ${pos.labelPos === 'bottom' ? 'top-[110%] left-1/2 -translate-x-1/2 text-center pt-2' : ''}
                                        `}>
                                            <div className={`flex items-center gap-2 mb-1 ${pos.labelPos === 'left' ? 'justify-end' : pos.labelPos === 'right' ? 'justify-start' : 'justify-center'}`}>
                                                {pos.labelPos === 'left' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />}
                                                <h3 className="font-bold text-sm uppercase tracking-tight text-gray-800" style={{ color: item.color }}>{item.title}</h3>
                                                {pos.labelPos !== 'left' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />}
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
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
                    <div className="mb-8 text-center">
                        <div className="w-full h-24 relative mb-4 flex justify-center">
                            <img src="/logo-full.png" alt="DOMYADHU Logo" className="h-full object-contain" />
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
