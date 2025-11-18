import {getOrderById} from "@/lib/services/server/order.server";
import {redirect} from "next/navigation";
import OrderDetail from "@/components/features/order/OrderDetail";
import Link from "next/link";
import {MoveLeft} from 'lucide-react';

export default async function OrderDetailPage({params, searchParams}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<Record<string, string>>
}) {
    const {id} = await params;
    const {source} = await searchParams;

    const order = await getOrderById(id);

    if (!order) {
        redirect(`/support?type=order&id=${id}&reason=${encodeURIComponent('NOT_FOUND')}`);
    }

    const showBack = source?.includes(`/users/${order.buyerUsername}/orders`)

    return (
        <div className="container mx-auto px-6 py-6">
            <Link href={showBack ? source : `/users/${order.buyerUsername}/orders`}
                  className={"btn btn-text text-base text-gray-600 font-normal hover:text-gray-900 mb-6"}>
                <MoveLeft size={16} className={"mr-0.5"}/>Back
                to orders</Link>
            <OrderDetail order={order}/>
        </div>
    )
}
