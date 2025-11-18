import {getOrderById} from "@/lib/services/server/order.server";
import {getGigById} from "@/lib/services/server/gig.server";
import OrderRequirementForm from "@/components/features/order/OrderRequirementForm";
import {redirect} from "next/navigation";
import Image from "next/image";
import {DollarSign, Calendar, Clock, Box, Award, Package, User} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import ServerComponentError from "@/components/shared/ServerComponentError";
import {formatPrice} from "@/lib/utils/helper";
import {formatISOTime} from "@/lib/utils/time";
import {ElementType} from "react";
import Link from "next/link";
import {auth} from "@/auth";
import {isRedirectError} from "next/dist/client/components/redirect-error";

export default async function RequirementAnswerPage({params}: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        const {id} = await params;
        const order = await getOrderById(id);

        if (!order) {
            redirect(`/support?type=order&id=${id}&reason=${encodeURIComponent('NOT_FOUND')}`);
        }

        if (order.buyerId !== session?.user.id) {
            redirect(`/orders/${order._id}`);
        }

        const DetailItem = ({icon: Icon, label, value, color = "text-gray-800"}: {
            icon: ElementType,
            label: string,
            value: string | number,
            color?: string
        }) => (
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-gray-600">
                    <Icon className="h-4 w-4 mr-2 text-gray-500"/>
                    {label}
                </div>
                <span className={`${color} font-medium`}>{value}</span>
            </div>
        );

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


                    <div className={"container mx-auto p-6 md:p-8 lg:p-12 min-h-screen"}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                            <div className="lg:col-span-2">
                                <OrderRequirementForm order={order} gig={gig}/>
                            </div>

                            {/* Sticky sidebar: Summary Card */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-12">
                                    <div
                                        className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-xl"> {/* Bo góc, bóng đổ hiện đại hơn */}
                                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Order
                                            Summary</h2>

                                        {/* --- Gig Summary --- */}
                                        <div className="mb-6 pb-4 border-b border-gray-100">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                                                <Award className="h-5 w-5 mr-2 text-yellow-500"/>
                                                Gig Details
                                            </h3>
                                            <div
                                                className="relative h-40 w-full mb-3 overflow-hidden rounded-xl shadow-md"> {/* Ảnh lớn hơn, bo góc, đổ bóng */}
                                                <Image
                                                    src={gig.coverImage}
                                                    alt={gig.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    priority
                                                />
                                            </div>
                                            <p className="text-md font-bold text-gray-800 mb-1 line-clamp-2">{gig.title}</p>
                                            <p className="text-xs text-gray-500 line-clamp-3">{gig.basicDescription.substring(0, 200)}...</p>
                                        </div>

                                        {/* --- Order Details --- */}
                                        <div className="mb-6 pb-4 border-b border-gray-100">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                                                <Package className="h-5 w-5 mr-2 text-blue-500"/>
                                                Transaction Overview
                                            </h3>
                                            <div className="space-y-3">
                                                <DetailItem icon={DollarSign} label="Total Amount"
                                                            value={formatPrice(order.totalAmount)}
                                                            color="text-green-600 font-bold"/>
                                                <DetailItem icon={Box} label="Quantity" value={order.quantity}/>
                                                <DetailItem icon={Calendar} label="Ordered Date"
                                                            value={formatISOTime(order.dateOrdered, 'datetime')}/>
                                                <DetailItem icon={Clock} label="Delivery Time"
                                                            value={`${order.expectedDeliveryDays} days`}/>
                                                <DetailItem icon={Calendar} label="Invoice ID" value={order.invoiceId}/>

                                                {/* Trạng thái được làm nổi bật hơn */}
                                                {/*    <div className="flex justify-between items-center text-sm pt-2">*/}
                                                {/*        <div className="flex items-center text-gray-600">*/}
                                                {/*<span className="h-4 w-4 mr-2 text-gray-500">*/}
                                                {/*    <User className="h-4 w-4 text-gray-500"/>*/}
                                                {/*</span>*/}
                                                {/*            Status*/}
                                                {/*        </div>*/}
                                                {/*        <span*/}
                                                {/*            className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs uppercase">*/}
                                                {/*            {order.status}*/}
                                                {/*        </span>*/}
                                                {/*    </div>*/}
                                            </div>
                                        </div>

                                        {/* --- Buyer Info (Seller) --- */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                                                <User className="h-5 w-5 mr-2 text-indigo-500"/>
                                                Seller Information
                                            </h3>
                                            {/* Sử dụng component gốc: Avatar */}
                                            <div
                                                className="flex items-center gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                                <Avatar src={order.sellerPicture} username={order.sellerUsername}
                                                        size={42}/>
                                                <div>
                                                    <Link href={`/${order.sellerUsername}`}>
                                                        <p className="text-md font-bold text-gray-800 hover:underline">{order.sellerUsername}</p>
                                                    </Link>
                                                    <p className="text-xs text-indigo-600">The service provider</p>
                                                </div>
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
    } catch (error) {
        if (isRedirectError(error)) throw error;
        <ServerComponentError error={error}/>
    }
}