"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api-client"
import { Loader2, Mail, Lock, CheckCircle2, Circle, Sparkles } from "lucide-react"
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

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-white overflow-hidden">

            {/* Left Side - The "Perfect" Visual */}
            <div className="w-full lg:w-[65%] xl:w-[70%] bg-slate-50 relative flex flex-col items-center justify-center p-8 overflow-hidden">

                {/* Brand Ambient Background */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-orange-200/30 blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-green-200/30 blur-[120px]" />
                </div>

                <div className="relative z-10 w-full max-w-4xl h-full flex flex-col">
                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100 mb-4">
                            <Sparkles className="w-3 h-3 text-orange-500" />
                            <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">Strategic Roadmap</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">Future</span></h1>
                    </div>

                    {loadingRoadmap ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <div className="flex-1 relative overflow-y-auto pr-4 scrollbar-hide mask-fade-bottom">
                            {/* Central Line */}
                            <div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-gray-200 -translate-x-1/2 rounded-full hidden lg:block" />
                            <motion.div
                                className="absolute left-1/2 top-4 w-[2px] bg-gradient-to-b from-orange-500 via-green-500 to-blue-500 -translate-x-1/2 rounded-full hidden lg:block"
                                initial={{ height: 0 }}
                                animate={{ height: '95%' }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />

                            <div className="space-y-12 lg:space-y-0 lg:relative pb-12">
                                {roadmapItems.map((item, index) => {
                                    const isEven = index % 2 === 0;
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.15, duration: 0.5 }}
                                            className={`flex flex-col lg:flex-row items-center w-full ${isEven ? 'lg:flex-row-reverse' : ''}`}
                                        >
                                            {/* Side Content (Empty for spacing on desktop to create alternation) */}
                                            <div className="w-full lg:w-1/2" />

                                            {/* Center Node */}
                                            <div className="relative z-10 flex-shrink-0 my-4 lg:my-0 px-4">
                                                <div className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_0_4px_white] border-2 transition-all duration-500
                                                    ${item.status === 'completed' ? 'bg-white border-green-500 text-green-600' :
                                                        item.status === 'in-progress' ? 'bg-orange-500 border-orange-500 text-white scale-125 shadow-orange-200' :
                                                            'bg-white border-gray-300 text-gray-300'}
                                                `}>
                                                    {item.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                                                        item.status === 'in-progress' ? <Loader2 className="w-5 h-5 animate-spin" /> :
                                                            <Circle className="w-4 h-4" />}
                                                </div>
                                            </div>

                                            {/* Card Content */}
                                            <div className={`w-full lg:w-1/2 flex ${isEven ? 'lg:justify-end pr-0 lg:pr-8' : 'lg:justify-start pl-0 lg:pl-8'}`}>
                                                <div className={`
                                                    relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md group hover:shadow-lg transition-all hover:-translate-y-1
                                                    ${item.status === 'in-progress' ? 'ring-2 ring-orange-500/10' : ''}
                                                `}>
                                                    {/* Arrow Pointer */}
                                                    <div className={`
                                                        absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-gray-100 rotate-45 hidden lg:block
                                                        ${isEven ? '-right-[7px] border-l-0 border-b-0' : '-left-[7px] border-t-0 border-r-0 border-b border-l'}
                                                    `}></div>

                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`
                                                            px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                                                            ${item.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                                item.status === 'in-progress' ? 'bg-orange-50 text-orange-700' :
                                                                    'bg-gray-100 text-gray-500'}
                                                        `}>
                                                            {item.quarter}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight group-hover:text-orange-600 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 leading-relaxed">
                                                        {item.description}
                                                    </p>
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

            {/* Right Side - Login Form (Consistent & Clean) */}
            <div className="w-full lg:w-[35%] xl:w-[30%] bg-white border-l border-gray-50 shadow-2xl shadow-gray-200/50 z-20 flex flex-col justify-center p-8 lg:p-12">
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
