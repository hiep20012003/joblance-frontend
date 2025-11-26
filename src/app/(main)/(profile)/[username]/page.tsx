import {Metadata, ResolvingMetadata} from "next";
import SellerPublicProfile from "@/components/features/seller/SellerPublicProfile";
import {getSellerByUsername} from "@/lib/services/server/seller.server";
import {getActiveGigsBySeller} from "@/lib/services/server/gig.server";

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

    const title = `${seller.fullName || seller.username}'s Profile`;
    const description = seller.oneliner || `View ${seller.username}'s professional seller profile on JobLance.`;

    return {
        title,
        description,
    };
}

export default async function SellerPublicProfilePage({params}: { params: Promise<{ username: string }> }) {
    const {username} = await params;
    const seller = await getSellerByUsername(username);
    const gigs = await getActiveGigsBySeller(username);

    return <SellerPublicProfile seller={seller} gigs={gigs}/>;
}
