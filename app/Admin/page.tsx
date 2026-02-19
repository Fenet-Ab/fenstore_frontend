"use client";

import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    BarChart3,
    Settings,
    Bell,
    Search,
    Package,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    ChevronRight,
    Menu,
    X,
    Plus,
    MessageCircle,
    Send,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import ProductModal from "@/components/ProductModal";
import ProductsList from "@/components/ProductsList";
import { toast } from "react-toastify";

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    isOpen?: boolean;
    onClick?: () => void;
}

interface CategoryProgressProps {
    label: string;
    percentage: number;
    color: string;
}

interface MarketShareItem {
    label: string;
    percentage: number;
    color: string;
}

export default function AdminDashboard() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [activeSection, setActiveSection] = useState("dashboard");
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [customersLoading, setCustomersLoading] = useState(false);
    const [marketShare, setMarketShare] = useState<MarketShareItem[]>([]);
    const [marketShareLoading, setMarketShareLoading] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [conversations, setConversations] = useState<any[]>([]);
    const [supportLoading, setSupportLoading] = useState(false);
    const [currentChatUser, setCurrentChatUser] = useState<any>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [adminReply, setAdminReply] = useState("");
    const [isReplying, setIsReplying] = useState(false);
    const router = useRouter();

    const fetchNotifications = async () => {


        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://fenstore-backend-1.onrender.com/api/notification", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://fenstore-backend-1.onrender.com/api/notification/${id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://fenstore-backend-1.onrender.com/api/notification/read-all`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login to access the admin dashboard");
            router.push("/Login");
            return;
        }

        // Initial fetch for stats
        fetchOrders();
        fetchCustomers();
        fetchMarketShare();
        fetchNotifications();

        // Poll for notifications every 10 seconds
        const interval = setInterval(() => {
            const updateNotis = async () => {
                try {
                    const t = localStorage.getItem("token");
                    const res = await fetch("https://fenstore-backend-1.onrender.com/api/notification", {
                        headers: { Authorization: `Bearer ${t}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        // If we have more unread notifications than before, show a toast
                        setNotifications(prev => {
                            const prevUnread = prev.filter(n => !n.isRead).length;
                            const nextUnread = data.filter((n: any) => !n.isRead).length;
                            if (nextUnread > prevUnread) {
                                toast.info("🚨 New incoming order or alert!");
                            }
                            return data;
                        });
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                }
            };
            updateNotis();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleProductSuccess = () => {
        console.log('Product operation successful');
    };

    const fetchMarketShare = async () => {
        setMarketShareLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://fenstore-backend-1.onrender.com/api/order/admin/market-share", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMarketShare(data);
            } else {
                const errorText = await res.text();
                console.error(`Failed to fetch market share: ${res.status} ${res.statusText}`, errorText);
            }
        } catch (error) {
            console.error("Error fetching market share:", error);
        } finally {
            setMarketShareLoading(false);
        }
    };

    const fetchCustomers = async (search: string = "") => {
        setCustomersLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://fenstore-backend-1.onrender.com/api/profile/all${search ? `?search=${encodeURIComponent(search)}` : ""}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
            } else if (res.status === 401 || res.status === 403) {
                toast.error("Authentication failed. Please login again.");
                localStorage.removeItem("token");
                router.push("/Login");
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to fetch clients");
            }
        } catch (error) {
            toast.error("Unable to connect to server. Please check if backend is running.");
            console.error("Error fetching customers:", error);
        } finally {
            setCustomersLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders(searchQuery);
            fetchCustomers(searchQuery);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchOrders = async (search: string = "") => {
        setOrdersLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://fenstore-backend-1.onrender.com/api/order/admin/all${search ? `?search=${encodeURIComponent(search)}` : ""}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            } else if (res.status === 401 || res.status === 403) {
                toast.error("Authentication failed. Please login again.");
                localStorage.removeItem("token");
                router.push("/Login");
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to fetch orders");
            }
        } catch (error) {
            toast.error("Unable to connect to server. Please check if backend is running.");
            console.error("Error fetching orders:", error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const updateDeliveryStatus = async (orderId: string, status: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://fenstore-backend-1.onrender.com/api/order/delivery/${orderId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, deliveryStatus: status } : o));
                toast.success(`Order status updated to ${status.replace("_", " ")}`);
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Network error");
            console.error("Error updating status:", error);
        }
    };

    const fetchConversations = async () => {
        setSupportLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://fenstore-backend-1.onrender.com/api/support/admin/conversations", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setSupportLoading(false);
        }
    };

    const fetchChatMessages = async (userId: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://fenstore-backend-1.onrender.com/api/support/admin/messages/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setChatMessages(data);
            }
        } catch (error) {
            console.error("Error fetching chat messages:", error);
        }
    };

    const handleAdminReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminReply.trim() || !currentChatUser) return;

        setIsReplying(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://fenstore-backend-1.onrender.com/api/support/admin/reply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: currentChatUser.id,
                    message: adminReply
                })
            });

            if (res.ok) {
                const data = await res.json();
                setChatMessages([...chatMessages, data]);
                setAdminReply("");
            }
        } catch (error) {
            console.error("Error sending reply:", error);
        } finally {
            setIsReplying(false);
        }
    };

    // Calculate total revenue from paid orders
    const totalRevenue = orders
        .filter(o => o.paymentStatus === "PAID")
        .reduce((sum, order) => sum + order.totalPrice, 0);

    const stats = [
        {
            title: "Total Revenue",
            value: `ETB ${totalRevenue.toLocaleString()}`,
            change: "+20.1%",
            isPositive: true,
            icon: <TrendingUp className="w-5 h-5 text-[#D4AF37]" />,
        },
        {
            title: "Active Orders",
            value: orders.filter(o => o.deliveryStatus !== "DELIVERED").length.toString(),
            change: "+12.5%",
            isPositive: true,
            icon: <Package className="w-5 h-5 text-[#D4AF37]" />,
        },
        {
            title: "Total Customers",
            value: customers.length.toString(),
            change: "+18.2%",
            isPositive: true,
            icon: <Users className="w-5 h-5 text-[#D4AF37]" />,
        },

    ];


    // Helper function to format relative time
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    // Get recent paid orders (latest 5)
    const recentPaidOrders = orders
        .filter(order => order.paymentStatus === "PAID")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className="flex h-screen bg-[#0F0F0F] text-gray-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? "w-64" : "w-20"
                    } bg-[#161616] border-r border-gray-800 transition-all duration-300 flex flex-col z-20`}
            >
                <div className="p-6 flex items-center justify-between">
                    <div className={`flex items-center space-x-3 ${!isSidebarOpen && "hidden"}`}>
                        <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold text-xl">F</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">FenStore</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-400"
                    >
                        {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <SidebarItem
                        icon={<LayoutDashboard className="w-5 h-5" />}
                        label="Dashboard"
                        active={activeSection === "dashboard"}
                        isOpen={isSidebarOpen}
                        onClick={() => setActiveSection("dashboard")}
                    />
                    <SidebarItem
                        icon={<ShoppingBag className="w-5 h-5" />}
                        label="Products"
                        active={activeSection === "products"}
                        isOpen={isSidebarOpen}
                        onClick={() => setActiveSection("products")}
                    />
                    <SidebarItem
                        icon={<Package className="w-5 h-5" />}
                        label="Orders"
                        active={activeSection === "orders"}
                        isOpen={isSidebarOpen}
                        onClick={() => {
                            setActiveSection("orders");
                            fetchOrders();
                        }}
                    />
                    <SidebarItem
                        icon={<Users className="w-5 h-5" />}
                        label="Customers"
                        active={activeSection === "customers"}
                        isOpen={isSidebarOpen}
                        onClick={() => {
                            setActiveSection("customers");
                            fetchCustomers();
                        }}
                    />
                    <SidebarItem
                        icon={<MessageCircle className="w-5 h-5" />}
                        label="Support"
                        active={activeSection === "support"}
                        isOpen={isSidebarOpen}
                        onClick={() => {
                            setActiveSection("support");
                            fetchConversations();
                        }}
                    />

                    <div className="pt-4 mt-4 border-t border-gray-800">
                        <SidebarItem
                            icon={<Settings className="w-5 h-5" />}
                            label="Account"
                            isOpen={isSidebarOpen}
                            onClick={() => router.push('/Profile')}
                        />
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className={`flex items-center space-x-3 ${!isSidebarOpen && "justify-center"}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFD700] p-0.5">
                            <div className="w-full h-full rounded-full bg-[#161616] flex items-center justify-center">
                                <span className="text-sm font-bold text-[#D4AF37]">AD</span>
                            </div>
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">Admin User</span>
                                <span className="text-xs text-gray-500">Super Admin</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-[#161616] border-b border-gray-800 px-8 flex items-center justify-between">
                    <div className="relative w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search analytics, orders, products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0F0F0F] border border-gray-800 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
                        />
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors relative group"
                            >
                                <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4AF37] rounded-full border-2 border-[#161616] animate-pulse"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-4 w-96 bg-[#161616] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-800 overflow-hidden z-[100] animate-in slide-in-from-top-5 duration-200">
                                    <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-black/20">
                                        <h3 className="text-lg font-bold tracking-tight text-white">System Alerts</h3>
                                        <button
                                            onClick={markAllRead}
                                            className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        {notifications.length > 0 ? (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => {
                                                        markAsRead(n.id);
                                                        if (n.link) {
                                                            if (n.type === 'NEW_ORDER') {
                                                                setActiveSection("orders");
                                                                setShowNotifications(false);
                                                            } else {
                                                                router.push(n.link);
                                                            }
                                                        }
                                                    }}
                                                    className={`p-6 border-b border-gray-800/50 hover:bg-white/[0.03] cursor-pointer transition-colors relative group/noti ${!n.isRead ? "bg-[#D4AF37]/5" : ""}`}
                                                >
                                                    {!n.isRead && (
                                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></div>
                                                    )}
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className={`text-sm font-bold ${!n.isRead ? "text-white" : "text-gray-400"}`}>{n.title}</p>
                                                        <span className="text-[9px] font-medium text-gray-500">{getRelativeTime(n.createdAt)}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center">
                                                <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-600">
                                                    <Bell className="w-8 h-8" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-500 italic">No new alerts detected.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-black/20 border-t border-gray-800 text-center">
                                        <button
                                            onClick={() => setShowNotifications(false)}
                                            className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                                        >
                                            Dismiss View
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setIsProductModalOpen(true)}
                            className="flex items-center space-x-2 bg-[#D4AF37] text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#B8860B] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#D4AF37]/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Product</span>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[#0A0A0A]">

                    {activeSection === "dashboard" && (
                        <>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight text-white">Command Center</h1>
                                    <p className="text-gray-400 mt-2 text-lg">Your business at a glance.</p>
                                </div>
                                <div className="flex space-x-4">

                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className="bg-[#161616] p-7 rounded-3xl border border-gray-800/50 hover:border-[#D4AF37]/30 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            {React.isValidElement(stat.icon) && React.cloneElement(stat.icon as React.ReactElement<any>, { className: "w-16 h-16" })}
                                        </div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="p-3 bg-[#0F0F0F] rounded-2xl group-hover:bg-[#D4AF37]/10 transition-colors border border-gray-800">
                                                {stat.icon}
                                            </div>
                                            <button className="text-gray-600 hover:text-gray-400 transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 font-medium text-sm tracking-wide uppercase">{stat.title}</span>
                                            <div className="flex items-end justify-between mt-2">
                                                <span className="text-3xl font-bold text-white">{stat.value}</span>
                                                <div
                                                    className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-lg ${stat.isPositive
                                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                        }`}
                                                >
                                                    {stat.isPositive ? (
                                                        <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                                                    ) : (
                                                        <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
                                                    )}
                                                    {stat.change}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                                {/* Recent Orders */}
                                <div className="lg:col-span-2 bg-[#161616] rounded-3xl border border-gray-800/50 overflow-hidden flex flex-col shadow-2xl">
                                    <div className="p-7 border-b border-gray-800 flex items-center justify-between bg-[#161616]/50 backdrop-blur-sm">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                                            <p className="text-sm text-gray-500 mt-1">Updates on your latest sales</p>
                                        </div>
                                        <button className="text-[#D4AF37] text-sm font-bold hover:text-[#B8860B] transition-colors flex items-center group" onClick={() => setActiveSection("orders")}>
                                            View Repository <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-gray-500 text-xs uppercase tracking-[0.1em] border-b border-gray-800/50">
                                                    <th className="px-8 py-5 font-bold">Order ID</th>
                                                    <th className="px-8 py-5 font-bold">Customer</th>
                                                    <th className="px-8 py-5 font-bold">Items</th>
                                                    <th className="px-8 py-5 font-bold">Amount</th>
                                                    <th className="px-8 py-5 font-bold text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800/30">
                                                {ordersLoading ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-8 py-12 text-center">
                                                            <div className="flex flex-col items-center justify-center">
                                                                <div className="w-8 h-8 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-3"></div>
                                                                <p className="text-gray-500 text-sm">Loading transactions...</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : recentPaidOrders.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                                                            No recent paid orders found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    recentPaidOrders
                                                        .map((order: any) => (
                                                            <tr
                                                                key={order.id}
                                                                className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                                                            >
                                                                <td className="px-8 py-5 text-sm font-mono text-gray-400">
                                                                    #{order.id.slice(-6).toUpperCase()}
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/5 flex items-center justify-center text-xs font-bold text-[#D4AF37] border border-[#D4AF37]/20">
                                                                            {order.user.name[0].toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-200">{order.user.name}</p>
                                                                            <p className="text-xs text-gray-500">{getRelativeTime(order.createdAt)}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex -space-x-2">
                                                                            {order.items.slice(0, 3).map((item: any, itemIdx: number) => (
                                                                                <div
                                                                                    key={itemIdx}
                                                                                    className="w-6 h-6 rounded-md bg-[#0F0F0F] border-2 border-[#161616] overflow-hidden"
                                                                                    title={item.material.title}
                                                                                >
                                                                                    <img
                                                                                        src={item.material.imageUrl}
                                                                                        alt=""
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <span className="text-xs text-gray-500 font-medium">
                                                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <span className="text-sm font-bold text-[#D4AF37]">
                                                                        {order.totalPrice.toLocaleString()} ETB
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-5 text-sm text-right">
                                                                    <span
                                                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${order.deliveryStatus === "DELIVERED"
                                                                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                                            : order.deliveryStatus === "SHIPPED"
                                                                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                                                            }`}
                                                                    >
                                                                        {order.deliveryStatus.replace("_", " ")}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Sidebar Cards */}
                                <div className="space-y-8">
                                    <div className="bg-[#161616] rounded-3xl border border-gray-800/50 p-7 shadow-2xl">
                                        <h2 className="text-xl font-extrabold text-white mb-8 tracking-tight">Market Share</h2>
                                        <div className="space-y-7">
                                            {marketShareLoading ? (
                                                <div className="flex flex-col items-center justify-center py-10">
                                                    <div className="w-8 h-8 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-3"></div>
                                                    <p className="text-gray-500 text-sm">Loading market share...</p>
                                                </div>
                                            ) : marketShare.length === 0 ? (
                                                <p className="text-gray-500 text-sm text-center py-8">No market data available yet.</p>
                                            ) : (
                                                marketShare.map((item, index) => (
                                                    <CategoryProgress key={index} label={item.label} percentage={item.percentage} color={item.color} />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeSection === "products" && (
                        <div className="pb-12">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-4xl font-black italic tracking-tighter text-white">Elite Products</h1>
                                    <p className="text-gray-400 mt-2">Manage your luxury catalog.</p>
                                </div>
                                <button
                                    onClick={() => setIsProductModalOpen(true)}
                                    className="bg-[#D4AF37] text-black px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#B8860B] transition-all transform hover:scale-105"
                                >
                                    Create Item
                                </button>
                            </div>
                            <ProductsList searchQuery={searchQuery} />
                        </div>
                    )}

                    {activeSection === "orders" && (
                        <div className="pb-12">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-4xl font-black italic tracking-tighter text-white">Acquisition Archives</h1>
                                    <p className="text-gray-400 mt-2">Oversee all client transactions and logistics.</p>
                                </div>
                                <button
                                    onClick={() => fetchOrders()}
                                    className="bg-[#161616] text-[#D4AF37] border border-[#D4AF37]/20 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all"
                                >
                                    Refresh Feed
                                </button>
                            </div>

                            <div className="bg-[#161616] rounded-[2.5rem] border border-gray-800/50 overflow-hidden shadow-2xl">
                                {ordersLoading ? (
                                    <div className="p-20 flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
                                        <p className="text-[#D4AF37] font-black italic animate-pulse tracking-widest text-xs uppercase">Deciphering Records...</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-gray-800/50 bg-[#1A1A1A]/50">
                                                    <th className="px-8 py-6 font-black">Order ID</th>
                                                    <th className="px-8 py-6 font-black">Customer</th>
                                                    <th className="px-8 py-6 font-black">Acquisitions</th>
                                                    <th className="px-8 py-6 font-black">Value</th>
                                                    <th className="px-8 py-6 font-black">Payment</th>
                                                    <th className="px-8 py-6 font-black">Logistics</th>
                                                    <th className="px-8 py-6 font-black">Address</th>
                                                    <th className="px-8 py-6 font-black text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800/30">
                                                {orders
                                                    .map((order: any) => (
                                                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                                            <td className="px-8 py-6">
                                                                <span className="font-mono text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                                                                    #{order.id.slice(-6).toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-black text-xs border border-[#D4AF37]/20">
                                                                        {order.user.name[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-gray-200">{order.user.name}</p>
                                                                        <p className="text-[10px] text-gray-500 font-medium">{order.user.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="space-y-2">
                                                                    <div className="flex -space-x-3">
                                                                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                                                                            <div key={idx} className="w-8 h-8 rounded-lg bg-[#0F0F0F] border-2 border-[#161616] overflow-hidden" title={item.material.title}>
                                                                                <img src={item.material.imageUrl} alt="" className="w-full h-full object-cover" />
                                                                            </div>
                                                                        ))}
                                                                        {order.items.length > 3 && (
                                                                            <div className="w-8 h-8 rounded-lg bg-gray-800 border-2 border-[#161616] flex items-center justify-center text-[8px] font-black text-gray-400">
                                                                                +{order.items.length - 3}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {order.items.map((item: any, iIdx: number) => (
                                                                            <div key={iIdx} className="flex flex-col">
                                                                                <p className="text-[10px] font-bold text-gray-200 uppercase tracking-tighter">
                                                                                    {item.quantity}x {item.material.title}
                                                                                </p>
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {item.selectedSize && (
                                                                                        <span className="text-[8px] bg-gray-800 px-1 rounded text-gray-400">S: {item.selectedSize}</span>
                                                                                    )}
                                                                                    {item.selectedStorage && (
                                                                                        <span className="text-[8px] bg-gray-800 px-1 rounded text-gray-400">T: {item.selectedStorage}</span>
                                                                                    )}
                                                                                    {item.selectedColor && (
                                                                                        <span className="text-[8px] bg-gray-800 px-1 rounded text-gray-400">C: {item.selectedColor}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <p className="text-sm font-black text-[#D4AF37]">{order.totalPrice.toLocaleString()} ETB</p>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${order.paymentStatus === "PAID" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
                                                                    {order.paymentStatus}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${order.deliveryStatus === "DELIVERED" ? "bg-green-500/10 text-green-400" : order.deliveryStatus === "NOT_DELIVERED" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}>
                                                                    {order.deliveryStatus.replace("_", " ")}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <p className="text-[10px] font-bold text-gray-400 max-w-[150px] truncate group-hover:whitespace-normal group-hover:line-clamp-none" title={order.shippingAddress}>
                                                                    {order.shippingAddress || "Not Provided"}
                                                                </p>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {order.deliveryStatus === "NOT_DELIVERED" && (
                                                                        <button
                                                                            onClick={() => updateDeliveryStatus(order.id, "SHIPPED")}
                                                                            className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                                                                        >
                                                                            Ship
                                                                        </button>
                                                                    )}
                                                                    {order.deliveryStatus === "SHIPPED" && (
                                                                        <button
                                                                            onClick={() => updateDeliveryStatus(order.id, "DELIVERED")}
                                                                            className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
                                                                        >
                                                                            Deliver
                                                                        </button>
                                                                    )}
                                                                    <button className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-[#D4AF37] transition-colors">
                                                                        <ChevronRight className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === "customers" && (
                        <div className="pb-12">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-4xl font-black italic tracking-tighter text-white">Customer Directory</h1>
                                    <p className="text-gray-400 mt-2">Manage your elite client base.</p>
                                </div>
                                <button
                                    onClick={() => fetchCustomers()}
                                    className="bg-[#161616] text-[#D4AF37] border border-[#D4AF37]/20 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all"
                                >
                                    Refresh List
                                </button>
                            </div>

                            <div className="bg-[#161616] rounded-[2.5rem] border border-gray-800/50 overflow-hidden shadow-2xl">
                                {customersLoading ? (
                                    <div className="p-20 flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
                                        <p className="text-[#D4AF37] font-black italic animate-pulse tracking-widest text-xs uppercase">Retrieving Clients...</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-gray-800/50 bg-[#1A1A1A]/50">
                                                    <th className="px-8 py-6 font-black">Client</th>
                                                    <th className="px-8 py-6 font-black">Status</th>
                                                    <th className="px-8 py-6 font-black">Role</th>
                                                    <th className="px-8 py-6 font-black">Member Since</th>
                                                    <th className="px-8 py-6 font-black text-right">Identifier</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800/30">
                                                {customers
                                                    .map((customer: any) => (
                                                        <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/5 flex items-center justify-center text-[#D4AF37] font-black text-sm border border-[#D4AF37]/20">
                                                                        {customer.name[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-gray-200">{customer.name}</p>
                                                                        <p className="text-xs text-gray-500">{customer.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</span>
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${customer.role === "ADMIN" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
                                                                    {customer.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <p className="text-xs text-gray-500 font-medium">{new Date(customer.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <span className="font-mono text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors">
                                                                    {customer.id.slice(0, 8).toUpperCase()}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                {customers.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-medium">
                                                            {searchQuery ? `No clients found matching "${searchQuery}"` : "No registered clients found."}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === "support" && (
                        <div className="pb-12 space-y-8">
                            <div>
                                <h1 className="text-4xl font-black italic tracking-tighter text-white">Concierge Desk</h1>
                                <p className="text-gray-400 mt-2">Manage live inquiries and curated assistance.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                                {/* Conversation List */}
                                <div className="bg-[#161616] rounded-[2.5rem] border border-gray-800/50 overflow-hidden flex flex-col shadow-2xl">
                                    <div className="p-6 border-b border-gray-800 bg-[#1A1A1A]/50">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">Active Channels</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        {supportLoading ? (
                                            <div className="flex justify-center py-10">
                                                <Loader2 className="animate-spin text-[#D4AF37]" />
                                            </div>
                                        ) : conversations.length === 0 ? (
                                            <div className="p-10 text-center text-gray-500 italic text-sm">No active inquiries.</div>
                                        ) : (
                                            conversations.map((conv) => (
                                                <div
                                                    key={conv.userId}
                                                    onClick={() => {
                                                        setCurrentChatUser(conv.user);
                                                        fetchChatMessages(conv.userId);
                                                    }}
                                                    className={`p-6 border-b border-gray-800/50 cursor-pointer transition-all hover:bg-white/[0.03] ${currentChatUser?.id === conv.userId ? 'bg-[#D4AF37]/10 border-l-4 border-l-[#D4AF37]' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-[#D4AF37] font-black">
                                                            {conv.user.name[0]}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-200 truncate">{conv.user.name}</p>
                                                            <p className="text-[10px] text-gray-500 truncate">{conv.message}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Chat Window */}
                                <div className="lg:col-span-2 bg-[#161616] rounded-[2.5rem] border border-gray-800/50 overflow-hidden flex flex-col shadow-2xl relative">
                                    {currentChatUser ? (
                                        <>
                                            {/* Chat Header */}
                                            <div className="p-6 border-b border-gray-800 bg-[#1A1A1A]/50 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-black font-black">
                                                        {currentChatUser.name[0]}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-white">{currentChatUser.name}</h3>
                                                        <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">Live Client</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Message Feed */}
                                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/10 custom-scrollbar">
                                                {chatMessages.map((m, idx) => (
                                                    <div key={idx} className={`flex ${m.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[70%] p-4 rounded-2xl text-xs font-bold ${m.isAdmin
                                                            ? 'bg-[#D4AF37] text-black rounded-br-none shadow-lg'
                                                            : 'bg-[#1A1A1A] border border-gray-800 text-white rounded-bl-none'
                                                            }`}>
                                                            {m.message}
                                                            <p className={`text-[8px] mt-1 opacity-50 ${m.isAdmin ? 'text-black' : 'text-gray-400'}`}>
                                                                {new Date(m.createdAt).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Input Bar */}
                                            <form onSubmit={handleAdminReply} className="p-6 bg-[#1A1A1A]/50 border-t border-gray-800 flex gap-3">
                                                <input
                                                    type="text"
                                                    value={adminReply}
                                                    onChange={(e) => setAdminReply(e.target.value)}
                                                    placeholder="Draft your response..."
                                                    className="flex-1 bg-[#0F0F0F] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]/30 transition-all text-white"
                                                />
                                                <button
                                                    disabled={isReplying || !adminReply.trim()}
                                                    className="bg-[#D4AF37] text-black p-3 rounded-xl hover:bg-white transition-all disabled:opacity-50 shadow-lg"
                                                >
                                                    {isReplying ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                </button>
                                            </form>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-6">
                                            <div className="w-20 h-20 bg-gray-900 rounded-[2rem] flex items-center justify-center text-gray-700">
                                                <MessageCircle size={40} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-300">Select an Inquiry</h3>
                                                <p className="text-sm text-gray-500 max-w-xs mt-2">Choose a client from the list to begin providing luxury assistance.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Product Modal */}
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSuccess={handleProductSuccess}
                mode="create"
            />

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a1a1a;
          border-radius: 20px;
          border: 2px solid #0a0a0a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2a2a2a;
        }
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>
        </div>
    );
}

function SidebarItem({ icon, label, active = false, isOpen = true, onClick }: SidebarItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${active
                ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                : "text-gray-500 hover:bg-gray-800/50 hover:text-gray-200"
                }`}
        >
            <div className={`${active ? "text-black" : "group-hover:text-[#D4AF37] transition-colors"}`}>
                {icon}
            </div>
            {isOpen && (
                <span className="text-sm font-bold tracking-tight">{label}</span>
            )}
            {active && isOpen && (
                <div className="absolute right-4 w-1.5 h-1.5 bg-black rounded-full"></div>
            )}
        </button>
    );
}

function CategoryProgress({ label, percentage, color }: CategoryProgressProps) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
                <span className="text-sm font-black text-white">{percentage}%</span>
            </div>
            <div className="h-2.5 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 20px ${color}30`,
                    }}
                ></div>
            </div>
        </div>
    );
}