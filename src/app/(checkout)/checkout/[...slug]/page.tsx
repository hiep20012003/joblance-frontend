import Checkout from "@/components/features/gig/Checkout";
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

    const clientSecret = (await searchParams).secret;

    if(!orderId || !gigId || !clientSecret) return redirect("/support");

    return (
        <Checkout orderId={orderId} gigId={gigId} clientSecret={clientSecret} stripeKey={process.env.STRIPE_PUBLISHABLE_KEY!}/>
    )
}