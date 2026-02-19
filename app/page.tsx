"use client";

import { useEffect, useState } from "react";
import CategorySection from "./components/Category/CategorySection";
import Hero from "./components/Hero/Hero";
import { ChevronDown } from "lucide-react";

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
}

export default function Home() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('https://fenstore-backend-1.onrender.com/api/material');
        const data = await response.json();
        setMaterials(data);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const scrollToContent = () => {
    const content = document.getElementById('featured-sections');
    if (content) {
      content.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({
        top: window.innerHeight * 0.8,
        behavior: 'smooth'
      });
    }
  };

  const getRecentProductsByCategory = (categoryName: string) => {
    return materials
      .filter((item) => {
        const catName = item.category?.name?.toLowerCase();
        const target = categoryName.toLowerCase();
        // specific check for clothes/clothing
        if ((target === 'clothing' || target === 'clothes') && (catName === 'clothing' || catName === 'clothes')) {
          return true;
        }
        return catName === target;
      })
      // Assuming the backend returns them in some order, but let's sort by createdAt desc just in case
      // If createdAt is ISO string
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4)
      .map(item => ({
        id: item.id,
        name: item.title,
        price: item.price,
        image: item.imageUrl,
        brand: `FenStore ${categoryName}`,
        averageRating: item.averageRating || 0,
        ratingCount: item.ratingCount || 0,
      }));
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col pb-32">
      <Hero />

      {/* Scroll Indicator Button */}
      <div className="flex justify-center -mt-16 pb-16 relative z-30">
        <button
          onClick={scrollToContent}
          className="group flex flex-col items-center gap-3 text-gray-400 hover:text-[#D4AF37] transition-all duration-300"
          aria-label="Scroll down"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-70 group-hover:opacity-100">Explore</span>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#D4AF37]/20 scale-125 animate-ping"></div>
            <div className="relative p-2.5 bg-white rounded-full shadow-lg border border-gray-100 group-hover:border-[#D4AF37] group-hover:shadow-[#D4AF37]/10 transition-all">
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </div>
          </div>
        </button>
      </div>

      {/* Featured Sections */}
      <div id="featured-sections">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <>
            <CategorySection title="Clothing" products={getRecentProductsByCategory('Clothing')} />
            <CategorySection title="Electronics" products={getRecentProductsByCategory('Electronics')} />
            <CategorySection title="Shoes" products={getRecentProductsByCategory('Shoes')} />
            <CategorySection title="Accessories" products={getRecentProductsByCategory('Accessories')} />
          </>
        )}
      </div>
    </main>
  );
}



