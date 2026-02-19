"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Filter,
    Download,
    ArrowLeft,
    Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ProductModal from "@/components/ProductModal";
import DeleteModal from "@/components/DeleteModal";

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

export default function ProductsPage() {
    const router = useRouter();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | undefined>();
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchMaterials();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterMaterials();
    }, [searchQuery, selectedCategory, materials]);

    const fetchMaterials = async () => {
        try {
            const response = await fetch('https://fenstore-backend-1.onrender.com/api/material');
            if (response.ok) {
                const data = await response.json();
                setMaterials(data);
                setFilteredMaterials(data);
            }
        } catch (err) {
            console.error('Failed to fetch materials:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('https://fenstore-backend-1.onrender.com/api/category');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const filterMaterials = () => {
        let filtered = materials;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (material) =>
                    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    material.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter((material) => material.categoryId === selectedCategory);
        }

        setFilteredMaterials(filtered);
    };

    const handleEdit = (material: Material) => {
        setSelectedMaterial(material);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDeleteClick = (material: Material) => {
        setMaterialToDelete(material);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!materialToDelete) return;

        setDeleteLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://fenstore-backend-1.onrender.com/api/material/${materialToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchMaterials();
                setIsDeleteModalOpen(false);
                setMaterialToDelete(null);
            }
        } catch (err) {
            console.error('Failed to delete material:', err);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleSuccess = () => {
        fetchMaterials();
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-gray-100">
            {/* Header */}
            <div className="bg-[#161616] border-b border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/Admin')}
                                className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-400" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Products Management</h1>
                                <p className="text-gray-400 mt-1">
                                    Manage your product inventory ({filteredMaterials.length} products)
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedMaterial(undefined);
                                setModalMode('create');
                                setIsModalOpen(true);
                            }}
                            className="flex items-center space-x-2 bg-[#D4AF37] text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#B8860B] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#D4AF37]/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Product</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-8 py-6">
                <div className="bg-[#161616] rounded-2xl border border-gray-800 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search products by name, description, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0F0F0F] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-[#0F0F0F] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all appearance-none"
                            >
                                <option value="" style={{ backgroundColor: '#1a1a1a', color: '#9ca3af' }}>All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="max-w-7xl mx-auto px-8 pb-12">
                <div className="bg-[#161616] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading products...</div>
                    ) : filteredMaterials.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-gray-500 mb-4">
                                {searchQuery || selectedCategory ? 'No products match your filters' : 'No products found'}
                            </div>
                            <p className="text-sm text-gray-600">
                                {searchQuery || selectedCategory
                                    ? 'Try adjusting your search or filters'
                                    : 'Click "New Product" to add your first product'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#0F0F0F] border-b border-gray-800">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredMaterials.map((material) => (
                                        <tr
                                            key={material.id}
                                            className="hover:bg-[#0F0F0F] transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                                                        <img
                                                            src={material.imageUrl}
                                                            alt={material.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-bold">{material.title}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {material.category && (
                                                    <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-xs font-bold border border-[#D4AF37]/20">
                                                        {material.category.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-white font-medium">
                                                    ${typeof material.price === 'number' ? material.price.toFixed(2) : '0.00'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-400 text-sm line-clamp-2 max-w-md">
                                                    {material.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-500 text-sm">
                                                    {material.createdAt
                                                        ? new Date(material.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(material)}
                                                        className="p-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(material)}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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

            {/* Product Modal */}
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

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${materialToDelete?.title}"? This action cannot be undone.`}
                isLoading={deleteLoading}
            />
        </div>
    );
}
