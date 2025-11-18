import SearchGigs from "@/components/features/gig/SearchGigs";
import {parseSearchParams} from "@/lib/utils/search";
import {searchGigs} from "@/lib/services/server/gig.server";

export default async function SearchGigsPage({searchParams}: {
    searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {

    const filters = parseSearchParams(await searchParams);
    const result = await searchGigs(filters);
    return (
        <div>
            <div className="container mx-auto px-6 py-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {filters.keyword ? `Search results for "${filters.keyword}"` : 'Search Gigs'}
                </h1>
            </div>
            <SearchGigs initialData={result}/>
        </div>
    )
}