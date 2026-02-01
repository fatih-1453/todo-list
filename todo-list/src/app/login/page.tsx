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
                // Fetch and Sort by displayOrder or ID to ensure correct flow
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

    // Static positions for the 6 visible slots in the curve
    // Adjusted to match the "C" shape or "U" turn shape in the reference
    // Path flows from Top-Left (Start) to Bottom-Left (End)
    const positions = [
        { id: 1, x: 20, y: 15, color: '#A0F1E8', labelPos: 'left' },   // Q1'25 (Top Left)
        { id: 2, x: 50, y: 15, color: '#6EE7D8', labelPos: 'top' },    // Q2'25
        { id: 3, x: 80, y: 30, color: '#4FD1C5', labelPos: 'right' },  // Q3'25 (Curve Start)
        { id: 4, x: 80, y: 60, color: '#63B3ED', labelPos: 'right' },  // Q4'25 (Curve Middle)
        { id: 5, x: 50, y: 75, color: '#7F9CF5', labelPos: 'bottom' }, // Q1'26
        { id: 6, x: 20, y: 85, color: '#9F7AEA', labelPos: 'left' }    // Q2'26 (Bottom Left Arrow)
    ]

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-gray-50">
            {/* Left Side - Curved Roadmap Visualization */}
            <div className="w-full lg:w-[60%] relative overflow-hidden flex flex-col items-center justify-center p-8 lg:p-12 bg-gray-50">
                {/* Background Text */}
                <div className="absolute top-8 left-8 z-0">
                    <h1 className="text-4xl font-bold text-gray-800 tracking-tight">ROADMAP <span className="font-light">TEMPLATE</span></h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">Lorem ipsum dolor sit amet</p>
                </div>

                {/* Logo Top Right */}
                <div className="absolute top-8 right-8 z-0 flex items-center gap-2 opacity-50 grayscale">
                    <span className="font-bold text-gray-600">MY PRODUCT</span> <span className="font-light">ROADMAP</span>
                </div>

                {loadingRoadmap ? (
                    <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                ) : (
                    <div className="relative w-full max-w-2xl aspect-[4/3] mt-20">
                        {/* The Curved Path SVG Layer */}
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.3" />
                                </filter>
                            </defs>

                            {/* Segment 1: Top Left Line */}
                            <path d="M 10 20 L 35 18 L 35 25 L 10 27 Z" fill="#D0F8F3" filter="url(#shadow)" />

                            {/* Segment 2: Top Line */}
                            <path d="M 38 18 L 63 20 L 60 28 L 38 25 Z" fill="#8BEDE2" filter="url(#shadow)" />

                            {/* Segment 3: Curve Top Right */}
                            <path d="M 66 21 C 85 25, 90 35, 85 50 L 75 50 C 78 40, 75 32, 63 29 Z" fill="#58D8CD" filter="url(#shadow)" />

                            {/* Segment 4: Curve Bottom Right */}
                            <path d="M 85 53 C 80 70, 70 80, 50 85 L 48 75 C 60 72, 68 65, 75 53 Z" fill="#6CB2EB" filter="url(#shadow)" />

                            {/* Segment 5: Bottom Line */}
                            <path d="M 47 86 L 25 83 L 28 73 L 45 75 Z" fill="#7E9BF3" filter="url(#shadow)" />

                            {/* Segment 6: Arrow Head (Purple) */}
                            <path d="M 22 83 L 5 90 L 22 97 L 22 83 Z" fill="#8B5CF6" filter="url(#shadow)" /> {/* Corrected Arrow Shape */}
                            {/* Fix Arrow to be a proper block ending in point */}
                            <path d="M 22 83 L 5 90 L 22 97 L 25 83 Z" fill="#805AD5" className="hidden" />
                            <path d="M 22 83 L 0 90 L 22 97 L 25 83 Z" fill="#805AD5" filter="url(#shadow)" />

                            {/* Quarter Labels on the Path (approximate) */}
                            <text x="20" y="32" fontSize="2.5" fill="white" fontWeight="bold" opacity="0.8">Q1'25</text>
                            <text x="50" y="32" fontSize="2.5" fill="white" fontWeight="bold" opacity="0.8">Q2'25</text>
                            <text x="68" y="45" fontSize="2.5" fill="white" fontWeight="bold" opacity="0.8">Q3'25</text>
                            <text x="68" y="65" fontSize="2.5" fill="white" fontWeight="bold" opacity="0.8">Q4'25</text>
                            <text x="40" y="70" fontSize="2.5" fill="white" fontWeight="bold" opacity="0.8">Q1'26</text>
                            <text x="25" y="78" fontSize="2.5" fill="white" fontWeight="bold" opacity="0.8">Q2'26</text>
                            <text x="10" y="88" fontSize="2.5" fill="white" fontWeight="bold" opacity="0.8">Q3'26</text>
                        </svg>

                        {/* Interactive Markers Layer */}
                        {/* Mapping items to the static positions. If items > 6, we stop or need more slots. 
                            If items < 6, some slots are empty. */}
                        {roadmapItems.slice(0, 6).map((item, index) => {
                            const pos = positions[index];
                            if (!pos) return null;

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + (index * 0.1) }}
                                    className="absolute"
                                    style={{
                                        left: `${pos.x}%`,
                                        top: `${pos.y}%`,
                                        transform: 'translate(-50%, -100%)' // Pivot at bottom center (tip of pin)
                                    }}
                                >
                                    {/* Pin */}
                                    <div className="relative group cursor-pointer">
                                        <MapPin
                                            size={48}
                                            fill={item.color || pos.color}
                                            color="white"
                                            strokeWidth={1.5}
                                            className="drop-shadow-lg transform transition-transform group-hover:-translate-y-2"
                                        />
                                        <div className="w-3 h-1 bg-black/20 rounded-full blur-[2px] absolute bottom-1 left-1/2 -translate-x-1/2 group-hover:scale-75 group-hover:opacity-50 transition-all" />

                                        {/* Text Card - Positioned relative to pin to match image layout */}
                                        <div className={`
                                            absolute w-48 pointer-events-none group-hover:pointer-events-auto
                                            ${pos.labelPos === 'left' ? 'right-full mr-2 text-right top-0' : ''}
                                            ${pos.labelPos === 'right' ? 'left-full ml-2 text-left top-0' : ''}
                                            ${pos.labelPos === 'top' ? 'bottom-full mb-2 text-center left-1/2 -translate-x-1/2' : ''}
                                            ${pos.labelPos === 'bottom' ? 'top-full mt-2 text-center left-1/2 -translate-x-1/2' : ''}
                                        `}>
                                            <div className="flex items-center gap-1 mb-1 justify-inherit">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || pos.color }} />
                                                <span className="font-bold text-sm uppercase" style={{ color: item.color || pos.color }}>{item.title}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-medium leading-tigher line-clamp-4">
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

            {/* Right Side - Login Form (Stuck to right, white bg) */}
            <div className="w-full lg:w-[40%] bg-white flex flex-col justify-center p-8 lg:p-16 shadow-2xl z-20">
                <div className="max-w-sm mx-auto w-full">
                    {/* Header */}
                    <div className="mb-10 text-left">
                        <div className="w-16 h-16 relative mb-6">
                            <img src="/logo.png" alt="Company Logo" className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 text-gray-900">Welcome Back</h1>
                        <p className="text-gray-500">Please enter your details to sign in.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border-b-2 border-gray-100 px-10 py-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-400"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border-b-2 border-gray-100 px-10 py-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                                <span className="text-xs text-gray-500">Remember me</span>
                            </label>
                            <Link href="#" className="text-xs font-semibold text-black hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white h-12 rounded-lg font-bold text-sm tracking-wide hover:bg-gray-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:shadow-xl active:scale-95 disabled:opacity-70 mt-4"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in to Dashboard"}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                            <span className="bg-white px-2 text-gray-400">Or continue with</span>
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
                        className="w-full bg-white text-gray-900 border-2 border-gray-100 h-12 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        Sign in with GitHub
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-8">
                        Don't have an account? <Link href="/register" className="text-black font-bold hover:underline">Register now</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
