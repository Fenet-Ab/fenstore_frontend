"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X, User, LogOut, Settings, Package } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isLoggedIn, user, logout } = useAuth();
  const { cart } = useCart();

  const cartCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  console.log("Navbar - Cart state:", cart, "Count:", cartCount);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Electronics", href: "/category/electronics" },
    { name: "Clothes", href: "/category/clothes" },
    { name: "Shoes", href: "/category/shoes" },
    { name: "Accessories", href: "/category/accessories" },
  ];

  const handleProfileClick = () => {
    const profilePath = user?.role === "admin" ? "/Admin" : "/User";
    router.push(profilePath);
    setIsProfileOpen(false);
  };

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center py-2">
            <img
              src='/logo.png'
              alt="Logo"
              className="h-12 md:h-16 w-auto object-contain transition-all duration-300 hover:scale-105 filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.3)]"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all duration-200 hover:text-[#D4AF37] relative group ${pathname === link.href ? "text-[#D4AF37]" : "text-gray-600"
                  }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37] transition-all duration-300 ${pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  }`}></span>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-8">

            {/* Cart */}
            <Link href="/cart" className="relative group text-gray-600 hover:text-[#D4AF37] transition-colors">
              <ShoppingCart className="w-6 h-6 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons / Profile */}
            {!isLoggedIn ? (
              <div className="flex items-center space-x-6">
                <Link
                  href="/register"
                  className="bg-[#D4AF37] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#B8860B] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all transform hover:scale-110 active:scale-95 border-2 border-white ring-2 ring-gray-100"
                >
                  <User className="w-6 h-6" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5 truncate capitalize">{user?.role} Mode</p>
                    </div>

                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#D4AF37] transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>

                    <Link
                      href="/orders"
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#D4AF37] transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href={user?.role === "admin" ? "/Admin" : "/User"}
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#D4AF37] transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>

                    <div className="mt-1 pt-1 border-t border-gray-50">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-[#D4AF37] transition-colors p-2 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] border-t border-gray-100" : "max-h-0"
          }`}
      >
        <div className="bg-white px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block text-base font-medium transition-colors ${pathname === link.href ? "text-[#D4AF37]" : "text-gray-600"
                }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100 flex flex-col space-y-4">
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between text-gray-600"
            >
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
              </div>
              {cartCount > 0 && (
                <span className="bg-[#D4AF37] text-white text-xs px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            {!isLoggedIn ? (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#D4AF37] rounded-lg"
                >
                  Register
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href={user?.role === "admin" ? "/Admin" : "/User"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 text-gray-600"
                >
                  <User className="w-5 h-5" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 text-red-500 font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
