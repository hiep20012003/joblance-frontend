import AddReviewForm from "@/components/features/review/AddReviewForm";
import {getOrderById} from "@/lib/services/server/order.server";
import {redirect} from "next/navigation";
import ServerComponentError from "@/components/shared/ServerComponentError";
import {OrderStatus} from "@/lib/constants/constant";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {auth} from "@/auth";

export default async function OrderLeaveReviewPage({params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const order = await getOrderById(id);
        const session = await auth();


        if (!order) {
            redirect(`/support?type=order&id=${id}&reason=${encodeURIComponent('NOT_FOUND')}`);
        }

        const isSeller = session?.user?.id === order.sellerId;
        const isBuyer = session?.user?.id === order.buyerId;

        if (!isSeller && !isBuyer) {
            redirect(`/support?type=order&id=${id}&reason=${encodeURIComponent("UNAUTHORIZED")}`);
        }

        if (order.status !== OrderStatus.COMPLETED) {
            redirect(`/orders/${order._id}`);
        }

        return (
            <>
                <div
                    className="bg-gradient-to-r from-primary-500 to-purple-600 text-white p-8 shadow-lg">
                    <div className="container mx-auto px-6">
                        <h1 className="text-4xl font-bold mb-2">Share Your Experience!</h1>
                        <p className="text-lg opacity-90">
                            Your feedback helps us improve. Please take a moment to review your recent order.
                        </p>
                    </div>
                </div>
                <div className="container mx-auto px-6 py-8 mb-12">
                    <AddReviewForm order={order}/>
                </div>
            </>
        )
    } catch (error) {
        if (isRedirectError(error)) throw error;

        return <ServerComponentError error={error}/>
    }
}
