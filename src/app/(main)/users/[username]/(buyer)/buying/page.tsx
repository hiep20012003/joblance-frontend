import {Metadata} from 'next';
import BuyerProfileManager from "@/components/features/buyer/BuyerProfileManager";
import {getBuyerById} from "@/lib/services/server/buyer.server";
import ServerComponentError from "@/components/shared/ServerComponentError";
import {auth} from "@/auth";
import {isRedirectError} from "next/dist/client/components/redirect-error";

export const metadata: Metadata = {
    title: 'Buyer Profile | JobLance',
    description: 'View and edit your buyer profile on JobLance',
};

export default async function BuyerProfilePage({params}: { params: Promise<{ username: string }> }) {
    try {
        const session = await auth();
        const result = await getBuyerById(session?.user?.id ?? '');
        return <BuyerProfileManager data={result ?? null}/>;
    } catch (error) {
        if (isRedirectError(error)) throw error;

        return <ServerComponentError error={error}/>
    }
}
