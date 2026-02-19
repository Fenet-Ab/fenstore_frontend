import Electronics from "@/app/components/Category/Electronics";
import Clothes from "@/app/components/Category/Clothes";
import Shoes from "@/app/components/Category/Shoes";
import Accessories from "@/app/components/Category/Accessories";
import { notFound } from "next/navigation";

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const categoryMap: { [key: string]: React.ComponentType } = {
        electronics: Electronics,
        clothes: Clothes,
        clothing: Clothes,
        shoes: Shoes,
        accessories: Accessories,
    };

    const Component = categoryMap[slug.toLowerCase()];

    if (!Component) {
        notFound();
    }

    return (
        <div className="min-h-screen pt-20">
            <Component />
        </div>
    );
}
