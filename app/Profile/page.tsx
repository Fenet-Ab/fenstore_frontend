"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Calendar, Shield, Edit2, LogOut, Save, X, Trash2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// Define Profile Interface
interface Profile {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    isDanger?: boolean;
}

function Modal({ isOpen, onClose, onConfirm, title, message, confirmText, isDanger = false }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 border border-gray-100 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${isDanger ? 'bg-red-500' : 'bg-[#D4AF37]'}`}></div>
                <div className="text-center pt-4">
                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${isDanger ? 'bg-red-50 text-red-500' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                        {isDanger ? (
                            <AlertTriangle className="w-10 h-10" />
                        ) : (
                            <Shield className="w-10 h-10" />
                        )}
                    </div>
                    <h3 className="text-3xl font-black text-[#1A1A1A] mb-3 tracking-tight">{title}</h3>
                    <p className="text-gray-500 font-medium mb-10 leading-relaxed px-4">{message}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl border-2 border-gray-100 font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${isDanger ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-[#0F0F0F] hover:bg-[#D4AF37] hover:text-black shadow-gray-200'}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "" });

    // Modal States
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Fetch Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const response = await axios.get("http://127.0.0.1:5000/api/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(response.data);
                setFormData({ name: response.data.name, email: response.data.email });
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    // Update Logic
    const initUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setShowUpdateModal(true);
    };

    const confirmUpdate = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await axios.put("http://127.0.0.1:5000/api/profile", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(prev => ({ ...prev!, ...formData }));
            setIsEditing(false);
            setShowUpdateModal(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Update failed", error);
            setShowUpdateModal(false);
            toast.error("Failed to update profile");
        }
    };

    // Delete Logic
    const initDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await axios.delete("http://127.0.0.1:5000/api/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowDeleteModal(false);
            toast.success("Account deleted successfully");
            logout();
        } catch (error) {
            console.error("Delete failed", error);
            setShowDeleteModal(false);
            toast.error("Failed to delete account");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <ToastContainer position="top-right" theme="colored" />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center text-gray-500 hover:text-[#D4AF37] transition-colors group"
                >
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 mr-3 group-hover:border-[#D4AF37]/30 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-bold">Back to Dashboard</span>
                </button>

                {/* Profile Header Card */}
                <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden mb-10 relative">
                    <div className="h-48 bg-[#0F0F0F] relative">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
                    </div>

                    <div className="px-10 pb-10 relative -mt-20">
                        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
                            <div className="flex items-end gap-6">
                                <div className="w-40 h-40 bg-white p-1.5 rounded-[2.5rem] shadow-2xl relative group">
                                    <div className="w-full h-full bg-gradient-to-tr from-[#D4AF37] to-[#FFD700] rounded-[2rem] flex items-center justify-center text-5xl font-black text-black shadow-inner">
                                        {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                                    </div>
                                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                                </div>
                                <div className="mb-4">
                                    <h1 className="text-4xl font-black tracking-tight text-gray-900">{profile?.name}</h1>
                                    <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                                        <Shield className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                                        Gold Member
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mb-4 w-full md:w-auto">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 md:flex-none px-6 py-3 bg-[#0F0F0F] text-white rounded-2xl font-bold shadow-lg hover:bg-[#D4AF37] hover:text-black transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 md:flex-none px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Security Column */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[#D4AF37]" />
                                Security
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Account ID</p>
                                    <p className="text-sm font-mono font-bold text-black mt-1 truncate">{profile?.id}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Joined On</p>
                                    <p className="text-sm font-bold text-black mt-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#D4AF37]/10 p-8 rounded-[2.5rem] border border-[#D4AF37]/20">
                            <h3 className="text-lg font-black text-[#D4AF37] mb-2">Need Help?</h3>
                            <p className="text-sm text-gray-600 mb-4 font-medium">Contact our premium support for assistance with your account.</p>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
                                className="w-full py-3 bg-[#D4AF37] text-white font-bold rounded-xl hover:bg-[#B8860B] transition-colors shadow-md"
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/40">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black tracking-tight">Personal Details</h2>
                                {isEditing && <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full uppercase tracking-wider">Editing Mode</span>}
                            </div>

                            <form onSubmit={initUpdate} className="space-y-6">
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#D4AF37] transition-colors">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-black font-semibold focus:outline-none focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#D4AF37] transition-colors">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-black font-semibold focus:outline-none focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-8 py-4 bg-[#D4AF37] text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:bg-[#B8860B] hover:translate-y-[-2px] transition-all flex items-center gap-2"
                                        >
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50 p-10 rounded-[3rem] border border-red-100">
                            <h3 className="text-xl font-black text-red-600 mb-2">Danger Zone</h3>
                            <p className="text-red-400/80 font-medium mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                            <button
                                onClick={initDelete}
                                className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-black hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete Account Permanently
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <Modal
                    isOpen={showUpdateModal}
                    onClose={() => setShowUpdateModal(false)}
                    onConfirm={confirmUpdate}
                    title="Update Profile"
                    message="Are you sure you want to update your profile information? This will reflect across your entire account."
                    confirmText="Yes, Update"
                />

                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    title="Delete Account"
                    message="This action is irreversible. All your data, including order history and rewards, will be permanently removed. Are you sure?"
                    confirmText="Yes, Delete Account"
                    isDanger={true}
                />
            </div>
        </div>
    );
}