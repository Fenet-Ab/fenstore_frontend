"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Calendar, CreditCard, Clock, ChevronLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    material: {
        id: string;
        title: string;
        imageUrl: string;
        price: number;
    };
}

interface Order {
    id: string;
    totalPrice: number;
    paymentStatus: string;
    deliveryStatus: string;
    createdAt: string;
    items: OrderItem[];
}

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!isLoggedIn || !id) return;
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`https://fenstore-backend-1.onrender.com/api/order/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrder(data);
                } else {
                    toast.error("Order not found");
                    router.push("/orders");
                }
            } catch (error) {
                console.error("Error fetching order:", error);
                toast.error("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [isLoggedIn, id, router]);

    const handlePay = async () => {
        if (!order) return;
        setPaying(true);
        const payToast = toast.loading("Initializing payment...");
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("https://fenstore-backend-1.onrender.com/api/payment/initialize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    order: order,
                    user: { email: localStorage.getItem("email") || "customer@fenstore.com" }
                }),
            });

            if (response.ok) {
                const paymentData = await response.json();
                if (paymentData.status === "success" && paymentData.data.checkout_url) {
                    toast.update(payToast, { render: "Redirecting to Chapa...", type: "success", isLoading: false, autoClose: 1000 });
                    setTimeout(() => {
                        window.location.href = paymentData.data.checkout_url;
                    }, 1000);
                } else {
                    toast.update(payToast, { render: "Payment initialization failed", type: "error", isLoading: false, autoClose: 3000 });
                }
            } else {
                toast.update(payToast, { render: "Server error during payment setup", type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.update(payToast, { render: "Network error", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-[#FBFBFB] py-12 lg:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    <Link href="/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] font-bold uppercase text-[10px] tracking-[0.2em] transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        Back to History
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black text-[#1A1A1A] italic tracking-tighter">Order Summary</h1>
                                <span className="bg-[#1A1A1A] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    #{order.id.slice(-6).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    {order.paymentStatus === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {order.paymentStatus || 'PENDING'}
                                </div>
                            </div>
                        </div>

                        {order.paymentStatus !== 'PAID' && (
                            <button
                                onClick={handlePay}
                                disabled={paying}
                                className="bg-[#D4AF37] text-[#1A1A1A] px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#1A1A1A] hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
                            >
                                {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay Now <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-50 flex gap-6 items-center shadow-sm">
                                    <div className="w-24 h-24 bg-[#FBFBFB] rounded-2xl p-2 flex-shrink-0">
                                        <img src={item.material.imageUrl} alt={item.material.title} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-[#1A1A1A] text-lg">{item.material.title}</h3>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-[#1A1A1A]">{item.price.toLocaleString()} ETB</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-6">
                            <div className="bg-[#1A1A1A] p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
                                <h3 className="text-xl font-black italic tracking-tighter">Financial Detail</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span>{order.totalPrice.toLocaleString()} ETB</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                        <span>Shipping</span>
                                        <span className="text-[#D4AF37]">Free</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                        <div>
                                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Grand Total</p>
                                            <p className="text-3xl font-black">{order.totalPrice.toLocaleString()} <span className="text-xs text-[#D4AF37]">ETB</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Delivery Status</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></div>
                                    <p className="font-black text-[#1A1A1A] uppercase text-xs tracking-widest">{order.deliveryStatus.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
