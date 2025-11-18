import {getOrderById} from "@/lib/services/server/order.server";
import {redirect} from "next/navigation";

export default async function OrderRedirectPage({params, searchParams}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<Record<string, any>>
}) {
    const {id} = await params;
    const {source} = await searchParams;

    const order = await getOrderById(id);

    if (!order) {
        redirect(`/support?type=order&id=${id}&reason=${encodeURIComponent('NOT_FOUND')}`);
    }

    if (order.status === 'PENDING') {
        redirect(`/checkout/${order._id}/${order.gigId}?source=${encodeURIComponent(source)}`);
    }

    if (order.status === 'ACTIVE') {
        redirect(`/users/${order.buyerUsername}/orders/${order._id}/requirements/answer?source=${encodeURIComponent(source)}`);
    }

    // fallback
    redirect(`/support?type=order&id=${id}&reason=INVALID_STATE`);
}
