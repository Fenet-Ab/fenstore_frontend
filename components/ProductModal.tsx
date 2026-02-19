"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Loader2, Trash2, Edit2 } from "lucide-react";
import { toast } from "react-toastify";
import DeleteModal from "./DeleteModal";

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

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode: 'create' | 'edit' | 'view';
    material?: Material;
}

export default function ProductModal({
    isOpen,
    onClose,
    onSuccess,
    mode,
    material,
}: ProductModalProps) {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (mode === 'edit' && material) {
                setTitle(material.title);
                setPrice(material.price?.toString() || "");
                setDescription(material.description);
                setCategoryId(material.categoryId);
                setImagePreview(material.imageUrl);
            } else {
                resetForm();
            }
        }
    }, [isOpen, mode, material]);

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

    const resetForm = () => {
        setTitle("");
        setPrice("");
        setDescription("");
        setCategoryId("");
        setImage(null);
        setImagePreview("");
        setError("");
        setLoading(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to manage products');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('price', price);
            formData.append('description', description);
            formData.append('categoryId', categoryId);

            if (image) {
                formData.append('image', image);
            }

            const url = mode === 'edit' && material
                ? `https://fenstore-backend-1.onrender.com/api/material/${material.id}`
                : 'https://fenstore-backend-1.onrender.com/api/material';

            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save product');
            }

            if (mode === 'create') {
                toast.success('Product created successfully');
            } else {
                toast.success('Product updated successfully');
            }

            onSuccess();
            onClose();
            resetForm();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!material) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://fenstore-backend-1.onrender.com/api/material/${material.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            toast.success('Product deleted successfully');
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to delete product');
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-[#161616] border border-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="sticky top-0 bg-[#161616]/95 backdrop-blur border-b border-gray-800 p-6 flex items-center justify-between z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                {mode === 'create' ? 'Add New Product' : mode === 'edit' ? 'Edit Product' : 'Product Details'}
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {mode === 'create' ? 'Fill in the details to add a new product' : 'Update product information'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm flex items-center">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-300">Product Image</label>
                            <div className="relative group/image">
                                {imagePreview ? (
                                    <div className="relative group">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-64 object-cover rounded-2xl border border-gray-800 shadow-lg"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImage(null);
                                                    setImagePreview("");
                                                }}
                                                className="p-3 bg-red-500 hover:bg-red-600 rounded-xl transition-all transform hover:scale-105 shadow-xl"
                                            >
                                                <Trash2 className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-700/50 rounded-2xl hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all cursor-pointer bg-[#0F0F0F] group">
                                        <div className="p-4 rounded-full bg-[#1a1a1a] group-hover:bg-[#D4AF37]/10 transition-colors mb-3">
                                            <Upload className="w-8 h-8 text-gray-500 group-hover:text-[#D4AF37] transition-colors" />
                                        </div>
                                        <p className="font-medium text-gray-300 group-hover:text-[#D4AF37] transition-colors">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">PNG, JPG, WEBP up to 10MB</p>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                            {mode === 'edit' && !image && (
                                <p className="text-xs text-gray-500 ml-1">Leave empty to keep the existing image</p>
                            )}
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-300">Product Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-[#0F0F0F] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-medium"
                                placeholder="e.g. Premium Gold Watch"
                                required
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-300">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-[#0F0F0F] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-medium"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-300">Category</label>
                            <div className="relative">
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full bg-[#0F0F0F] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" style={{ backgroundColor: '#1a1a1a', color: '#6b7280' }}>Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-300">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-[#0F0F0F] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all resize-none leading-relaxed"
                                placeholder="Describe the product features, materials, and benefits..."
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-800 mt-8">
                            {mode === 'edit' && (
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    disabled={loading}
                                    className="flex items-center space-x-2 bg-red-500/10 text-red-500 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500/20 hover:text-red-400 transition-all border border-red-500/20 disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Product</span>
                                </button>
                            )}
                            <div className={`flex space-x-3 ${mode === 'create' ? 'ml-auto' : ''}`}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all border border-gray-800 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black px-8 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-[#D4AF37]/20 hover:translate-y-[-1px] transition-all disabled:opacity-50 active:translate-y-[1px]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>{mode === 'create' ? 'Create Product' : 'Save Changes'}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #333;
              border-radius: 20px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #444;
            }
          `}</style>
            </div>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${material?.title}"? This action cannot be undone.`}
                isLoading={loading}
            />
        </>
    );
}
