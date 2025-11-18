import {getGigById} from "@/lib/services/server/gig.server";
import Checkout from "@/components/features/gig/Checkout";
import {getOrderById, validatePayment} from "@/lib/services/server/order.server";
import React from "react";
import {redirect} from "next/navigation";
import {auth} from "@/auth";

export default async function CheckoutPage({params, searchParams}:
                                           {
                                               params: Promise<{ slug: string[] }>,
                                               searchParams: Promise<{ [key: string]: string | undefined }>
                                           }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/logout");

    const [orderId, gigId] = (await params).slug;

    const {valid, status, data} = await validatePayment(orderId, session.user.id, gigId);
    const fallbackClientSecret = (await searchParams).secret ?? data.clientSecret;

    const handleRedirectByStatus = (statusStr: string) => {
        switch (statusStr) {
            case 'OK':
            case 'VALID':
                return;

            case 'NOT_FOUND':
                redirect(`/support?type=order&id=${orderId}&reason=${encodeURIComponent(statusStr)}`);
            case 'INVALID_GIG':
                redirect(`/support?type=gig&id=${orderId}&reason=${encodeURIComponent(statusStr)}`);
            default:
                redirect(`/support?type=order&id=${orderId}&reason=${encodeURIComponent(statusStr)}`);
        }
    };

    if (!valid) {
        handleRedirectByStatus(status);
        return null;
    }

    const order = data?.order;
    if (!order) {
        redirect(`/support?order=${orderId}&reason=missing_order`);
    }

    const gig = await getGigById(gigId);
    if (!gig) redirect(`/support?type=gig&id=${gigId}`);

    return (
        <Checkout gig={gig} order={order} clientSecret={fallbackClientSecret}/>
    )
}