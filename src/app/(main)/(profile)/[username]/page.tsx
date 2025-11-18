import {Metadata, ResolvingMetadata} from "next";
import SellerPublicProfile from "@/components/features/seller/SellerPublicProfile";
import {getSellerByUsername} from "@/lib/services/server/seller.server";
import {getActiveGigsBySeller} from "@/lib/services/server/gig.server";
import {getReviews} from "@/lib/services/server/review.server";

export async function generateMetadata(
    {params}: { params: Promise<{ username: string }> },
    _parent: ResolvingMetadata
): Promise<Metadata> {
    const {username} = await params
    const seller = await getSellerByUsername(username);

    if (!seller) {
        return {
            title: "Seller Not Found | JobLance",
            description: "This seller does not exist or has been removed.",
        };
    }

    const title = `${seller.fullName || seller.username}'s Profile | JobLance`;
    const description = seller.oneliner || `View ${seller.username}'s professional seller profile on JobLance.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/sellers/${seller.username}`,
            siteName: "JobLance",
            images: seller.profilePicture
                ? [{url: seller.profilePicture, width: 800, height: 800, alt: seller.fullName}]
                : [{url: `${process.env.NEXT_PUBLIC_BASE_URL}/default-seller.png`}],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: seller.profilePicture ? [seller.profilePicture] : undefined,
        },
    };
}

export default async function SellerPublicProfilePage({params}: { params: Promise<{ username: string }> }) {
    const {username} = await params;
    const seller = await getSellerByUsername(username);
    const gigs = await getActiveGigsBySeller(username);

    return <SellerPublicProfile seller={seller} gigs={gigs}/>;
}
