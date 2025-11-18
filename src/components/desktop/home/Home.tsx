'use client'

import Link from "next/link";
import {
    TrendingUp,
    Users,
    Briefcase,
    Palette,
    Code,
    PenTool,
    Music,
    Video,
} from "lucide-react";
import GigCard from "@/components/features/gig/GigCard";
import {toSlug} from "@/lib/utils/helper";
import {useUserContext} from "@/context/UserContext";
import {MultiCardCarousel} from "@/components/shared/MultiCardCarousel";
import {IGigDocument} from "@/types/gig";
import {ISellerDocument} from "@/types/seller";
import {SellerItem} from "@/components/features/seller/SellerItem";
import {useRouter} from "next/navigation";

export default function HomePage({topGigs, recommendedGigs, recommendedCategory, topSellers}: {
    topGigs: IGigDocument[],
    recommendedGigs: IGigDocument[]
    recommendedCategory: string;
    topSellers: ISellerDocument[];
}) {
    const {user} = useUserContext();
    const router = useRouter();

    const latestCategorySelected = recommendedCategory

    const categories = [
        {name: "Graphics & Design", icon: Palette, color: "bg-pink-100 text-pink-600"},
        {name: "Digital Marketing", icon: TrendingUp, color: "bg-blue-100 text-blue-600"},
        {name: "Writing & Translation", icon: PenTool, color: "bg-green-100 text-green-600"},
        {name: "Video & Animation", icon: Video, color: "bg-purple-100 text-purple-600"},
        {name: "Music & Audio", icon: Music, color: "bg-yellow-100 text-yellow-600"},
        {name: "Programming & Tech", icon: Code, color: "bg-indigo-100 text-indigo-600"},
        {name: "Business", icon: Briefcase, color: "bg-orange-100 text-orange-600"},
        {name: "Consulting", icon: Users, color: "bg-cyan-100 text-cyan-600"},
    ];

    return (
        <div className="home-page bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Welcome back, {user?.username}! 👋
                    </h1>
                    <p className="text-xl text-primary-100 mb-4">
                        Find the perfect services for your business
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-6 py-8">

                {/* Categories */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {categories.map((category, index) => (
                            <Link
                                key={index}
                                href={`/src/app/gigs/categories/${toSlug(category.name)}`}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all hover:-translate-y-1 text-center"
                            >
                                <div
                                    className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                                    <category.icon className="w-6 h-6"/>
                                </div>
                                <p className="text-sm font-medium text-gray-900 leading-tight">{category.name}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Recommended Gigs */}
                {recommendedGigs?.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {latestCategorySelected
                                    ? `Recommended Gigs in ${latestCategorySelected}`
                                    : "Recommended Gigs"}
                            </h2>
                        </div>
                        <MultiCardCarousel
                            items={recommendedGigs}
                            renderItem={(item) =>
                                <GigCard {...(item)} />
                            }
                            showExplore={true}
                            onExploreClick={() => router.push(`/search/gigs?order=desc&sort=best&cat=${toSlug(latestCategorySelected ?? '')}`)}
                        />
                    </section>
                )}

                {/* Top Gigs */}
                {topGigs?.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Top 10 Gigs for You</h2>
                        </div>
                        <MultiCardCarousel
                            items={topGigs}
                            renderItem={(item) =>
                                <GigCard {...(item)} />
                            }
                            showExplore={true}
                            onExploreClick={() => router.push('/search/gigs?order=desc&sort=best')}
                        />
                    </section>
                )}

                {topSellers?.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Rated Sellers</h2>
                        <MultiCardCarousel
                            items={topSellers}
                            // visibleCount={5}
                            renderItem={(item) =>
                                <SellerItem item={item}/>
                            }
                        />
                    </section>
                )}

            </div>
        </div>
    );
}