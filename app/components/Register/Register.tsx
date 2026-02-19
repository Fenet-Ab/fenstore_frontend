"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/app/context/AuthContext';

interface RegisterProps {
  initialIsLogin?: boolean;
}

const Register = ({ initialIsLogin = true }: RegisterProps) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const router = useRouter();
  const { login } = useAuth();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit (Signup or Login)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password, // Don't trim password
    };

    try {
      if (isLogin) {
        // ---- LOGIN ----
        const res = await axios.post("https://fenstore-backend-1.onrender.com/api/auth/login", {
          email: payload.email,
          password: payload.password,
        });

        const { token, role } = res.data;

        if (!token || !role) {
          toast.error("Invalid response from server");
          return;
        }

        // ✅ Save user info & token via context
        login(token, role, res.data.user?.id, res.data.user?.email);

        toast.success("Login successful!");

        // ✅ Redirect based on role
        setTimeout(() => {
          if (role === "admin") {
            router.push("/Admin");

          } else {
            router.push("/User");
          }
        }, 1500);
      } else {
        // ---- SIGNUP ----
        const res = await axios.post("https://fenstore-backend-1.onrender.com/api/auth/register", {
          name: payload.name,
          email: payload.email,
          password: payload.password,
        });

        toast.success("Signup successful! Redirecting to login...");

        // Clear form data and switch to login
        setFormData({ name: "", email: "", password: "" });

        // ⏳ Wait and switch to login view
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      }
    } catch (error: any) {
      console.error("Auth Error:", error.response?.data);
      const errorData = error.response?.data;
      let message = "Something went wrong. Try again.";

      if (errorData) {
        if (typeof errorData.message === 'string') {
          message = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          message = errorData.message.join(', ');
        }
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login/signup forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8 transition-colors duration-500">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Main Container */}
      <div className="relative w-full max-w-[850px] min-h-[500px] md:h-[550px] bg-white rounded-[30px] shadow-2xl overflow-hidden flex flex-col md:block">

        {/* Form Box (Sliding on Desktop) */}
        <div
          className={`w-full md:w-1/2 h-full flex flex-col justify-center items-center p-8 md:p-10 transition-all duration-700 ease-in-out z-20 bg-white ${isLogin ? 'md:translate-x-0' : 'md:translate-x-full'
            }`}
        >
          <form onSubmit={handleSubmit} className="w-full max-w-[320px] flex flex-col items-center">
            <div className="mb-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-[#D4AF37] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 mb-4">
                <span className="text-black font-black text-xl italic">F</span>
              </div>
              <h2 className="text-3xl font-black text-[#1A1A1A] italic tracking-tighter">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
                {isLogin ? 'Login to your boutique' : 'Join our luxury collective'}
              </p>
            </div>

            {/* Name Input (Signup only) */}
            {!isLogin && (
              <div className="relative w-full h-[50px] mb-6 group">
                <span className="absolute right-0 top-3 text-gray-400 text-lg group-focus-within:text-[#D4AF37] transition-colors">
                  <FaUser />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-full bg-transparent border-0 border-b-2 border-gray-200 outline-none text-[#1A1A1A] text-base font-medium py-1 pr-8 peer transition-all focus:border-[#D4AF37]"
                  placeholder=" "
                />
                <label className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-[#D4AF37] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                  Full Name
                </label>
              </div>
            )}

            {/* Email Input */}
            <div className="relative w-full h-[50px] mb-6 group">
              <span className="absolute right-0 top-3 text-gray-400 text-lg group-focus-within:text-[#D4AF37] transition-colors">
                <FaEnvelope />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full h-full bg-transparent border-0 border-b-2 border-gray-200 outline-none text-[#1A1A1A] text-base font-medium py-1 pr-8 peer transition-all focus:border-[#D4AF37]"
                placeholder=" "
              />
              <label className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-[#D4AF37] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                Email Address
              </label>
            </div>

            {/* Password Input */}
            <div className="relative w-full h-[50px] mb-6 group">
              <span className="absolute right-0 top-3 text-gray-400 text-lg cursor-pointer hover:text-[#D4AF37] transition-colors" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>

              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full h-full bg-transparent border-0 border-b-2 border-gray-200 outline-none text-[#1A1A1A] text-base font-medium py-1 pr-16 peer transition-all focus:border-[#D4AF37]"
                placeholder=" "
              />
              <label className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-[#D4AF37] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                Security Key
              </label>
            </div>

            {/* Remember & Forgot (Login only) */}
            {isLogin && (
              <div className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] mb-8">
                <label className="flex items-center cursor-pointer hover:text-[#D4AF37] transition-colors">
                  <input type="checkbox" className="mr-2 accent-[#D4AF37]" /> Remember
                </label>
                <Link href="#" className="hover:text-[#D4AF37] transition-all">
                  Recover Password
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[55px] bg-[#1A1A1A] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl cursor-pointer hover:bg-[#D4AF37] hover:text-black transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
            >
              {loading ? "Authenticating..." : isLogin ? 'Access Account' : 'Initialize Profile'}
            </button>

            {/* Mobile Toggle Text */}
            <div className="md:hidden mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <p>
                {isLogin ? "No registry yet? " : 'Already registered? '}
                <span
                  onClick={toggleForm}
                  className="cursor-pointer text-[#D4AF37] font-black hover:underline ml-1"
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </span>
              </p>
            </div>
          </form>
        </div>

        {/* Info Box (Sliding Overlay) - Hidden on Mobile */}
        <div
          className={`hidden md:flex absolute top-0 w-1/2 h-full bg-[#0F0F0F] flex-col justify-center items-center text-center p-12 z-[30] transition-all duration-700 ease-in-out text-white ${isLogin ? 'left-1/2' : 'left-0'
            }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent pointer-events-none" />

          <h2 className="text-4xl font-black italic tracking-tighter mb-6 leading-tight">
            {isLogin ? 'Luxury Awaits' : 'The Collective'}
          </h2>
          <p className="text-sm font-medium text-gray-400 mb-10 max-w-[280px] leading-relaxed">
            {isLogin
              ? 'Access your curated collection and continue your journey through the finest selections.'
              : 'Join an elite community and gain access to unparalleled craftsmanship and service.'}
          </p>

          <ul className="space-y-5 text-left mb-12">
            <li className="flex items-center text-gray-300 text-xs font-bold uppercase tracking-widest">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mr-4">
                <span className="text-[#D4AF37]">✓</span>
              </div>
              Bespoke Selections
            </li>
            <li className="flex items-center text-gray-300 text-xs font-bold uppercase tracking-widest">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mr-4">
                <span className="text-[#D4AF37]">✓</span>
              </div>
              Priority Fulfillment
            </li>
            <li className="flex items-center text-gray-300 text-xs font-bold uppercase tracking-widest">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mr-4">
                <span className="text-[#D4AF37]">✓</span>
              </div>
              Concierge Assistance
            </li>
          </ul>

          <button
            type="button"
            onClick={toggleForm}
            className="group relative px-10 py-4 overflow-hidden rounded-2xl border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:border-[#D4AF37]"
          >
            <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 group-hover:text-black transition-colors">
              {isLogin ? 'Join Registry' : 'Access Vault'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;