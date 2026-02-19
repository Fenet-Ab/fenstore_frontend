import ProductCard from "../ProductCard/ProductCard";
import { ArrowRight } from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    averageRating?: number;
    ratingCount?: number;
}

interface CategorySectionProps {
    title: string;
    products: Product[];
}

export default function CategorySection({
    title,
    products,
}: CategorySectionProps) {
    return (
        <section className="max-w-7xl mx-auto px-4 py-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-1 bg-[#D4AF37] rounded-full"></span>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">Premium Collection</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight">{title}</h2>
                </div>

                <a
                    href={`/category/${title.toLowerCase()}`}
                    className="group flex items-center gap-2 text-[#1A1A1A] font-bold hover:text-[#D4AF37] transition-all"
                >
                    <span className="border-b-2 border-transparent group-hover:border-[#D4AF37] transition-all">Explore Collection</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
            </div>

            {/* Grid Layout - 4 columns for better visibility as requested */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </section>
    );
}

