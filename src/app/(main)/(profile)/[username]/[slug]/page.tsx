import {Metadata, ResolvingMetadata} from "next";
import {getSellerByUsername} from "@/lib/services/server/seller.server";
import {decodeUUID} from "@/lib/utils/uuid";
import {getActiveGigsBySeller, getGigById, getSimilarGigs} from "@/lib/services/server/gig.server";
import GigPublicView from "@/components/features/gig/GigPublicView";

export async function generateMetadata(
    {params}: { params: Promise<{ slug: string }> },
    _parent: ResolvingMetadata
): Promise<Metadata> {
    const {slug} = await params;
    const gigId = decodeUUID(slug.substring(slug.lastIndexOf('-') + 1))

    const gig = await getGigById(gigId);

    if (!gig) {
        return {
            title: "Gig Not Found | JobLance",
            description: "This gig does not exist or has been removed.",
        };
    }

    const title = `${gig.title} | JobLance`;
    const description = gig.basicDescription;

    return {
        title,
        description,
    };
}

export default async function GigPublicPage({params}: { params: Promise<{ slug: string }> }) {
    const {slug} = await params;
    const gigId = decodeUUID(slug.substring(slug.lastIndexOf('-') + 1))

    const gig = await getGigById(gigId);
    const [seller, gigs, similarGigs] = await Promise.all(
        [
            getSellerByUsername(gig.username),
            getActiveGigsBySeller(gig.username),
            getSimilarGigs(gig._id)
        ]
    )

    return (
        <GigPublicView gig={gig} seller={seller} sellerGigs={gigs} similarGigs={similarGigs}/>
    )
}
