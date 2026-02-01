"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api-client"
import { Loader2, Mail, Lock, Calendar, CheckCircle2, Circle, ArrowRight, ChevronRight } from "lucide-react"
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
        <div className="min-h-screen flex flex-col lg:flex-col font-sans bg-gray-50 overflow-auto">

            {/* Top Section - Modern Horizontal Roadmap */}
            <div className="w-full relative flex flex-col justify-center p-8 bg-[#F8FAFC] overflow-hidden border-b border-gray-200">

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] rounded-full bg-orange-50 blur-[100px] opacity-60 animate-pulse" />
                    <div className="absolute bottom-[-50%] right-[-10%] w-[40%] h-[200%] rounded-full bg-green-50 blur-[100px] opacity-60 animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 mb-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Our Journey to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">Impact</span>
                        </h1>
                    </motion.div>
                </div>

                {/* Horizontal Smart Timeline */}
                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    {loadingRoadmap ? (
                        <div className="flex justify-center items-center gap-3 text-gray-400 py-12">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading Roadmap...
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto pb-8 pt-4 scrollbar-hide px-4">
                            <div className="min-w-max flex gap-8 items-start relative px-4">

                                {/* Connecting Line Background */}
                                <div className="absolute left-6 right-6 top-[24px] h-[2px] bg-gray-200" />

                                {/* Gradient Progress Line (Animated) */}
                                <motion.div
                                    className="absolute left-6 top-[24px] h-[2px] bg-gradient-to-r from-orange-500 via-green-500 to-blue-500 origin-left"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    style={{ width: 'calc(100% - 48px)' }}
                                />

                                {roadmapItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.15, duration: 0.5 }}
                                        className="relative flex flex-col items-center group w-64 flex-shrink-0"
                                    >
                                        {/* Timeline Node */}
                                        <div className={`
                                            w-12 h-12 rounded-2xl flex items-center justify-center mb-6 relative z-10
                                            bg-white border-2 transition-all duration-300 shadow-sm
                                            ${item.status === 'completed' ? 'border-green-500 text-green-600' :
                                                item.status === 'in-progress' ? 'border-orange-500 text-orange-600 scale-110 shadow-orange-200 ring-4 ring-orange-50' :
                                                    'border-gray-200 text-gray-400 grayscale'}
                                        `}>
                                            {item.status === 'completed' ? (
                                                <CheckCircle2 className="w-6 h-6" />
                                            ) : item.status === 'in-progress' ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <Circle className="w-5 h-5" />
                                            )}
                                        </div>

                                        {/* Content Card */}
                                        <div className={`
                                            w-full p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm
                                            transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:bg-white text-center
                                            ${item.status === 'in-progress' ? 'border-t-4 border-t-orange-500' : ''}
                                            ${item.status === 'completed' ? 'border-t-4 border-t-green-500' : ''}
                                        `}>
                                            <span className={`
                                                px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 inline-block
                                                ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-500'}
                                            `}>
                                                {item.quarter}
                                            </span>
                                            <h3 className="text-base font-bold text-gray-900 leading-tight mb-2">{item.title}</h3>
                                            <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-3">
                                                {item.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section - Login Form */}
            <div className="w-full bg-white flex flex-col items-center justify-center p-12 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
                <div className="max-w-4xl w-full flex flex-col md:flex-row gap-12 items-center">

                    {/* Brand Banner */}
                    <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                        <img src="/logo-full.png" alt="DOMYADHU Logo" className="h-24 md:h-32 object-contain" />
                    </div>

                    {/* Vertical Divider for Desktop */}
                    <div className="hidden md:block w-[1px] h-32 bg-gray-200"></div>

                    {/* Form Container */}
                    <div className="w-full md:w-1/2 max-w-sm">
                        <div className="mb-6 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                            <p className="text-gray-500 text-sm">Welcome back! Please enter your details.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                    {error}
                                </div>
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

                            <div className="flex justify-between items-center pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded text-black focus:ring-black border-gray-300" />
                                    <span className="text-xs text-gray-600 font-medium">Remember me</span>
                                </label>
                                <Link href="#" className="text-xs font-bold text-gray-500 hover:text-black">
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white h-11 rounded-lg font-bold text-sm tracking-wide hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                                {!loading && <ArrowRight className="w-4 h-4" />}
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
                            className="w-full border border-gray-200 h-10 rounded-lg font-bold text-gray-700 text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                            GitHub
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
