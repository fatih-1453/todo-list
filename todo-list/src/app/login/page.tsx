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

                <div className="relative z-10 max-w-xl mx-auto w-full">
                    <h2 className="text-3xl font-bold mb-2 tracking-tight">Product Roadmap</h2>
                    <p className="text-gray-500 mb-10">Our journey and upcoming milestones.</p>

                    {loadingRoadmap ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                            {roadmapItems.map((item, index) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={item.id}
                                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                                >
                                    {/* Icon */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" style={{ backgroundColor: item.color }}>
                                        <MapPin className="w-4 h-4 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-gray-900">{item.title}</span>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{item.quarter}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.status === 'completed' ? 'bg-green-500 w-full' :
                                                        item.status === 'in-progress' ? 'bg-blue-500 w-1/2' : 'bg-gray-300 w-0'
                                                        }`}
                                                />
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400">{item.status}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
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
