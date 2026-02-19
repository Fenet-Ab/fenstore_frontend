"use client";

import React, { useEffect, useState } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import { Search } from 'lucide-react';

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

const Clothes = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const response = await fetch('https://fenstore-backend-1.onrender.com/api/material');
                const data = await response.json();

                // Filter for Clothing category
                const clothing = data.filter((item: Material) => {
                    const catName = item.category?.name?.toLowerCase();
                    return catName === 'clothing' || catName === 'clothes';
                });

                setMaterials(clothing);
                setFilteredMaterials(clothing);
            } catch (error) {
                console.error('Error fetching materials:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    useEffect(() => {
        const filtered = materials.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMaterials(filtered);
    }, [searchQuery, materials]);

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-20">
            {/* Header / Hero Section for the Category */}
            <div className="relative bg-[#1A1A1A] text-white py-20 px-4 mb-12">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="w-12 h-1 bg-[#D4AF37] rounded-full"></span>
                        <span className="text-sm font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                            Example of Elegance
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
                        Clothing Collection
                    </h1>
                    <p className="text-gray-400 max-w-2xl text-lg font-light">
                        Explore our exclusive line of premium apparel.
                        Timeless designs crafted with the finest materials for the modern individual.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="absolute -bottom-8 left-0 w-full px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="relative max-w-md bg-white shadow-2xl rounded-sm flex items-center p-2 border border-gray-100">
                            <Search className="w-5 h-5 text-gray-400 ml-3" />
                            <input
                                type="text"
                                placeholder="Search clothing..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-20">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
                    </div>
                ) : filteredMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredMaterials.map((material) => (
                            <ProductCard
                                key={material.id}
                                id={material.id}
                                name={material.title}
                                price={material.price}
                                image={material.imageUrl}
                                averageRating={material.averageRating || 0}
                                ratingCount={material.ratingCount || 0}
                                sizes={material.sizes}
                                colors={material.colors}
                                storages={material.storages}
                                category={material.category}
                                brand="FenStore Fashion"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No clothing items found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Clothes