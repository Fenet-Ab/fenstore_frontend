"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon, ArrowLeft, ShieldCheck, Truck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import StarRating from "../../components/StarRating/StarRating";
import { toast } from "react-toastify";

interface Category {
    id: string;
    name: string;
}

interface Material {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    category: Category;
    createdAt: string;
    averageRating?: number;
    ratingCount?: number;
    sizes?: string[];
    colors?: string[];
    storages?: string[];
}

interface RatingStats {
    averageRating: number;
    totalRatings: number;
    distribution: Record<string, number>;
}

export default function ProductDetail() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Material | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [adding, setAdding] = useState(false);

    // Rating states
    const [userRating, setUserRating] = useState<number>(0);
    const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
    const [isRating, setIsRating] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false); // Success state
    const [ratingComment, setRatingComment] = useState("");

    // Variant states
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedStorage, setSelectedStorage] = useState<string>("");

    const fetchProductData = async () => {
        try {
            if (!params.id) return;

            // Fetch product details
            const response = await fetch(`https://fenstore-backend-1.onrender.com/api/material/${params.id}`);
            if (!response.ok) throw new Error('Product not found');
            const data = await response.json();
            setProduct(data);

            // Fetch rating stats
            const statsRes = await fetch(`https://fenstore-backend-1.onrender.com/api/rating/material/${params.id}/stats`);
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setRatingStats(statsData);
            }

            // Fetch user's existing rating if logged in
            const token = localStorage.getItem('token');
            if (token) {
                const myRatingRes = await fetch(`https://fenstore-backend-1.onrender.com/api/rating/my/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (myRatingRes.ok) {
                    const text = await myRatingRes.text();
                    const myRatingData = text ? JSON.parse(text) : null;

                    if (myRatingData) {
                        setUserRating(myRatingData.value);
                        setRatingComment(myRatingData.comment || "");
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductData();
    }, [params.id]);

    const handleAddToCart = async () => {
        if (!product) return;

        // Validation
        if (product.sizes?.length && !selectedSize) {
            toast.warning("Please select a size");
            return;
        }
        if (product.storages?.length && !selectedStorage) {
            toast.warning("Please select storage capacity");
            return;
        }

        setAdding(true);
        await addToCart(product.id, {
            selectedSize,
            selectedColor,
            selectedStorage
        });
        setAdding(false);
    };

    const handleSubmitReview = async () => {
        if (userRating === 0) {
            toast.warning("Please select a star rating");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.info("Please login to rate products");
            // Assuming Login page is at /login based on directory structure
            router.push("/login");
            return;
        }

        setIsRating(true);
        try {
            const response = await fetch(`https://fenstore-backend-1.onrender.com/api/rating/${params.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    value: userRating,
                    comment: ratingComment
                })
            });

            if (response.ok) {
                setIsSubmitted(true); // Show success overlay
                toast.success("Review submitted successfully!");
                // Refresh stats to show updated average immediately
                fetchProductData();
            } else {
                toast.error("Failed to submit review");
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            toast.error("Error submitting rating");
        } finally {
            setIsRating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex flex-col justify-center items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
                <Link href="/" className="text-[#D4AF37] hover:underline">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#D4AF37] transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Collection
                </Link>

                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    {/* Image Section */}
                    <div className="relative aspect-[3/4] bg-[#FBFBFB] rounded-[3rem] overflow-hidden group border border-gray-50">
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-contain p-8 lg:p-16 transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute top-8 left-8">
                            <span className="bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full">
                                Premium Quality
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col h-full py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-[#D4AF37] text-sm font-black uppercase tracking-[0.3em]">
                                    {product.category?.name || 'FenStore Exclusive'}
                                </p>
                                <h1 className="text-4xl lg:text-5xl font-black text-[#1A1A1A] leading-tight italic tracking-tighter">
                                    {product.title}
                                </h1>
                            </div>

                            {/* Average Rating Display */}
                            <div className="flex items-center gap-4">
                                <StarRating
                                    rating={ratingStats?.averageRating || 0}
                                    totalRatings={ratingStats?.totalRatings || 0}
                                    size="md"
                                    showCount={true}
                                />
                                {product.createdAt && (
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-4 border-l border-gray-200">
                                        Added {new Date(product.createdAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            <p className="text-3xl font-black text-[#1A1A1A] mt-6">
                                {product.price.toLocaleString()} <span className="text-sm font-bold text-[#D4AF37]">ETB</span>
                            </p>

                            <p className="text-gray-500 leading-relaxed text-lg pt-4">
                                {product.description}
                            </p>

                            {/* Variant Selectors */}
                            <div className="space-y-6 pt-8">
                                {/* Size Selector - clothes/shoes */}
                                {product.sizes && product.sizes.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-black uppercase tracking-widest text-[#1A1A1A]">Select Size</label>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size Guide</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {product.sizes.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`min-w-[3.5rem] h-12 flex items-center justify-center rounded-xl font-bold transition-all border-2 ${selectedSize === size
                                                            ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                                                            : "border-gray-100 text-gray-400 hover:border-[#D4AF37]"
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Storage Selector - electronics */}
                                {product.storages && product.storages.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-black uppercase tracking-widest text-[#1A1A1A]">Select Storage</label>
                                        <div className="flex flex-wrap gap-2">
                                            {product.storages.map((storage) => (
                                                <button
                                                    key={storage}
                                                    onClick={() => setSelectedStorage(storage)}
                                                    className={`px-6 h-12 flex items-center justify-center rounded-xl font-bold transition-all border-2 ${selectedStorage === storage
                                                            ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                                                            : "border-gray-100 text-gray-400 hover:border-[#D4AF37]"
                                                        }`}
                                                >
                                                    {storage}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Color Selector - any */}
                                {product.colors && product.colors.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-black uppercase tracking-widest text-[#1A1A1A]">Select Color</label>
                                        <div className="flex flex-wrap gap-3">
                                            {product.colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    title={color}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all p-0.5 border-2 ${selectedColor === color
                                                            ? "border-[#D4AF37]"
                                                            : "border-transparent"
                                                        }`}
                                                >
                                                    {/* If it's a valid hex color, show it, otherwise just a generic circle */}
                                                    <div
                                                        className="w-full h-full rounded-full border border-gray-100"
                                                        style={{ backgroundColor: color.startsWith('#') ? color : 'transparent' }}
                                                    >
                                                        {!color.startsWith('#') && (
                                                            <span className="text-[8px] font-black uppercase flex items-center justify-center h-full text-gray-500">{color.slice(0, 2)}</span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Options */}
                        <div className="mt-12 space-y-8">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={adding}
                                    className="flex-1 bg-[#1A1A1A] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all transform active:scale-95 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {adding ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <PlusIcon className="w-5 h-5" />
                                    )}
                                    {adding ? 'Adding...' : 'Add to Cart'}
                                </button>
                                <button className="px-8 py-5 border-2 border-gray-100 rounded-2xl font-black uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                                    Custom Order
                                </button>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:text-[#D4AF37]">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Fast Delivery</p>
                                        <p className="text-xs text-gray-400">Within 24 hours</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Secure Payment</p>
                                        <p className="text-xs text-gray-400">100% Protection</p>
                                    </div>
                                </div>
                            </div>

                            {/* Rate This Product Section */}
                            <div className="pt-8 border-t border-gray-100">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] mb-4">
                                    {userRating > 0 ? 'Your Review' : 'Rate this Product'}
                                </h3>
                                <div className={`relative p-6 rounded-2xl bg-[#FAFAFA] border border-gray-100 transition-all ${isRating ? 'opacity-70 pointer-events-none' : ''}`}>

                                    {/* Success Overlay */}
                                    {isSubmitted && (
                                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl animate-in fade-in duration-300">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                                <ShieldCheck className="w-6 h-6 text-green-600" />
                                            </div>
                                            <p className="text-[#1A1A1A] font-bold text-sm">Thanks for reviewing!</p>
                                            <button
                                                onClick={() => setIsSubmitted(false)}
                                                className="mt-4 text-xs font-bold text-[#D4AF37] hover:underline"
                                            >
                                                Edit Review
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <span className="text-sm font-bold text-gray-700">How would you rate it?</span>
                                            <StarRating
                                                rating={userRating}
                                                size="lg"
                                                showCount={false}
                                                readOnly={false}
                                                onChange={(val) => setUserRating(val)}
                                                className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm"
                                            />
                                        </div>

                                        <div className="relative">
                                            <textarea
                                                value={ratingComment}
                                                onChange={(e) => setRatingComment(e.target.value)}
                                                placeholder="Tell us what you liked (or didn't)..."
                                                className="w-full p-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 resize-none h-32 transition-all shadow-sm"
                                            />
                                            <div className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-300 pointer-events-none uppercase tracking-wider">
                                                {ratingComment.length} chars
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSubmitReview}
                                            disabled={isRating || userRating === 0}
                                            className="w-full py-4 bg-[#1A1A1A] text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 group"
                                        >
                                            {isRating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Posting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{userRating > 0 ? 'Update Review' : 'Submit Review'}</span>
                                                    <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
