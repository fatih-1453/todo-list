"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client" // Ensure this path is correct
import { ArrowRight, Loader2, Mail, Lock } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

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
        <main className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <div className="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-black/10">
                        <span className="text-white font-bold text-3xl">Z</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
                    <p className="text-gray-500 text-sm">Sign in to continue to your dashboard</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="p-8 space-y-5">
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
                </form>

                {/* Footer */}
                <div className="p-6 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-100">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-black font-semibold hover:underline">
                        Register here
                    </Link>
                </div>
            </div>
        </main>
    )
}
