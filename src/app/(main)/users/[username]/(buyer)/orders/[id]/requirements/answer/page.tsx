import {getOrderById} from "@/lib/services/server/order.server";
import {getGigById} from "@/lib/services/server/gig.server";
import OrderRequirementForm from "@/components/features/order/OrderRequirementForm";
import {redirect} from "next/navigation";
import Image from "next/image";
import {format} from "date-fns";
import {DollarSign, Calendar, Clock} from "lucide-react";
import Avatar from "@/components/shared/Avatar";

export default async function RequirementAnswerPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;
    const order = await getOrderById(id);

    if (!order) {
        redirect(`/support?type=order&id=${id}&reason=${encodeURIComponent('NOT_FOUND')}`);
    }

    if (order.status === 'ACTIVE') {
        const gig = await getGigById(order.gigId);
        return (
            <>
                {/* Hero Section */}
                <section className="bg-green-600 text-white py-6">
                    <div className="container mx-auto px-6">
                        <h1 className="text-3xl font-bold">
                            Order Successful!
                        </h1>
                        <p className="text-green-50 mt-1">
                            Please provide the required details for your gig.
                        </p>
                    </div>
                </section>


                <div className={"container mx-auto p-6 pb-10"}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Main content: Order Requirement Form */}
                        <div className="lg:col-span-2">
                            <OrderRequirementForm order={order} gig={gig}/>
                        </div>

                        {/* Sticky sidebar: Summary Card */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                                {/* Gig Summary */}
                                <div className="mb-3">
                                    <h3 className="text-md font-medium mb-2">Gig Details</h3>
                                    <div className="relative h-32 mb-2">
                                        <Image
                                            src={order.gigCoverImage}
                                            alt={order.gigTitle}
                                            fill
                                            className="object-cover rounded-md"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority
                                        />
                                    </div>
                                    <p className="text-sm font-semibold">{order.gigTitle}</p>
                                    <p className="text-xs text-gray-600 truncate">{order.gigDescription.substring(0, 200)}...</p>
                                </div>

                                {/* Order Details */}
                                <div className="mb-3">
                                    <h3 className="text-md font-medium mb-2">Order Details</h3>
                                    <div className="flex items-center text-sm mb-1">
                                        <DollarSign className="h-4 w-4 mr-2 text-gray-500"/>
                                        <span>Total Amount: ${order.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center text-sm mb-1">
                                        <span>Quantity: {order.quantity}</span>
                                    </div>
                                    <div className="flex items-center text-sm mb-1">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-500"/>
                                        <span>Ordered: {format(new Date(order.dateOrdered), 'PPP')}</span>
                                    </div>
                                    <div className="flex items-center text-sm mb-1">
                                        <Clock className="h-4 w-4 mr-2 text-gray-500"/>
                                        <span>Expected Delivery: {format(new Date(order.expectedDeliveryDate), 'PPP')}</span>
                                    </div>
                                    <div className="text-sm mb-1">
                                        Status: <span className="font-semibold text-green-600">{order.status}</span>
                                    </div>
                                    <div className="text-sm">
                                        Invoice: {order.invoiceId}
                                    </div>
                                </div>

                                {/* Buyer Info */}
                                <div>
                                    <h3 className="text-md font-medium mb-2">Seller</h3>
                                    <div className="flex items-center gap-2">
                                        <Avatar src={order.sellerPicture} username={order.sellerUsername} size={24}/>
                                        <div>
                                            <p className="text-sm font-semibold">{order.sellerUsername}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    } else {
        redirect(`/users/${order.buyerUsername}/orders/${id}/detail`);
    }
}