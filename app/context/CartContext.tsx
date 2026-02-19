"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

interface CartItem {
    id: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    selectedStorage?: string;
    material: {
        id: string;
        title: string;
        price: number;
        imageUrl: string;
        category?: {
            name: string;
        };
    };
}

interface CartContextType {
    cart: { items: CartItem[] } | null;
    loading: boolean;
    addToCart: (materialId: string, options?: { selectedSize?: string, selectedColor?: string, selectedStorage?: string }) => Promise<void>;
    removeFromCart: (materialId: string, options?: { selectedSize?: string, selectedColor?: string, selectedStorage?: string }) => Promise<void>;
    deleteFromCart: (materialId: string, options?: { selectedSize?: string, selectedColor?: string, selectedStorage?: string }) => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = "https://fenstore-backend-1.onrender.com/api";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cart, setCart] = useState<{ items: CartItem[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const { isLoggedIn } = useAuth();

    const refreshCart = async () => {
        const token = localStorage.getItem("token");
        if (!isLoggedIn || !token) {
            setCart(null);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const text = await response.text();
                // Safely parse JSON or return null if body is empty
                const data = text ? JSON.parse(text) : null;
                setCart(data);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshCart();
    }, [isLoggedIn]);

    const addToCart = async (materialId: string, options?: { selectedSize?: string, selectedColor?: string, selectedStorage?: string }) => {
        if (!isLoggedIn) {
            toast.info("Please login to add items to cart");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ materialId, ...options }),
            });

            if (response.ok) {
                toast.success("Added to cart");
                await refreshCart();
            } else {
                toast.error("Failed to add to cart");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Network error. Please check your connection.");
        }
    };

    const removeFromCart = async (materialId: string, options?: { selectedSize?: string, selectedColor?: string, selectedStorage?: string }) => {
        if (!isLoggedIn) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/cart/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ materialId, ...options }),
            });

            if (response.ok) {
                await refreshCart();
            }
        } catch (error) {
            console.error("Error removing from cart:", error);
            toast.error("Failed to update cart");
        }
    };

    const deleteFromCart = async (materialId: string, options?: { selectedSize?: string, selectedColor?: string, selectedStorage?: string }) => {
        if (!isLoggedIn) return;
        const loadingToast = toast.loading("Removing item...");
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/cart/delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ materialId, ...options }),
            });

            if (response.ok) {
                toast.update(loadingToast, { render: "Item removed", type: "success", isLoading: false, autoClose: 2000 });
                await refreshCart();
            } else {
                toast.update(loadingToast, { render: "Failed to remove item", type: "error", isLoading: false, autoClose: 2000 });
            }
        } catch (error) {
            console.error("Error deleting from cart:", error);
            toast.update(loadingToast, { render: "Network error. Try again later.", type: "error", isLoading: false, autoClose: 2000 });
        }
    };

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, deleteFromCart, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
