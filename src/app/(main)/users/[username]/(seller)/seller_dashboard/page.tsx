import {Metadata} from "next";
import SellerProfileCard from "@/components/features/seller/SellerProfileCard";
import SellerStatisticCard from "@/components/features/seller/SellerStatisticCard";
import {getSellerByUsername} from "@/lib/services/server/seller.server";
import SellerManageOrders from "@/components/features/order/SellerManagerOrders";

export const metadata: Metadata = {
    title: "Seller Dashboard | JobLance",
    description: "View and manage your seller dashboard on JobLance",
};


export default async function SellerDashboardPage({params}: { params: Promise<{ username: string }> }) {
    const {username} = await params;
    const result = await getSellerByUsername(username ?? '')
    const seller = result ?? null;

    if (!seller) {
        return (
            <div className="flex justify-center items-center h-[60vh] text-gray-500 text-sm">
                No seller data available
            </div>
        );
    }

    return (
        <div className="container mx-auto flex-1 bg-background p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-6">
                    <SellerProfileCard seller={seller} showViewButton={true}/>
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-6">
                    <div className={"bg-white border border-gray-200 rounded-xl shadow-sm p-4"}>
                        <SellerStatisticCard seller={seller}/>
                    </div>
                    <div className={"bg-white border border-gray-200 rounded-xl shadow-sm"}>
                        <SellerManageOrders disableScrollOnPageChange={true}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
