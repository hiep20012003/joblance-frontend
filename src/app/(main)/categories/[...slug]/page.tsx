// app/categories/[...slug]/page.tsx
import SearchGigs from "@/components/features/gig/SearchGigs";
import {parseSearchParams} from "@/lib/utils/search";
import {searchGigs} from "@/lib/services/server/gig.server";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BreadcrumbItem from "@/components/shared/BreadcrumbItem";
import {fromSlug, toSlug} from "@/lib/utils/helper";
import Link from "next/link";
import {GIG_CATEGORIES} from "@/lib/constants/constant";
import clsx from "clsx";
import ServerComponentError from "@/components/shared/ServerComponentError";
import {isRedirectError} from "next/dist/client/components/redirect-error";

export const revalidate = 300; // ISR mỗi 5 phút

// ⚙️ Pre-generate các route tĩnh
export async function generateStaticParams() {
    const params: { slug: string[] }[] = [];
    GIG_CATEGORIES.forEach((cat) => {
        params.push({slug: [toSlug(cat.category)]});
        cat.subcategories.forEach((sub) => {
            params.push({slug: [toSlug(cat.category), toSlug(sub)]});
        });
    });
    return params;
}

// 🧠 Dynamic metadata cho từng category/subcategory
export async function generateMetadata({params}: { params: Promise<{ slug: string[] }> }) {
    const {slug} = await params;
    const categoryName = fromSlug(slug[0]);
    const subcategoryName = slug[1] ? fromSlug(slug[1]) : null;

    const baseTitle = "Joblance — Freelance Services Marketplace";
    const baseDesc = "Hire top freelancers and get your projects done efficiently.";

    let title = baseTitle;
    let description = baseDesc;
    const url = `https://joblance.com/categories/${slug.join("/")}`;

    if (subcategoryName) {
        title = `${subcategoryName} | Joblance`;
        description = `Browse and hire expert ${subcategoryName.toLowerCase()} freelancers in ${categoryName} on Joblance.`;
    } else {
        title = `${categoryName} | Joblance`;
        description = `Explore top ${categoryName.toLowerCase()} freelance services and professionals for your project.`;
    }

    return {
        title,
        description,
        alternates: {canonical: url}
    };
}

// 🏗 Trang chính
export default async function CategoriesPage({
                                                 params,
                                                 searchParams,
                                             }: {
    params: Promise<{ slug: string[] }>;
    searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
    try {

        const {slug} = await params;
        if (!slug) return null;

        const categoryName = fromSlug(slug[0]);
        const subcategoryName = fromSlug(slug[1]);
        const category = GIG_CATEGORIES.find((cat) => cat.category === categoryName);

        const searchGigsParams = {...(await searchParams), cat: slug[0], sub: slug[1]};
        const filters = parseSearchParams(searchGigsParams);
        const result = await searchGigs(filters);

        return (
            <>
                <div className={clsx("container mx-auto px-6 flex flex-col mt-4 gap-6")}>
                    <Breadcrumb className={"text-sm"}>
                        <BreadcrumbItem href="/">Home</BreadcrumbItem>
                        <BreadcrumbItem href={`/categories/${slug[0]}`}>{categoryName}</BreadcrumbItem>
                        {subcategoryName && <BreadcrumbItem>{subcategoryName}</BreadcrumbItem>}
                    </Breadcrumb>

                    {!slug[1] ? (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Popular in {category?.category}
                            </h1>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {category?.subcategories.map((sub) => (
                                    <Link
                                        key={sub}
                                        href={`/categories/${slug[0]}/${toSlug(sub)}`}
                                        className="p-4 bg-white border-1 border-gray-200 rounded-lg hover:border-primary-500 transition-all group"
                                    >
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">
                                            {sub}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
                                <p className="text-gray-600 mt-2">{`Browse professional services in ${categoryName}`}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-gray-100 rounded-lg p-4">
                                <p className="text-gray-900">
                                    Showing results for <strong>{subcategoryName}</strong> in{" "}
                                    <strong>{categoryName}</strong>
                                </p>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{subcategoryName}</h1>
                                <p className="text-gray-600 mt-2">{`Browse ${subcategoryName} services in ${categoryName}`}</p>
                            </div>
                        </>
                    )}
                </div>

                <SearchGigs
                    initialData={result}
                    type={"categories"}
                    category={slug[0]}
                    subCategory={slug[1]}
                />
            </>
        );
    } catch (error) {
        if (isRedirectError(error)) throw error;

        return <ServerComponentError error={error}/>
    }
}
