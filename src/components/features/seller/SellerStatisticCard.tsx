// components/StatsPills.tsx
'use client'

import {DollarSign, CheckCircle, Briefcase, XCircle, Package, TrendingUp} from "lucide-react"
import {ISellerDocument} from "@/types/seller"
import {formatPrice} from "@/lib/utils/helper";

export default function StatsPills({seller}: { seller: ISellerDocument }) {
    const {
        totalEarnings = 0,
        completedJobs = 0,
        ongoingJobs = 0,
        cancelledJobs = 0,
        totalGigs = 0,
        ratingsCount = 0,
        ratingSum = 0
    } = seller;

    const avg = ratingsCount > 0 ? (ratingSum / ratingsCount).toFixed(1) : "N/A";

    const pills = [
        {
            Icon: DollarSign,
            bg: "bg-blue-100",
            color: "text-blue-700",
            value: `${formatPrice(totalEarnings)}`,
            label: "Total Earnings"
        },
        {Icon: CheckCircle, bg: "bg-green-100", color: "text-green-700", value: completedJobs, label: "Completed Jobs"},
        {Icon: Briefcase, bg: "bg-indigo-100", color: "text-indigo-700", value: ongoingJobs, label: "Ongoing Jobs"},
        {Icon: XCircle, bg: "bg-red-100", color: "text-red-700", value: cancelledJobs, label: "Cancelled Jobs"},
        {Icon: Package, bg: "bg-purple-100", color: "text-purple-700", value: totalGigs, label: "Total Gigs"},
        {Icon: TrendingUp, bg: "bg-teal-100", color: "text-teal-700", value: avg, label: "Avg. Rating"},
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pills.map(({Icon, bg, color, value, label}) => (
                <div
                    key={label}
                    className="bg-white rounded-lg px-3 py-2.5 flex items-center gap-2 border border-gray-100 shadow-sm hover:shadow transition"
                >
                    <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${color}`}/>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-gray-600 font-medium truncate">{label}</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
