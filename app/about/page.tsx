"use client";

import React from "react";
import Link from "next/link";
import {
    Award,
    Gem,
    Gift,
    ShieldCheck,
    Zap,
    Users,
    Star,
    ArrowRight
} from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-white text-[#1A1A1A] overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex items-center justify-center bg-[#0F0F0F] text-white py-20 px-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#161616] via-[#0F0F0F] to-[#252525]"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto text-center space-y-8">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.3em]">Redefining Luxury</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 uppercase">
                        WHERE ELEGANCE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#B8860B]">MEETS INNOVATION</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        FenStore is more than a marketplace; it's a curated experience designed for those who demand the extraordinary.
                    </p>
                </div>
            </section>

            {/* Our Essence Section */}
            <section className="py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight">Our Philosophy</h2>
                            <p className="text-gray-600 text-lg leading-relaxed font-medium">
                                Launched with a vision to revolutionize the digital shopping landscape, FenStore curates products that embody quality, craftsmanship, and timeless style. From the latest electronics to bespoke clothing, every item in our collection passes through a rigorous selection process.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-4xl md:text-5xl font-black text-[#D4AF37]">50k+</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Clients</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-4xl md:text-5xl font-black text-[#D4AF37]">12+</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Global Partners</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-gray-100 group shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                                alt="Store Experience"
                                className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-1000"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Loyalty & Rewards Section */}
            <section className="py-24 px-4 bg-[#FBFBFB] border-y border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">FenStore Elite</p>
                        <h2 className="text-4xl md:text-6xl font-black text-[#1A1A1A] tracking-tight">THE CIRCLE OF LOYALTY</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto font-medium">Being a FenStore client is an investment. We reward your trust with unparalleled benefits.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Elite Reward 1 */}
                        <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37] mb-8 group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500">
                                <Gem className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 group-hover:text-[#D4AF37] transition-colors uppercase">Tiered Prestige</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                Level up from Bronze to Obsidian. Each tier unlocks deeper discounts, early access to collections, and personal styling sessions.
                            </p>
                        </div>

                        {/* Elite Reward 2 */}
                        <div className="bg-[#1A1A1A] p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-3xl"></div>
                            <div className="w-16 h-16 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-black mb-8 group-hover:scale-110 transition-transform relative z-10">
                                <Gift className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 relative z-10 text-white uppercase">Infinite Points</h3>
                            <p className="text-gray-400 leading-relaxed font-medium relative z-10">
                                Earn 5 points for every 100 ETB spent. Redeem points for instant discounts, free express shipping, or exclusive brand gift cards.
                            </p>
                            <div className="absolute bottom-[-20px] right-[-20px] opacity-5">
                                <Gift className="w-32 h-32" />
                            </div>
                        </div>

                        {/* Elite Reward 3 */}
                        <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37] mb-8 group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500">
                                <Award className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 group-hover:text-[#D4AF37] transition-colors uppercase">VIP Events</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                Receive invitations to private showroom events, virtual tech unveils, and limited-edition product drops before the public.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Offer - Features */}
            <section className="py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { icon: <ShieldCheck />, title: "Authenticity", desc: "100% genuine products directly from global manufacturers." },
                            { icon: <Zap />, title: "Express Flow", desc: "Dedicated logistics for priority ultra-fast delivery." },
                            { icon: <Users />, title: "24/7 Support", desc: "Expert human assistance for every inquiry you have." },
                            { icon: <Star />, title: "Curated Edits", desc: "Only the finest selection of premium items for you." }
                        ].map((feature, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-4 group">
                                <div className="text-gray-300 group-hover:text-[#D4AF37] transition-colors duration-500">
                                    {React.cloneElement(feature.icon as React.ReactElement, { className: "w-10 h-10" })}
                                </div>
                                <h4 className="text-lg font-black uppercase tracking-widest">{feature.title}</h4>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[200px]">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-32 px-4 bg-white">
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-[#1A1A1A] to-[#0a0a0a] rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.3)]">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#D4AF37]/5 blur-[120px] rounded-full"></div>

                    <div className="relative z-10 space-y-10">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-2">
                            <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Join the Collection</span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                            READY TO JOIN THE <span className="text-[#D4AF37]">ELITE?</span>
                        </h2>
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                            Experience the future of luxury commerce today. Create an account and unlock your first reward instantly.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                            <Link href="/register" className="px-12 py-5 bg-[#D4AF37] text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all duration-500 shadow-2xl shadow-[#D4AF37]/30">
                                Begin Your Journey
                            </Link>
                            <Link href="/" className="px-12 py-5 bg-white/5 text-white border border-white/10 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all duration-500 flex items-center gap-3">
                                Explore Store <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
