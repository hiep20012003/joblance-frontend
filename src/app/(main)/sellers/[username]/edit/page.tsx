import {Metadata} from 'next';
import SellerProfileForm from "@/components/features/seller/SellerProfileForm";
import {ISellerDocument} from "@/types/seller";
import {getSellerByUsername} from "@/lib/services/server/seller.server";

export const metadata: Metadata = {
    title: 'Seller Profile | JobLance',
    description: 'View and edit your seller profile on JobLance',
};


export default async function SellerProfilePage({params}: { params: Promise<{ username: string }> }) {
    const {username} = await params;
    const result = await getSellerByUsername(username);
    const seller = result ?? null;

    return <SellerProfileForm data={seller as ISellerDocument}/>;
}


