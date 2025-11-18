"use client";

import {IOrderDocument} from "@/types/order";
import {useUserContext} from "@/context/UserContext";
import clsx from "clsx";
import Link from "next/link";
import {Calendar, Clock, User, Tag, Download} from "lucide-react";
import {formatISOTime} from "@/lib/utils/time";
import {formatPrice} from "@/lib/utils/helper";
import {generateInvoicePDF} from "@/lib/pdf/invoiceGenerator"; // ⚡ import hàm mới

export default function OrderOverview({order}: { order: Required<IOrderDocument> }) {
    const {user} = useUserContext();
    const isSeller = Boolean(order.sellerId === user?.id);

    const downloadInvoice = () => {
        generateInvoicePDF(order);
    };

    return (
        <div className="p-4 md:p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className={clsx("flex flex-col md:flex-row gap-6 md:gap-8 justify-between items-start")}>
                <div className="w-full md:w-auto">
                    <h2 className="font-bold text-xl mb-1 text-gray-800">{order.gigTitle}</h2>
                    <p className="text-gray-600 text-sm font-medium mb-4">
                        Order number: <span className="font-mono text-gray-500">{order.invoiceId}</span>
                    </p>

                    <div className="text-sm flex flex-col gap-2 text-gray-700">
                        <p className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-gray-500"/>
                            <span>
                Status:
                <strong
                    className={`capitalize font-bold ml-1 order-status ${order.status.toLowerCase().replace('_', '-')} bg-transparent`}
                >
                  {order.status.toLowerCase().replace(/_/g, ' ')}
                </strong>
              </span>
                        </p>

                        <p className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500"/>
                            <span>
                {isSeller ? "Buyer: " : "Seller: "}
                                <Link
                                    className="text-primary-600 hover:underline font-semibold"
                                    href={
                                        isSeller
                                            ? `/${order.buyerUsername}`
                                            : `/${order.sellerUsername}`
                                    }
                                    prefetch
                                >
                  {isSeller ? order.buyerUsername : order.sellerUsername}
                </Link>
              </span>
                        </p>

                        <p className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500"/>
                            <span>
                Ordered:
                <strong className="font-medium text-gray-800">
                  {" "}
                    {formatISOTime(order.dateOrdered, "month_day_year")}
                </strong>
              </span>
                        </p>

                        <p className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-500"/>
                            <span>
                Expected Delivery:
                <strong className="font-medium text-gray-800">
                  {" "}
                    {formatISOTime(order.expectedDeliveryDate, "month_day_year")}
                </strong>
              </span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-start md:items-end justify-start w-full md:w-auto min-w-[150px]">
                    {!isSeller ? (
                        <>
                            <h3 className="uppercase font-bold text-xs text-gray-500 mb-1">TOTAL PAID</h3>
                            <p className="uppercase font-extrabold text-2xl text-gray-900">
                                {formatPrice(order.totalAmount)}
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="uppercase font-bold text-xs text-gray-500 mb-1">EARNINGS</h3>
                            <p className="uppercase font-extrabold text-2xl text-gray-900">
                                {formatPrice(order.totalAmount - order.serviceFee)}
                            </p>
                        </>
                    )}
                </div>
            </div>

            <hr className="my-4 border-gray-200"/>

            {/* Nút tải hóa đơn chỉ hiện với Buyer */}
            {!isSeller && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={downloadInvoice}
                        className="btn btn-soft text-primary-500"
                    >
                        <Download className="h-4 w-4"/>
                        Download Invoice
                    </button>
                </div>
            )}

            <div className="w-full overflow-x-auto scrollbar-beautiful">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.gigTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {order.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {order.expectedDeliveryDays}{" "}
                            days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {formatPrice(order.totalAmount - order.serviceFee)}
                        </td>
                    </tr>

                    {!isSeller && (
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                JobLance Service Fee
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                -
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                -
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                {formatPrice(order.serviceFee)}
                            </td>
                        </tr>
                    )}

                    <tr>
                        <td
                            colSpan={3}
                            className="px-6 py-4 whitespace-nowrap text-right text-base font-bold text-gray-900 border-t"
                        >
                            TOTAL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-base font-bold text-gray-900 border-t">
                            {isSeller
                                ? formatPrice(order.totalAmount - order.serviceFee)
                                : formatPrice(order.totalAmount)}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <hr className="my-4 border-gray-200"/>
        </div>
    );
}
