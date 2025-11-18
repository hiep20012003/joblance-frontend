'use client'

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {INegotiationDocument, IOrderDocument} from "@/types/order";
import {ISellerDocument} from "@/types/seller";
import {IBuyerDocument} from "@/types/buyer";
import {IReviewDocument} from "@/types/review";

interface OrderContextType {
    order: Required<IOrderDocument>;
    seller: Required<ISellerDocument>;
    buyer: Required<IBuyerDocument>;
    reviews: Required<IReviewDocument>[];
    isSeller: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({
                                  children,
                                  order: initialOrder,
                                  seller: initialSeller,
                                  buyer: initialBuyer,
                                  reviews: initialReviews,
                                  isSeller: initialIsSeller,
                              }: {
    children: ReactNode;
    order: Required<IOrderDocument>;
    seller: Required<ISellerDocument>;
    buyer: Required<IBuyerDocument>;
    reviews: Required<IReviewDocument>[];
    isSeller: boolean;
}) {
    const [order, setOrder] = useState(initialOrder);
    const [seller, setSeller] = useState(initialSeller);
    const [buyer, setBuyer] = useState(initialBuyer);
    const [reviews, setReviews] = useState(initialReviews);
    const [isSeller, setIsSeller] = useState(initialIsSeller);

    // Sync state if props change
    useEffect(() => {
        setOrder(initialOrder);
        setSeller(initialSeller);
        setBuyer(initialBuyer);
        setReviews(initialReviews);
        setIsSeller(initialIsSeller);
    }, [initialOrder, initialSeller, initialBuyer, initialIsSeller, initialReviews]);

    return (
        <OrderContext.Provider value={{order, seller, buyer, isSeller, reviews}}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrder() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
}
