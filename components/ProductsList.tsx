"use client";

import React, { useState, useEffect } from "react";
import { Edit2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductModal from "./ProductModal";

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
    categoryId: string;
    category?: Category;
    createdAt?: string;
}

interface ProductsListProps {
    searchQuery?: string;
}

export default function ProductsList({ searchQuery = "" }: ProductsListProps) {
    const router = useRouter();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | undefined>();
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    useEffect(() => {
        const filtered = materials.filter(m =>
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const sorted = [...filtered].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        setRecentMaterials(sorted.slice(0, 4));
    }, [searchQuery, materials]);

    const fetchMaterials = async () => {
        try {
            const response = await fetch('https://fenstore-backend-1.onrender.com/api/material');
            if (response.ok) {
                const data = await response.json();
                setMaterials(data);
            }
        } catch (err) {
            console.error('Failed to fetch materials:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (material: Material) => {
        setSelectedMaterial(material);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        fetchMaterials();
    };

    if (loading) {
        return (
            <div className="bg-[#161616] rounded-3xl border border-gray-800/50 p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-400">Loading products...</div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-[#161616] rounded-3xl border border-gray-800/50 overflow-hidden shadow-2xl">
                <div className="p-7 border-b border-gray-800 flex items-center justify-between bg-[#161616]/50 backdrop-blur-sm">
                    <div>
                        <h2 className="text-xl font-bold text-white">Recent Products</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Showing {recentMaterials.length} of {materials.length} products
                        </p>
                    </div>
                    {materials.length > 4 && (
                        <button
                            onClick={() => router.push('/products')}
                            className="text-[#D4AF37] text-sm font-bold hover:text-[#B8860B] transition-colors flex items-center group"
                        >
                            View All Products
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>

                {recentMaterials.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-500 mb-4">No products found</div>
                        <p className="text-sm text-gray-600">Click "New Product" to add your first product</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-7">
                        {recentMaterials.map((material) => (
                            <div
                                key={material.id}
                                className="bg-[#0F0F0F] rounded-2xl border border-gray-800 overflow-hidden hover:border-[#D4AF37]/40 transition-all group"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={material.imageUrl}
                                        alt={material.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(material)}
                                            className="p-2 bg-[#D4AF37] hover:bg-[#B8860B] rounded-lg transition-colors shadow-lg"
                                        >
                                            <Edit2 className="w-4 h-4 text-black" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-white font-bold text-lg line-clamp-1">{material.title}</h3>
                                        {material.category && (
                                            <span className="text-xs px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg border border-[#D4AF37]/20 whitespace-nowrap ml-2">
                                                {material.category.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{material.description}</p>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xl font-bold text-white">
                                            ETB {typeof material.price === 'number' ? material.price.toLocaleString() : '0.00'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                        <span className="text-xs text-gray-600">
                                            {material.createdAt ? new Date(material.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                        <button
                                            onClick={() => handleEdit(material)}
                                            className="text-[#D4AF37] text-xs font-bold hover:text-[#B8860B] transition-colors flex items-center space-x-1"
                                        >
                                            <span>Edit</span>
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMaterial(undefined);
                }}
                onSuccess={handleSuccess}
                mode={modalMode}
                material={selectedMaterial}
            />
        </>
    );
}
