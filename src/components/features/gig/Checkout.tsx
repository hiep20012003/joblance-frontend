'use client'

import GigRowComponent from "@/components/features/gig/GigRow";
import {formatPrice} from "@/lib/utils/helper";
import React, {useEffect, useMemo, useState} from "react";
import {IGigDocument} from "@/types/gig";
import {IOrderDocument} from "@/types/order";
import {CircleQuestionMark} from 'lucide-react';
import {Tooltip} from "react-tooltip";
import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {loadStripe, Stripe, StripeError} from "@stripe/stripe-js";
import {useToast} from "@/context/ToastContext";
import {redirect, usePathname, useRouter, useSearchParams} from "next/navigation";
import {getOrderById, validatePayment} from "@/lib/services/server/order.server";
import Spinner from "@/components/shared/Spinner";
import clsx from "clsx";
import {useUserContext} from "@/context/UserContext";
import {getGigById} from "@/lib/services/server/gig.server";
import LoadingWrapper from "@/components/shared/LoadingWrapper";


export default function Checkout({gigId, orderId, clientSecret, stripeKey}: {
    gigId: string,
    orderId: string,
    clientSecret: string,
    stripeKey: string
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const {user} = useUserContext();

    const [gig, setGig] = useState<Required<IGigDocument> | null>(null);
    const [order, setOrder] = useState<Required<IOrderDocument> | null>(null);

    const [show, setShow] = React.useState(true);
    const [validating, setValidating] = React.useState(true);

    // const fullPath = useMemo(() => {
    //     const query = searchParams.toString();
    //     if (searchParams.has('secret'))
    //         return `${pathname}?${query}`;
    //     return query ? `${pathname}?secret=${clientSecret}&${query}` : pathname;
    // }, [clientSecret, pathname, searchParams]);

    useEffect(() => {
        async function validateOrder(){
            const {valid, status, data} = await validatePayment(orderId, String(user?.id), gigId);
            if (!valid) {
                switch (status) {
                    case 'OK':
                    case 'VALID':
                        return;

                    case 'NOT_FOUND':
                        router.replace(`/support?type=order&id=${orderId}&reason=${encodeURIComponent(status)}`);
                        break;
                    case 'INVALID_GIG':
                        router.replace(`/support?type=gig&id=${orderId}&reason=${encodeURIComponent(status)}`);
                        break;
                    default:
                        router.replace(`/support?type=order&id=${orderId}&reason=${encodeURIComponent(status)}`);
                }
                return null;
            }

            if (!data.order) {
                router.replace(`/support?order=${orderId}&reason=missing_order`);
            }
            const gig = await getGigById(gigId) as Required<IGigDocument>;
            if (!gig) router.replace(`/support?type=gig&id=${gigId}`);

            return {order: data.order, gig}
        }

        validateOrder().then( data => {
            if(data){
                setGig(data.gig);
                setOrder(data.order);
            }
        }).catch( () => router.replace(`/support`)).finally(() => setValidating(false));

    }, [gigId, orderId, router, user?.id]);

    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null>>(Promise.resolve(null));
    const [isPaymentElementLoading, setIsPaymentElementLoading] = useState(true);

    const {addToastByType} = useToast();

    const appearance = {
        theme: 'flat' as const,
        variables: {
            fontFamily: ' "Gill Sans", sans-serif',
            fontLineHeight: '1.5',
            borderRadius: '10px',
            colorBackground: '#F6F8FA',
            accessibleColorOnColorPrimary: '#262626'
        },
        rules: {
            '.Block': {backgroundColor: 'var(--colorBackground)', boxShadow: 'none'},
            '.Input': {padding: '12px'},
            '.Input:disabled, .Input--invalid:disabled': {color: 'lightgray'},
            '.Tab': {padding: '10px 12px 8px 12px', border: 'none'},
            '.Tab:hover': {
                border: 'none',
                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
            },
            '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
                border: 'none',
                backgroundColor: '#fff',
                boxShadow: '0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
            },
            '.Label': {fontWeight: '500'},
        }
    };

    const paymentOptions = {clientSecret, appearance};

    useEffect(() => {
        const initializePayment = async () => {
            const stripe = await loadStripe(stripeKey);
            setStripePromise(Promise.resolve(stripe));
        }
        initializePayment();
    }, []);

    function handleLoadPaymentError(event: { elementType: "payment"; error: StripeError }) {
        // if (event.error) console.log(event.error);
    }

    if (!stripePromise || !clientSecret) {
        addToastByType('Error with payment. Please try again!', "error");
        return <div>error</div>;
    }

    if(validating){
        return <LoadingWrapper isLoading={true} fullScreen={true}/>
    }

    if(!order || !gig) return null;

    return (
        <>
            {stripePromise && (
                <Elements stripe={stripePromise} options={paymentOptions}>
                    <div
                        className={clsx("relative gap-y-8 gap-x-20 h-full", show ? "grid grid-cols-1 lg:grid-cols-[3fr_2fr]" : "flex flex-col items-center")}>
                        {/* Left column */}
                        {show && (
                            <div className="flex flex-col gap-8">
                                <div>
                                    <h2 className="font-bold text-xl mb-4 text-gray-800">Orders details</h2>
                                    <GigRowComponent {...gig} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-xl mb-4 text-gray-800">Payment methods</h2>
                                    <PaymentElement
                                        options={{layout: {type: 'tabs'}, wallets: {link: 'never'}}}
                                        className="p-6 border border-gray-200 rounded-lg shadow-sm"
                                        onLoadError={handleLoadPaymentError}
                                        onLoaderStart={() => setIsPaymentElementLoading(true)}
                                        onReady={() => setIsPaymentElementLoading(false)}
                                    />
                                </div>
                            </div>
                        )}
                        {!show&&(

                        <div className="flex-1"></div>
                            )}

                        {/* Right column */}
                        <div className={clsx("lg:sticky top-8 grid grid-cols-1 h-fit gap-8")}>
                            <CheckoutForm order={order} disabled={isPaymentElementLoading}
                                          onCheckoutSuccess={() => setShow(false)}/>
                        </div>
                        {!show&&(

                        <div className="flex-[2]"></div>
                        )}
                    </div>
                </Elements>
            )}
        </>
    )
}


