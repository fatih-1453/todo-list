"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ArrowRight, Loader2, Mail, Lock, User, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        await authClient.signUp.email({
            email,
            password,
            name,
        }, {
            onSuccess: () => {
                setSuccess(true)
                setTimeout(() => {
                    router.push("/login")
                }, 1500)
            },
            onError: (ctx) => {
                setError(ctx.error.message)
                setLoading(false)
            }
        })
    }

    if (success) {
        return (
            <main className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-50 rounded-full mx-auto flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Account Created!</h1>
                    <p className="text-gray-500 text-sm mb-6">Redirecting you to login...</p>
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <h1 className="text-2xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-500 text-sm">Join your team and get organized</p>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="p-8 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center justify-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-yellow)] transition-all"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

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
                                placeholder="Min 8 characters"
                                minLength={8}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--accent-yellow)] text-black py-3.5 rounded-xl font-bold mt-2 hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-200 hover:shadow-xl active:scale-95 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                {/* Footer */}
                <div className="p-6 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-100">
                    Already have an account?{" "}
                    <Link href="/login" className="text-black font-semibold hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </main>
    )
}
