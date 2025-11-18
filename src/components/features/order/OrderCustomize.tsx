'use client';

import React, {useState} from 'react';
import {formatPrice} from '@/lib/utils/helper';
import {IGigDocument} from "@/types/gig";
import GigRowComponent from "@/components/features/gig/GigRow";
import {PlusIcon, Minus} from "lucide-react";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {createOrder} from "@/lib/services/client/order.client";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useToast} from "@/context/ToastContext";

interface IOrderCustomizeProps {
    gig: Required<IGigDocument>
    onContinue: () => void
}

export default function OrderCustomize({gig, onContinue}: IOrderCustomizeProps) {
    const [quantity, setQuantity] = useState(1);
    const {data: session} = useSession();
    const router = useRouter();
    const {addToastByType} = useToast();

    const {mutate: createOrderMutate, loading: createOrderLoading} = useFetchMutation(createOrder, {
        disableToast: false,
        successMessage: 'Order created',
        onSuccess: (result) => {
            onContinue?.();
            router.push(`/checkout/${result.order._id}/${result.order.gigId}?secret=${result.clientSecret}`);
        },
    });

    const subtotal = gig.price * quantity;

    const quantityAction = (
        <div className="mt-2 justify-self-end h-fit flex items-center gap-2 bg-white rounded-full">
            <button
                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : prev))}
                className="btn btn-outlined w-6 h-6 bg-transparent rounded-full text-gray-700 text-lg font-semibold p-2"
            >
                <span>
                <Minus size={12}/>
                </span>
            </button>
            <span className="w-6 text-base font-medium text-gray-600 text-center">{quantity}</span>
            <button
                onClick={() => setQuantity((prev) => (prev < 10 ? prev + 1 : prev))}
                className="btn btn-outlined w-6 h-6 bg-transparent rounded-full text-gray-700 text-lg font-semibold p-2"
            >
                <span>
                <PlusIcon size={12}/>
                </span>
            </button>
        </div>
    )

    const handleSubmit = async () => {
        if (!session?.user?.id) {
            addToastByType('Please login to continue', 'warning');
            return;
        }

        const orderData = {
            gigId: gig._id,
            buyerId: session.user.id,
            sellerId: gig.sellerId,
            gigTitle: gig.title,
            gigDescription: gig.description,
            gigCoverImage: gig.coverImage,
            buyerUsername: session.user.username,
            buyerEmail: session.user.email,
            buyerPicture: session.user.profilePicture,
            sellerUsername: gig.username,
            sellerEmail: gig.email,
            sellerPicture: gig.profilePicture,
            expectedDeliveryDays: gig.expectedDeliveryDays,
            quantity: quantity,
            requirements: gig.requirements.map(req => ({...req, requirementId: req._id, _id: undefined})),
        };

        await createOrderMutate(orderData);
    }

    return (
        <div className="h-full flex flex-col justify-between">

            <div className="border-b border-gray-300">
                <h2 className={"font-bold text-lg px-6 py-3"}>Order options</h2>
            </div>


            <div className="flex-1 p-4">
                <GigRowComponent {...gig} />
                {quantityAction}

            </div>


            <div className="bg-transparent p-4">
                {/*<div className="flex flex-col gap-2 mb-4 text-lg">*/}
                {/*    <h2 className="font-semibold text-gray-900">Price summary</h2>*/}

                {/*    <div className="flex justify-between text-gray-700">*/}
                {/*        <span>Selected service</span>*/}
                {/*        <span>{formatPrice(subtotal)}</span>*/}
                {/*    </div>*/}
                {/*    <div className="flex justify-between text-gray-700">*/}
                {/*        <span>Service Fee</span>*/}
                {/*        <span>{formatPrice(serviceFee)}</span>*/}
                {/*    </div>*/}
                {/*</div>*/}

                <div className="flex flex-col pt-4 pb-2 gap-2">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <h2 className={"font-bold text-xl text-gray-700 mb-1"}>{formatPrice(subtotal)}</h2>
                        <p className={"text-gray-700 text-sm"}>Single order {quantity > 1 ? (
                            <span>(X{quantity})</span>) : undefined}</p>
                    </div>
                    {/*<p className={"text-base text-gray-800"}>By clicking the button, you agree to JobLance&#39;s*/}
                    {/*    <span className={"underline cursor-pointer"}> Terms of Service </span>*/}
                    {/*    and*/}
                    {/*    <span className={"underline cursor-pointer"}> Payment Terms </span>*/}
                    {/*</p>*/}
                    {/* Confirm Button */}
                    <button
                        onClick={handleSubmit}
                        className="btn text-base bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-md font-semibold transition"
                        disabled={createOrderLoading}
                    >
                        {createOrderLoading ? 'Processing...' : 'Continue'}
                    </button>
                </div>
            </div>

        </div>
    );
}