function CheckoutForm({order, disabled, onCheckoutSuccess}: { order: Required<IOrderDocument>, disabled?: boolean, onCheckoutSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const {user} = useUserContext()
    const {addToastByType} = useToast();
    const [status, setStatus] = useState<string>('initializing');
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        let isMounted = true;

        async function fetchSuccessOrder() {
            const timeout = 25000;
            const start = Date.now();

            while (Date.now() - start < timeout) {
                if (!isMounted) return;

                try {
                    const orderSuccess = await getOrderById(order._id);

                    if (orderSuccess.status === 'ACTIVE') {
                        router.replace(`/orders/${orderSuccess._id}/requirements/answer`);
                        return;
                    }
                } catch (err) {
                    // console.error("Polling error:", err);
                }

                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            if (isMounted) {
                throw new Error('TIMEOUT');
            }
        }

        if (status === 'success') {
            onCheckoutSuccess?.();
            fetchSuccessOrder().catch(() => {
                if (!isMounted) return;

                setStatus('timeout');
                setErrorMessage('Payment confirmation is taking longer than usual. You can safely close this page; we’ll update your order status as soon as it\'s confirmed.');
            });
        }

        return () => {
            isMounted = false;
        };
    }, [status, order._id]);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setStatus('loading');

        if (!stripe || !elements) return;

        const {error: submitError} = await elements.submit();

        if (submitError) {
            addToastByType(`${submitError.message}`, 'error');
            setStatus('error');
            return;
        }

        const result = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
            confirmParams: {
                return_url: `http://www.localhost:3000/payment-success?amount=${order.totalAmount}`,
            },
        });

        if (result.error) {
            setErrorMessage(result.error.message);
            setStatus('error');
            return;
        }

        setStatus('success');
    };

    const renderComponent = () =>{
        switch (status) {
            case 'initializing': case 'loading': case 'error':
                return (
                    <form onSubmit={handleSubmit} className="w-full border border-gray-300 rounded-lg p-6 bg-white">
                        <div className="flex flex-col gap-2 mb-4 text-lg">
                            <h2 className="text-xl font-bold text-gray-900">Price summary</h2>

                            <div className="flex justify-between text-gray-700">
                                <span>Selected service</span>
                                <span className="font-semibold">{formatPrice(order.price)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Quantity</span>
                                <span className="font-semibold">{order.quantity}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                        <span className="flex gap-2 justify-center items-center">
                            Service Fee
                            <CircleQuestionMark
                                size={16}
                                className="outline-none"
                                data-tooltip-id="sevice-fee-tooltip"
                                data-tooltip-content="This helps us operate our platform and offer 24/7 customer support for your orders."
                            />
                        </span>
                                <span className="font-semibold">{formatPrice(order.serviceFee)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col pt-4 pb-2 gap-2 border-t border-gray-300">
                            <div className="flex justify-between text-xl font-bold text-gray-900 py-2">
                                <span>Total</span>
                                <span>{formatPrice(order.totalAmount)}</span>
                            </div>
                            <p className="text-base text-gray-800">
                                By clicking the button, you agree to JobLance&#39;s&nbsp;
                                <span className="underline cursor-pointer">Terms of Service</span>&nbsp;and&nbsp;<span
                                className="underline cursor-pointer">Payment Terms</span>
                            </p>
                            <button
                                type="submit"
                                className="btn text-base bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-md font-semibold transition mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={['loading'].some(value => value === status) || disabled}
                            >
                                {status === 'loading' ? 'Processing...' : 'Confirm & Pay'}
                            </button>
                        </div>
                        <Tooltip id="sevice-fee-tooltip" className="tooltip"/>
                    </form>
                )
            case 'success':
                return (
                    <div className="border border-gray-300 rounded-lg px-8 py-12 bg-white text-center shadow-sm flex flex-col items-center gap-4 w-[600px]">
                        <Spinner/>
                        <h2 className="text-2xl font-bold text-gray-900">Verifying your payment</h2>
                        <p className="text-gray-600">
                            We&#39;re waiting for confirmation from the bank. This usually takes a few seconds.
                        </p>
                    </div>
                );

            case 'timeout':
                return (
                    <div className="border border-red-100 rounded-lg p-8 bg-red-50 text-center shadow-sm flex flex-col items-center gap-4 w-[600px]">
                        <div className="text-red-500 bg-red-100 p-3 rounded-full">
                            <CircleQuestionMark size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Payment Status</h2>
                        <p className="text-gray-700 leading-relaxed">
                            {errorMessage || "Something went wrong with the payment."}
                        </p>
                        <div className="flex flex-col w-full gap-2 mt-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-soft text-base w-full bg-gray-900 text-white py-2 rounded-md font-medium"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push(`/users/${user?.username}/orders?tab=priority`)}
                                className="btn btn-soft text-base w-full bg-white border border-gray-300 py-2 rounded-md font-medium"
                            >
                                View Orders
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }

    return (
        <div className="w-full flex flex-col">
            {renderComponent()}
        </div>
    );
}
