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
    category?: { name: string };
    sizes?: string[];
    colors?: string[];
    storages?: string[];
}

export default function ProductCard({
    id,
    name,
    price,
    image,
    brand = "FenStore Premium",
    averageRating = 0,
    ratingCount = 0,
    category,
    sizes,
    colors,
    storages,
}: ProductCardProps) {
    const { addToCart } = useCart();
    const { isLoggedIn } = useAuth();
    const [adding, setAdding] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [showQuickSelect, setShowQuickSelect] = useState(false);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedStorage, setSelectedStorage] = useState("");

    const hasOptions = (sizes?.length ?? 0) > 0 || (colors?.length ?? 0) > 0 || (storages?.length ?? 0) > 0;

    useEffect(() => {
        // Check if item is liked on mount
        const checkLiked = async () => {
            if (!isLoggedIn) return;
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`https://fenstore-backend-1.onrender.com/api/like`, {
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
        if (hasOptions && !showQuickSelect) {
            setShowQuickSelect(true);
            return;
        }

        setAdding(true);
        await addToCart(id, {
            selectedSize,
            selectedColor,
            selectedStorage
        });
        setAdding(false);
        setShowQuickSelect(false);
    };

    const handleToggleLike = async () => {
        if (!isLoggedIn) {
            toast.error("Please login to like products");
            return;
        }

        setLikeLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://fenstore-backend-1.onrender.com/api/like/${id}`, {
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

            {/* Quick Select Modal */}
            {showQuickSelect && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 space-y-6">
                            <div className="text-center space-y-2">
                                <h4 className="text-xl font-black text-[#1A1A1A] uppercase tracking-tighter">Customize Your Order</h4>
                                <p className="text-xs text-gray-500 font-medium">Please select your preferences for <b>{name}</b></p>
                            </div>

                            <div className="space-y-4">
                                {/* Size Selection */}
                                {sizes && sizes.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Size</label>
                                        <div className="flex flex-wrap gap-2">
                                            {sizes.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`px-4 py-2 text-xs font-bold border rounded-xl transition-all ${selectedSize === size
                                                        ? "bg-[#D4AF37] border-[#D4AF37] text-white"
                                                        : "border-gray-200 text-gray-600 hover:border-[#D4AF37]"
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Storage Selection */}
                                {storages && storages.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Storage / RAM</label>
                                        <div className="flex flex-wrap gap-2">
                                            {storages.map((storage) => (
                                                <button
                                                    key={storage}
                                                    onClick={() => setSelectedStorage(storage)}
                                                    className={`px-4 py-2 text-xs font-bold border rounded-xl transition-all ${selectedStorage === storage
                                                        ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                                                        : "border-gray-200 text-gray-600 hover:border-[#1A1A1A]"
                                                        }`}
                                                >
                                                    {storage}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Color Selection */}
                                {colors && colors.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Color</label>
                                        <div className="flex flex-wrap gap-3">
                                            {colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${selectedColor === color ? "border-[#D4AF37]" : "border-transparent"
                                                        }`}
                                                    title={color}
                                                >
                                                    <div
                                                        className="w-full h-full rounded-full border border-gray-100"
                                                        style={{ backgroundColor: color.startsWith('#') ? color : color.toLowerCase() }}
                                                    ></div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowQuickSelect(false)}
                                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={adding || (!!sizes?.length && !selectedSize) || (!!storages?.length && !selectedStorage)}
                                    className="flex-1 bg-[#D4AF37] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#D4AF37]/20 hover:bg-[#B8860B] transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    {adding ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm Add"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
