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
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {appConfig} from '@/lib/hooks/useConfig'


export default function Checkout({gig, order, clientSecret}: {
    gig: Required<IGigDocument>,
    order: Required<IOrderDocument>,
    clientSecret: string
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const fullPath = useMemo(() => {
        const query = searchParams.toString();
        if (searchParams.has('secret'))
            return `${pathname}?${query}`;
        return query ? `${pathname}?secret=${clientSecret}&${query}` : pathname;
    }, [clientSecret, pathname, searchParams]);

    useEffect(() => {
        router.replace(fullPath);
    }, []);

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
            const stripe = await loadStripe(appConfig.STRIPE_PUBLISHABLE_KEY!);
            setStripePromise(Promise.resolve(stripe));
        }
        initializePayment();
    }, []);

    function handleLoadPaymentError(event: { elementType: "payment"; error: StripeError }) {
        if (event.error) console.log(event.error);
    }

    if (!stripePromise || !clientSecret) {
        addToastByType('Error with payment. Please try again!', "error");
        return <div>error</div>;
    }

    return (
        <>
            {stripePromise && (
                <Elements stripe={stripePromise} options={paymentOptions}>
                    <div className="relative grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-y-8 gap-x-20">
                        {/* Left column */}
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

                        {/* Right column */}
                        <aside className="lg:sticky top-8 grid grid-cols-1 h-fit gap-8 ">
                            <CheckoutForm order={order} disabled={isPaymentElementLoading}/>
                        </aside>
                    </div>
                </Elements>
            )}
        </>
    )
}


function CheckoutForm({order, disabled}: { order: Required<IOrderDocument>, disabled?: boolean }) {
    const stripe = useStripe();
    const elements = useElements();
    const {addToastByType} = useToast();
    const [status, setStatus] = useState<string>('initializing');
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (status === 'success') {
            router.replace(`/orders/${order._id}/requirements/answer`)
        } else if (status === 'error') {
            addToastByType(`${errorMessage}`, 'error');
        }
    }, [status]);


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

    return (
        <>
            <form onSubmit={handleSubmit} className="border border-gray-300 rounded-lg p-6 bg-white">
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
            </form>
            <Tooltip id="sevice-fee-tooltip" className="tooltip"/>
        </>
    )
}
