"use client";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function CartPage() {
    const { cart, loading, addToCart, removeFromCart, deleteFromCart } = useCart();
    const { isLoggedIn } = useAuth();
    const [checkingOut, setCheckingOut] = useState(false);
    const [shippingAddress, setShippingAddress] = useState("");
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
    const router = useRouter();

    const fetchLoyaltyPoints = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await fetch("http://127.0.0.1:5000/api/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLoyaltyPoints(data.loyaltyPoints || 0);
            }
        } catch (error) {
            console.error("Error fetching loyalty points:", error);
        }
    };

    useEffect(() => {
        fetchLoyaltyPoints();
    }, []);

    const subtotal = cart?.items.reduce((acc, item) => acc + (item.material.price * item.quantity), 0) || 0;
    const discount = useLoyaltyPoints ? Math.min(subtotal, loyaltyPoints) : 0;
    const totalPrice = subtotal - discount;

    const handleCheckout = async () => {
        if (!cart || cart.items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        if (!shippingAddress.trim()) {
            toast.error("Please provide a shipping address");
            return;
        }

        setCheckingOut(true);
        const checkoutToast = toast.loading("Processing checkout...");
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:5000/api/order/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ shippingAddress, useLoyaltyPoints }),
            });

            if (response.ok) {
                const order = await response.json();
                toast.update(checkoutToast, { render: "Order created! Initializing payment...", isLoading: true });

                // Initialize payment
                const userEmail = localStorage.getItem("email");
                const paymentResponse = await fetch("http://127.0.0.1:5000/api/payment/initialize", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        order: order,
                        user: { email: userEmail || "customer@fenstore.com" }
                    }),
                });

                if (paymentResponse.ok) {
                    const paymentData = await paymentResponse.json();
                    if (paymentData.status === "success" && paymentData.data.checkout_url) {
                        toast.update(checkoutToast, { render: "Redirecting to payment...", type: "success", isLoading: false, autoClose: 1000 });
                        setTimeout(() => {
                            window.location.href = paymentData.data.checkout_url;
                        }, 1000);
                    } else {
                        toast.update(checkoutToast, { render: `Payment error: ${paymentData.message || "Failed"}`, type: "error", isLoading: false, autoClose: 3000 });
                    }
                } else {
                    const errorData = await paymentResponse.json();
                    toast.update(checkoutToast, { render: `Payment initialization failed: ${errorData.message || "Error"}`, type: "error", isLoading: false, autoClose: 3000 });
                }
            } else {
                const errorData = await response.json();
                toast.update(checkoutToast, { render: `Checkout failed: ${errorData.message || "Check your cart"}`, type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.update(checkoutToast, { render: "An unexpected network error occurred.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setCheckingOut(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="bg-gray-50 p-12 rounded-[3rem] text-center max-w-md w-full border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <ShoppingBag className="w-10 h-10 text-[#D4AF37]" />
                    </div>
                    <h1 className="text-3xl font-black text-[#1A1A1A] mb-4 italic italic tracking-tighter">Your Sanctuary is Empty</h1>
                    <p className="text-gray-500 mb-8 font-medium">Please login to access your curated collection.</p>
                    <Link
                        href="/login"
                        className="block w-full bg-[#1A1A1A] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-xl"
                    >
                        Login to FenStore
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="bg-gray-50 p-12 rounded-[3rem] text-center max-w-md w-full border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                    </div>
                    <h1 className="text-3xl font-black text-[#1A1A1A] mb-4 italic italic tracking-tighter">Empty Collection</h1>
                    <p className="text-gray-500 mb-8 font-medium">Your shopping cart is currently empty. Discover our latest arrivals.</p>
                    <Link
                        href="/"
                        className="block w-full bg-[#1A1A1A] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-xl"
                    >
                        Explore Collection
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBFBFB] py-12 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-6 w-full">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-4xl font-black text-[#1A1A1A] italic tracking-tighter">Shopping Sanctuary</h1>
                            <span className="bg-white px-4 py-2 rounded-full border border-gray-100 text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] shadow-sm">
                                {cart.items.length} Items
                            </span>
                        </div>

                        <div className="space-y-4">
                            {cart.items.map((item) => (
                                <div key={item.id} className="bg-white p-6 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6 border border-gray-50 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="w-32 h-40 bg-[#FBFBFB] rounded-2xl overflow-hidden flex-shrink-0 border border-transparent group-hover:border-gray-100 transition-colors">
                                        <img
                                            src={item.material.imageUrl}
                                            alt={item.material.title}
                                            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2 text-center sm:text-left">
                                        <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">{item.material.category?.name || 'Exclusive'}</p>
                                        <h3 className="text-xl font-black text-[#1A1A1A]">{item.material.title}</h3>
                                        <p className="text-lg font-bold text-gray-900">{item.material.price.toLocaleString()} <span className="text-xs text-[#D4AF37]">ETB</span></p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                        <button
                                            onClick={() => removeFromCart(item.material.id)}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:shadow-sm transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center font-black text-[#1A1A1A]">{item.quantity}</span>
                                        <button
                                            onClick={() => addToCart(item.material.id)}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:shadow-sm transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => deleteFromCart(item.material.id)}
                                        className="p-4 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="w-full lg:w-96 sticky top-8">
                        <div className="bg-[#1A1A1A] p-8 rounded-[3rem] text-white shadow-2xl space-y-8">
                            <h2 className="text-2xl font-black italic tracking-tighter">Order Summary</h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">Delivery Sanctuary</label>
                                    <select
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:ring-4 focus:ring-[#D4AF37]/5 transition-all cursor-pointer"
                                    >
                                        <option value="" className="bg-[#1A1A1A]">Select your delivery coordinates...</option>
                                        <optgroup label="Addis Ababa Districts" className="bg-[#1A1A1A] text-[#D4AF37] font-black italic">
                                            <option value="Bole, Addis Ababa" className="bg-[#1A1A1A]">Bole</option>
                                            <option value="Sarbet, Addis Ababa" className="bg-[#1A1A1A]">Sarbet</option>
                                            <option value="Piassa, Addis Ababa" className="bg-[#1A1A1A]">Piassa</option>
                                            <option value="Kazanchis, Addis Ababa" className="bg-[#1A1A1A]">Kazanchis</option>
                                            <option value="CMC, Addis Ababa" className="bg-[#1A1A1A]">CMC</option>
                                            <option value="Ayat, Addis Ababa" className="bg-[#1A1A1A]">Ayat</option>
                                            <option value="4 Kilo, Addis Ababa" className="bg-[#1A1A1A]">4 Kilo</option>
                                            <option value="Old Airport, Addis Ababa" className="bg-[#1A1A1A]">Old Airport</option>
                                            <option value="Lebu, Addis Ababa" className="bg-[#1A1A1A]">Lebu</option>
                                            <option value="Jemo, Addis Ababa" className="bg-[#1A1A1A]">Jemo</option>
                                            <option value="Megenagna, Addis Ababa" className="bg-[#1A1A1A]">Megenagna</option>
                                            <option value="Gerji, Addis Ababa" className="bg-[#1A1A1A]">Gerji</option>
                                        </optgroup>
                                        <optgroup label="Regional Cities" className="bg-[#1A1A1A] text-[#D4AF37] font-black italic">
                                            <option value="Adama (Nazret)" className="bg-[#1A1A1A]">Adama (Nazret)</option>
                                            <option value="Bahir Dar" className="bg-[#1A1A1A]">Bahir Bar</option>
                                            <option value="Hawassa" className="bg-[#1A1A1A]">Hawassa</option>
                                            <option value="Dire Dawa" className="bg-[#1A1A1A]">Dire Dawa</option>
                                            <option value="Bishoftu (Debre Zeyit)" className="bg-[#1A1A1A]">Bishoftu</option>
                                            <option value="Gondar" className="bg-[#1A1A1A]">Gondar</option>
                                            <option value="Mekelle" className="bg-[#1A1A1A]">Mekelle</option>
                                            <option value="Jimma" className="bg-[#1A1A1A]">Jimma</option>
                                        </optgroup>
                                    </select>
                                </div>

                                <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                    <span>Subtotal</span>
                                    <span>{subtotal.toLocaleString()} ETB</span>
                                </div>

                                {loyaltyPoints >= 10 && (
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></div>
                                                <span className="text-xs font-bold text-gray-300">Apply Loyalty Discount</span>
                                            </div>
                                            <button
                                                onClick={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
                                                className={`w-10 h-5 rounded-full transition-all relative ${useLoyaltyPoints ? 'bg-[#D4AF37]' : 'bg-white/10'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useLoyaltyPoints ? 'left-6' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                            You have {loyaltyPoints} points available ({loyaltyPoints} ETB discount)
                                        </p>
                                    </div>
                                )}

                                {useLoyaltyPoints && discount > 0 && (
                                    <div className="flex justify-between text-[#D4AF37] font-bold uppercase text-[10px] tracking-widest">
                                        <span>Loyalty Discount</span>
                                        <span>-{discount.toLocaleString()} ETB</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                    <span>Shipping</span>
                                    <span className="text-[#D4AF37]">Free</span>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                    <div>
                                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Total Amount</p>
                                        <p className="text-3xl font-black">{totalPrice.toLocaleString()} <span className="text-sm font-bold text-[#D4AF37]">ETB</span></p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={checkingOut}
                                className="w-full bg-[#D4AF37] text-[#1A1A1A] py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {checkingOut ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Secure Checkout
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <div className="space-y-4 pt-4">
                                <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-[0.2em]">Secure Payments Powered by Chapa</p>
                                <div className="flex justify-center gap-4 opacity-30 grayscale contrast-125">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
