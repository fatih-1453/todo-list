"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api-client"
import { ArrowRight, Loader2, Mail, Lock, MapPin } from "lucide-react"
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
                setRoadmapItems(data)
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

        await authClient.signIn.email({
            email,
            password,
        }, {
            onSuccess: () => {
                router.push("/")
            },
            onError: (ctx) => {
                setError(ctx.error.message)
                setLoading(false)
            }
        })
    }

    return (
        <div className="min-h-screen flex font-sans">
            {/* Left Side - Dynamic Roadmap */}
            <div className="hidden lg:flex w-[55%] bg-gray-50 relative overflow-hidden flex-col justify-center p-12">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

                <div className="relative z-10 max-w-xl mx-auto w-full h-full flex flex-col">
                    <div className="mb-8">
                        <h2 className="text-4xl font-extrabold mb-3 tracking-tight text-gray-900">
                            Product <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Roadmap</span>
                        </h2>
                        <p className="text-gray-500 text-lg">Following our journey to excellence.</p>
                    </div>

                    {loadingRoadmap ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <div className="relative flex-1 overflow-y-auto pr-4 scrollbar-hide py-4">
                            {/* Continuous Connecting Line */}
                            <div className="absolute left-8 top-4 bottom-4 w-1 bg-gray-200 rounded-full" />
                            <div className="absolute left-8 top-4 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent rounded-full"
                                style={{ height: `${(roadmapItems.filter(i => i.status === 'completed').length / roadmapItems.length) * 100}%` }}
                            />

                            <div className="space-y-12">
                                {roadmapItems.map((item, index) => {
                                    const isCompleted = item.status === 'completed';
                                    const isInProgress = item.status === 'in-progress';

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.15, type: "spring" }}
                                            key={item.id}
                                            className={`relative pl-24 group ${isInProgress ? 'scale-105' : ''}`}
                                        >
                                            {/* Node Marker */}
                                            <div className={`absolute left-0 top-0 w-16 h-16 flex items-center justify-center z-20`}>
                                                <div className={`
                                                    relative flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-lg transition-all duration-500
                                                    ${isCompleted ? 'bg-green-500 border-green-100' :
                                                        isInProgress ? 'bg-blue-600 border-blue-100' :
                                                            'bg-white border-gray-100'}
                                                `}>
                                                    {isInProgress && (
                                                        <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></span>
                                                    )}

                                                    {isCompleted ? (
                                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : isInProgress ? (
                                                        <MapPin className="w-6 h-6 text-white animate-bounce" />
                                                    ) : (
                                                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Connector Line to Card */}
                                            <div className={`absolute left-16 top-8 w-8 h-0.5 ${isInProgress ? 'bg-blue-500' : 'bg-gray-200'}`} />

                                            {/* Card Content */}
                                            <div
                                                className={`
                                                    relative p-6 rounded-2xl border transition-all duration-300
                                                    ${isInProgress
                                                        ? 'bg-white shadow-xl shadow-blue-500/10 border-blue-100 ring-1 ring-blue-50'
                                                        : 'bg-white/60 hover:bg-white shadow-sm hover:shadow-md border-gray-100 backdrop-blur-sm'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <span className={`
                                                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                                                            ${isInProgress ? 'bg-blue-100 text-blue-700' :
                                                                isCompleted ? 'bg-green-100 text-green-700' :
                                                                    'bg-gray-100 text-gray-500'}
                                                        `}>
                                                            {item.quarter}
                                                        </span>
                                                        <h3 className={`text-lg font-bold mt-1 ${isInProgress ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {item.title}
                                                        </h3>
                                                    </div>
                                                    {isInProgress && (
                                                        <span className="flex h-3 w-3 relative">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                                    {item.description}
                                                </p>

                                                {/* Smart Progress Visual */}
                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: isCompleted ? '100%' : isInProgress ? '60%' : '0%' }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className={`h-full rounded-full ${isCompleted ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                                                isInProgress ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gray-300'
                                                            }`}
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                                    <span>Progress</span>
                                                    <span>{isCompleted ? '100%' : isInProgress ? 'In Progress' : '0%'}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-[45%] bg-white flex items-center justify-center p-8 relative">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-black/10">
                            <span className="text-white font-bold text-3xl">Z</span>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
                        <p className="text-gray-500 text-sm">Sign in to continue to your dashboard</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center justify-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-yellow)] transition-all"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-yellow)] transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link href="#" className="text-xs text-gray-500 hover:text-black hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-100" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                await authClient.signIn.social({
                                    provider: "github",
                                    callbackURL: "/"
                                })
                            }}
                            className="w-full bg-white text-gray-900 border border-gray-200 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GitHub
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-500">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-black font-semibold hover:underline">
                            Register here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
