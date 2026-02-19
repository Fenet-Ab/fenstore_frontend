import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Send, ArrowRight } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#FAFAFA] text-gray-500 pt-24 pb-12 relative overflow-hidden border-t border-gray-200">
            {/* Background Accent - Subtle Gold Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 pb-16 border-b border-gray-200">

                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-8">
                        <div>
                            <Link href="/" className="inline-block py-2">
                                <img
                                    src="/logo.png"
                                    alt="FenStore Logo"
                                    className="h-12 w-auto object-contain transition-all duration-300 hover:scale-105 filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.1)]"
                                />
                            </Link>
                            <p className="mt-6 text-sm leading-relaxed max-w-sm text-gray-500">
                                Redefining the modern shopping experience in Ethiopia.
                                Curating the finest electronics and boutique fashion for
                                those who appreciate quality and style.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                                <a
                                    key={idx}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-white transition-all duration-300 shadow-sm"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="lg:col-span-4 grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Shop</h3>
                            <ul className="space-y-4 text-sm">
                                {["Electronics", "Clothing", "Shoes", "Accessories"].map((item) => (
                                    <li key={item}>
                                        <Link href={`/category/${item.toLowerCase()}`} className="hover:text-[#D4AF37] transition-colors">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Support</h3>
                            <ul className="space-y-4 text-sm">
                                {["Track Order", "Custom Order", "Privacy Policy", "Terms of Service"].map((item) => (
                                    <li key={item}>
                                        <Link href="#" className="hover:text-[#D4AF37] transition-colors">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter & Contact */}
                    <div className="lg:col-span-4 space-y-10">


                        

                        <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Address</h3>
                        <div className="space-y-3 pt-4">

                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <MapPin size={16} className="text-[#D4AF37]" />
                                <span>Addis Ababa, Ethiopia</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone size={16} className="text-[#D4AF37]" />
                                <span>+251 911412529</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    <p>© {new Date().getFullYear()} FenStore. Designed with excellence.</p>
                    <div className="flex items-center gap-8">
                        <Link href="#" className="hover:text-[#1A1A1A] transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-[#1A1A1A] transition-colors">Cookies</Link>
                        <Link href="#" className="hover:text-[#1A1A1A] transition-colors">Security</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}


