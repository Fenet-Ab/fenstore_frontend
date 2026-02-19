"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Package, ChevronRight, Calendar, CreditCard, Clock, CheckCircle2, Loader2, ArrowRight, Trash2, X as XIcon, Search, LayoutDashboard } from "lucide-react";
import { toast } from "react-toastify";

// Modern Modal Component
const Modal = ({ isOpen, onClose, onConfirm, title, message, isLoading }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-10 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Trash2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black italic tracking-tight text-[#1A1A1A] mb-4">{title}</h3>
                    <p className="text-gray-500 font-medium mb-10 leading-relaxed">{message}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onClose}
                            className="bg-gray-100 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                        >
                            Retreat
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Expunge"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    material: {
        title: string;
        imageUrl: string;
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

function OrdersList() {
    const { isLoggedIn } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, orderId: "" });
    const [deleting, setDeleting] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");

    const fetchOrders = async (search: string = "") => {
        if (!isLoggedIn) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://fenstore-backend-1.onrender.com/api/order/all${search ? `?search=${encodeURIComponent(search)}` : ""}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (!deleteModal.orderId) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://fenstore-backend-1.onrender.com/api/order/${deleteModal.orderId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success("Order removed from history");
                setOrders(orders.filter(o => o.id !== deleteModal.orderId));
                setDeleteModal({ isOpen: false, orderId: "" });
            } else {
                toast.error("Failed to remove order");
            }
        } catch (error) {
            toast.error("Network error while removing order");
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders(searchQuery);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, isLoggedIn]);

    useEffect(() => {
        const verifyId = searchParams.get("verify");

        if (verifyId && !verifying) {
            const verifyPayment = async () => {
                const txRef = searchParams.get("tx_ref");
                setVerifying(true);
                const vToast = toast.loading("Verifying payment...");
                try {
                    const url = txRef
                        ? `https://fenstore-backend-1.onrender.com/api/payment/verify/${verifyId}?tx_ref=${txRef}`
                        : `https://fenstore-backend-1.onrender.com/api/payment/verify/${verifyId}`;

                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.status === "success" || (data.data && data.data.status === "success")) {
                        toast.update(vToast, { render: "Payment verified successfully!", type: "success", isLoading: false, autoClose: 3000 });
                        // Clean up URL
                        router.replace("/orders");
                    } else {
                        toast.update(vToast, { render: "Payment verification failed or pending.", type: "info", isLoading: false, autoClose: 3000 });
                    }
                } catch (error) {
                    console.error("Verification error:", error);
                    toast.update(vToast, { render: "Error verifying payment status.", type: "error", isLoading: false, autoClose: 3000 });
                } finally {
                    setVerifying(false);
                    fetchOrders(searchQuery);
                }
            };
            verifyPayment();
        }
    }, [searchParams, router]);

    const handlePayNow = async (e: React.MouseEvent, order: Order) => {
        e.preventDefault();
        e.stopPropagation();

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
                    toast.update(payToast, { render: "Initialisation failed", type: "error", isLoading: false, autoClose: 3000 });
                }
            } else {
                toast.update(payToast, { render: "Server Error", type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(payToast, { render: "Network Error", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="bg-gray-50 p-12 rounded-[3rem] text-center max-w-md w-full border border-gray-100">
                    <Package className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-[#1A1A1A] mb-4 italic tracking-tighter">Access Your Archives</h1>
                    <p className="text-gray-500 mb-8 font-medium">Please login to view your order history.</p>
                    <Link href="/login" className="block w-full bg-[#1A1A1A] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all mb-4">
                        Login
                    </Link>
                    <Link href="/User" className="flex items-center justify-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors font-black uppercase tracking-widest text-[10px]">
                        <LayoutDashboard className="w-4 h-4" />
                        Return to Dashboard
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

    return (
        <div className="min-h-screen bg-[#FBFBFB] py-12 lg:py-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-6">
                            <Link
                                href="/User"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37]/20 hover:shadow-lg hover:shadow-[#D4AF37]/5 transition-all group/back"
                            >
                                <LayoutDashboard className="w-4 h-4 transition-transform group-hover/back:-translate-x-1" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
                            </Link>
                            <div className="space-y-2">
                                <p className="text-[#D4AF37] text-sm font-black uppercase tracking-[0.3em]">Your Journey</p>
                                <h1 className="text-5xl font-black text-[#1A1A1A] italic tracking-tighter">Order History</h1>
                            </div>
                        </div>
                        <div className="relative group max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by order ID or product name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#D4AF37]/30 focus:ring-4 focus:ring-[#D4AF37]/5 transition-all text-gray-700 shadow-sm"
                            />
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white p-16 rounded-[3rem] text-center border border-gray-100 shadow-sm">
                            <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <p className="text-gray-500 font-medium mb-8">You haven't placed any orders yet.</p>
                            <Link href="/" className="inline-block bg-[#1A1A1A] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all">
                                Begin Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="block bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/20 transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-8">
                                        <div className="space-y-6 flex-1">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <span className="bg-[#1A1A1A] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    Order #{order.id.slice(-6).toUpperCase()}
                                                </span>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-bold uppercase tracking-widest">
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {order.paymentStatus === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {order.paymentStatus || 'PENDING'}
                                                </div>
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.deliveryStatus === 'DELIVERED' ? 'bg-green-50 text-green-600' : order.deliveryStatus === 'SHIPPED' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                                                    }`}>
                                                    <Package className="w-3 h-3" />
                                                    {order.deliveryStatus?.replace("_", " ") || 'NOT DELIVERED'}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex -space-x-4 overflow-hidden">
                                                    {order.items.slice(0, 4).map((item, idx) => (
                                                        <div key={idx} className="w-16 h-16 rounded-2xl bg-[#FBFBFB] border-4 border-white overflow-hidden p-2 shadow-sm">
                                                            <img src={item.material.imageUrl} alt="" className="w-full h-full object-contain" title={item.material.title} />
                                                        </div>
                                                    ))}
                                                    {order.items.length > 4 && (
                                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border-4 border-white flex items-center justify-center text-[10px] font-black text-gray-400">
                                                            +{order.items.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-black text-gray-600 uppercase tracking-widest max-w-xl line-clamp-1">
                                                    {order.items.map(i => i.material.title).join(" • ")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 min-w-[200px]">
                                            <div className="text-right">
                                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Value</p>
                                                <p className="text-2xl font-black text-[#1A1A1A]">{order.totalPrice.toLocaleString()} <span className="text-xs text-[#D4AF37]">ETB</span></p>
                                            </div>

                                            <div className="flex gap-2">
                                                {order.paymentStatus !== 'PAID' && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setDeleteModal({ isOpen: true, orderId: order.id });
                                                            }}
                                                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all group/trash"
                                                            title="Remove Order"
                                                        >
                                                            <Trash2 className="w-4 h-4 transition-transform group-hover/trash:scale-110" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handlePayNow(e, order)}
                                                            className="bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-all flex items-center gap-2"
                                                        >
                                                            Pay Now <ArrowRight className="w-3 h-3" />
                                                        </button>
                                                    </>
                                                )}
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-[#1A1A1A] group-hover:text-white transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, orderId: "" })}
                onConfirm={handleDeleteOrder}
                title="Expunge Order?"
                message="Are you certain you wish to remove this acquisition from your records? This action cannot be reversed."
                isLoading={deleting}
            />
        </div>
    );
}

export default function OrdersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
        }>
            <OrdersList />
        </Suspense>
    );
}
