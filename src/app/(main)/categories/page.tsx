import Link from "next/link";
import {Briefcase, Code, Film, LineChart, Music, Palette, PenTool, Users} from "lucide-react";
import {GIG_CATEGORIES} from "@/lib/constants/constant";
import {toSlug} from "@/lib/utils/helper";
import Carousel from "@/components/shared/Carousel";
import Image from 'next/image'

const categoryIcons: Record<string, React.ElementType> = {
    "Graphics & Design": Palette,
    "Digital Marketing": LineChart,
    "Writing & Translation": PenTool,
    "Video & Animation": Film,
    "Music & Audio": Music,
    "Programming & Tech": Code,
    "Business": Briefcase,
    "Consulting": Users,
};

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-primary-950 text-white py-16">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Explore Our Categories
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
                        Find the perfect freelance services for your business
                    </p>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="container mx-auto py-12 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {GIG_CATEGORIES.map((cat) => {
                        const Icon = categoryIcons[cat.category] || categoryIcons["Business"];

                        return (
                            <div
                                key={cat.category}
                                className="bg-white border-2 border-gray-200 rounded-lg p-6 transition-all duration-300 hover:border-primary-500 hover:shadow-xl hover:-translate-y-1"
                            >
                                {/* Category Header */}
                                <Link href={`/categories/${toSlug(cat.category)}`}>
                                    <div className="flex items-center gap-3 mb-6 cursor-pointer group">
                                        <div
                                            className="bg-primary-500 text-white p-2.5 rounded-lg group-hover:bg-primary-600 transition-colors">
                                            <Icon className="w-5 h-5"/>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-500 transition-colors">
                                            {cat.category}
                                        </h2>
                                    </div>
                                </Link>

                                {/* Subcategories */}
                                <ul className="space-y-2.5">
                                    {cat.subcategories.slice(0, 5).map((sub) => (
                                        <li key={sub}>
                                            <Link
                                                href={`/categories/${toSlug(cat.category)}/${toSlug(sub)}`}
                                                className="text-sm text-gray-600 hover:text-primary-500 hover:translate-x-1 inline-block transition-all duration-200"
                                            >
                                                {sub}
                                            </Link>
                                        </li>
                                    ))}
                                    {cat.subcategories.length > 5 && (
                                        <li>
                                            <Link
                                                href={`/categories/${toSlug(cat.category)}`}
                                                className="text-sm font-semibold text-gray-900 hover:text-primary-500 inline-block transition-colors"
                                            >
                                                + {cat.subcategories.length - 5} more
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-50 border-t border-gray-200 py-16">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Can&#39;t find what you&#39;re looking for?
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Try our advanced search or post a request to get custom offers from talented freelancers
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link
                            href="/src/app/search"
                            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
                        >
                            Search Gigs
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}