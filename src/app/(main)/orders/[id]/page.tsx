import {getOrderById} from "@/lib/services/server/order.server";
import {redirect} from "next/navigation";
import ServerComponentError from "@/components/shared/ServerComponentError";
import {OrderProvider} from "@/components/features/order/OrderContext";
import OrderWorkspace from "@/components/features/order/OrderWorkspace";
import {auth} from "@/auth";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {getBuyerById} from "@/lib/services/server/buyer.server";
import {getSellerById} from "@/lib/services/server/seller.server";
import {getReviews} from "@/lib/services/server/review.server";

export default async function OrderWorkspacePage({
                                                     params,
                                                 }: {
    params: { id: string };
}) {
    try {
        const {id} = params;
        const session = await auth();
        const order = await getOrderById(id);

        if (!order) {
            redirect(
                `/support?type=order&id=${id}&reason=${encodeURIComponent("NOT_FOUND")}`
            );
        }

        const [buyer, seller, reviews] = await Promise.all([
            getBuyerById(order.buyerId),
            getSellerById(order.sellerId),
            getReviews({orderId: order._id})
        ]);

        const isSeller = session?.user?.id === order.sellerId;
        const isBuyer = session?.user?.id === order.buyerId;

        if (!isSeller && !isBuyer) {
            redirect(`/support?type=order&id=${id}&reason=${encodeURIComponent("UNAUTHORIZED")}`);
        }

        return (
            <OrderProvider order={order} buyer={buyer} seller={seller} isSeller={isSeller} reviews={reviews}>
                <OrderWorkspace/>
            </OrderProvider>
        );
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return <ServerComponentError error={error}/>;
    }
}
