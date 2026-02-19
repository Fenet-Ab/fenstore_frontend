import Link from "next/link";
import { Plus as PlusIcon, Loader2, Heart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";
import StarRating from "@/app/components/StarRating/StarRating";
import { toast } from "react-toastify";

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    image: string;
    brand?: string;
    averageRating?: number;
    ratingCount?: number;
}

export default function ProductCard({
    id,
    name,
    price,
    image,
    brand = "FenStore Premium",
    averageRating = 0,
    ratingCount = 0,
}: ProductCardProps) {
    const { addToCart } = useCart();
    const { isLoggedIn } = useAuth();
    const [adding, setAdding] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);

    useEffect(() => {
        // Check if item is liked on mount
        const checkLiked = async () => {
            if (!isLoggedIn) return;
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://127.0.0.1:5000/api/like`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const likes = await res.json();
                    const isLiked = likes.some((l: any) => l.materialId === id);
                    setLiked(isLiked);
                }
            } catch (error) {
                console.error("Error checking like status:", error);
            }
        };
        checkLiked();
    }, [isLoggedIn, id]);

    const handleAddToCart = async () => {
        setAdding(true);
        await addToCart(id);
        setAdding(false);
    };

    const handleToggleLike = async () => {
        if (!isLoggedIn) {
            toast.error("Please login to like products");
            return;
        }

        setLikeLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://127.0.0.1:5000/api/like/${id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setLiked(!liked);
                toast.success(data.message);
            } else {
                toast.error("Failed to update like status");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setLikeLoading(false);
        }
    };

    return (
        <div className="group flex flex-col items-center text-center bg-transparent transition-all duration-500 h-full relative">
            {/* Image Container - Sharp Rectangle Sizing */}
            <div className="relative w-full aspect-[3/4] overflow-hidden mb-6 bg-[#F9F9F9] border border-gray-100/50">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Like Button - Absolute Top Right */}
                <button
                    onClick={handleToggleLike}
                    disabled={likeLoading}
                    className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110 z-20"
                >
                    {likeLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    ) : (
                        <Heart
                            className={`w-5 h-5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
                                }`}
                        />
                    )}
                </button>

                {/* Hover Quick Actions Overlay - Rectangular Buttons */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-[1px]">
                    <button
                        onClick={handleAddToCart}
                        disabled={adding}
                        className="bg-[#1A1A1A] text-white p-4 transition-all duration-500 hover:bg-[#D4AF37] shadow-xl disabled:opacity-50"
                    >
                        {adding ? <Loader2 className="w-6 h-6 animate-spin" /> : <PlusIcon className="w-6 h-6" />}
                    </button>
                    <Link
                        href={`/products/${id}`}
                        className="bg-white text-[#1A1A1A] font-bold text-[10px] uppercase tracking-widest px-8 py-3 shadow-sm transition-all duration-500 hover:bg-[#1A1A1A] hover:text-white"
                    >
                        View Details
                    </Link>
                </div>
            </div>

            {/* Content Section - Minimalist & Rectangular */}
            <div className="space-y-1 w-full px-1 mt-auto">
                <div className="min-h-[2.5rem] flex flex-col justify-center">
                    <h3 className="text-[13px] font-medium text-gray-800 leading-tight">
                        {name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">
                        {brand}
                    </p>
                </div>

                {/* Star Rating */}
                <div className="py-1.5 flex justify-center">
                    <StarRating
                        rating={averageRating}
                        totalRatings={ratingCount}
                        size="sm"
                        showCount={true}
                    />
                </div>

                <p className="text-[14px] font-bold text-[#1A1A1A] mt-2">
                    {price.toLocaleString()} <span className="text-[9px] font-medium text-gray-400">ETB</span>
                </p>
            </div>
        </div>
    );
}
