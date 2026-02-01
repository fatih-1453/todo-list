"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api-client"
import { Loader2, Mail, Lock, Calendar, CheckCircle2, Circle, ArrowRight } from "lucide-react"
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
    const [hoveredItem, setHoveredItem] = useState<number | null>(null)

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
        <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-gray-50 overflow-hidden">
            {/* Left Side - Modern Smart Visuals */}
            <div className="w-full lg:w-[60%] relative flex flex-col justify-center p-8 lg:p-16 bg-[#F8FAFC] overflow-hidden">

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-100 blur-[100px] opacity-60 animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-green-100 blur-[100px] opacity-60 animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Our Journey to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">
                                Impact & Innovation
                            </span>
                        </h1>
                        <p className="text-gray-500 mt-4 text-lg max-w-xl">
                            Track our progress as we build the future of philanthropy together.
                        </p>
                    </motion.div>
                </div>

                {/* Smart Timeline */}
                <div className="relative z-10 flex-1 min-h-[400px] pr-4">
                    {loadingRoadmap ? (
                        <div className="flex items-center gap-3 text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading Roadmap...
                        </div>
                    ) : (
                        <div className="relative h-full flex flex-col space-y-0">
                            {/* Connecting Line */}
                            <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-gray-200 ml-[1px]"></div>

                            {/* Gradient Fill Line (Animated) */}
                            <motion.div
                                className="absolute left-[27px] top-6 w-[2px] bg-gradient-to-b from-orange-500 via-green-500 to-blue-500 ml-[1px]"
                                initial={{ height: 0 }}
                                animate={{ height: '90%' }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />

                            {/* Timeline Items */}
                            <div className="space-y-6 overflow-y-auto pr-2 scrollbar-hide py-2 max-h-[60vh]">
                                {roadmapItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.15, duration: 0.5 }}
                                        className="relative pl-20 group"
                                        onMouseEnter={() => setHoveredItem(item.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                    >
                                        {/* Timeline Node */}
                                        <div className={`
                                            absolute left-2 top-0 w-12 h-12 rounded-2xl flex items-center justify-center
                                            bg-white border-2 z-10 transition-all duration-300 shadow-sm
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

                                        {/* Connector to Card */}
                                        <div className="absolute left-14 top-6 w-6 h-[2px] bg-gray-200 group-hover:bg-gray-300 transition-colors" />

                                        {/* Content Card */}
                                        <div className={`
                                            p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm
                                            transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-white
                                            ${item.status === 'in-progress' ? 'border-l-4 border-l-orange-500' : ''}
                                            ${item.status === 'completed' ? 'border-l-4 border-l-green-500' : ''}
                                        `}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className={`
                                                        px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 inline-block
                                                        ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            item.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-gray-100 text-gray-500'}
                                                    `}>
                                                        {item.quarter}
                                                    </span>
                                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.title}</h3>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
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

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span></div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            await authClient.signIn.social({
                                provider: "github",
                                callbackURL: "/"
                            })
                        }}
                        className="w-full border border-gray-200 h-11 rounded-lg font-bold text-gray-700 text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        GitHub Mode
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        Don't have an account? <Link href="/register" className="text-black font-bold hover:underline">Register now</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
