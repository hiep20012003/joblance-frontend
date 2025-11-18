import {Metadata} from 'next';
import SellerManageGigs from "@/components/features/gig/SellerManageGigs";
import {getGigsBySeller} from "@/lib/services/server/gig.server";

export const metadata: Metadata = {
    title: 'My Gigs | JobLance',
    description: 'View and edit your gigs on JobLance',
};

export default async function ManageGigsPage({params}: { params: Promise<{ username: string }> }) {
    const {username} = await params;
    const result = await getGigsBySeller(username);
    const gigs = result ?? [];

    return <SellerManageGigs data={gigs}/>;
}
