'use client';

import Image from "next/image";
import {Star, Package, Tag, Clock, DollarSign, Info} from "lucide-react";
import {IGigDocument} from "@/types/gig";
import {formatPrice, fromSlug} from "@/lib/utils/helper";
import clsx from "clsx";
import {ReviewList} from "@/components/features/review/ReviewList";
import React from "react";

interface SellerGigDetailProps {
    gig: IGigDocument;
}

export default function SellerGigDetail({gig}: SellerGigDetailProps) {
    const rating =
        gig.ratingSum && gig.ratingsCount ? gig.ratingSum / gig.ratingsCount : 0;

    const statusLabel = gig.isDeleted ? "Deleted" : gig.active ? "Active" : "Draft";
    const statusColor = clsx(
        "px-2 py-1 rounded-full font-medium text-xs",
        gig.isDeleted && "bg-red-100 text-red-700",
        gig.active && !gig.isDeleted && "bg-green-100 text-green-700",
        !gig.active && !gig.isDeleted && "bg-gray-100 text-gray-600"
    );

    return (
        <div className="w-full flex flex-col lg:flex-row bg-white rounded-xl shadow-sm border border-gray-100">
            {/* LEFT: Cover + Summary */}
            <div className="lg:w-[40%] w-full flex-shrink-0 bg-gray-50 p-4">
                <div className="lg:sticky lg:top-4">
                    <div
                        className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 flex justify-center items-center">
                        {gig.coverImage ? (
                            <Image
                                src={gig.coverImage}
                                alt={gig.title}
                                width={1280}
                                height={720}
                                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

                            />
                        ) : (
                            <span className="text-gray-400 text-sm flex items-center gap-1">
            <Info className="w-4 h-4"/> No cover image
          </span>
                        )}
                    </div>

                    <div className="w-full mt-4 text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 break-words">{gig.title}</h2>
                        <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-600">
                            <span className={statusColor}>{statusLabel}</span>
                            <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-gray-900 fill-gray-900"/>
                                {rating.toFixed(1)} ({gig.ratingsCount || 0})
          </span>
                            <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400"/>
                                {gig.expectedDeliveryDays} day{gig.expectedDeliveryDays !== 1 ? "s" : ""}
          </span>
                            <span className="flex items-center gap-1 font-semibold text-gray-900">
            {formatPrice(gig.price)}
          </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Scrollable Details */}
            <div className="flex-1 px-6 py-6 space-y-6">
                {/* Description */}
                <Section title="Description">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {gig.description || "No description provided."}
                    </p>
                </Section>

                {/* Category */}
                <Section icon={<Package className="w-4 h-4"/>} title="Category">
                    <p className="text-gray-800">{fromSlug(gig.categories)}</p>
                    {gig.subCategories?.length > 0 && (
                        <ul className="list-disc list-inside text-gray-800 space-y-1 mt-1">
                            {gig.subCategories.map((sub, idx) => (
                                <li key={idx}>
                                    <span className="text-gray-500">{fromSlug(sub)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>

                {/* Tags */}
                {gig.tags?.length > 0 && (
                    <Section icon={<Tag className="w-4 h-4 text-gray-500"/>} title="Tags">
                        <div className="flex flex-wrap gap-2 mt-1">
                            {gig.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="bg-blue-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100 hover:bg-primary-100 transition"
                                >
                                  {tag}
                                </span>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Requirements */}
                <Section title="Requirements">
                    {gig.requirements?.length ? (
                        <ul className="list-disc list-inside text-base text-gray-700 space-y-1">
                            {gig.requirements.map((req, idx) => (
                                <li key={idx}>
                                    {req.question}{" "}
                                    {req.hasFile && <span className="text-gray-500">(File required)</span>}{" "}
                                    {!req.required && <span className="text-gray-500">(Optional)</span>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 text-sm">No requirements specified.</p>
                    )}
                </Section>

                <Section title="Reviews">
                    <ReviewList params={{gigId: gig._id, targetId: gig.sellerId}} totalCount={gig.ratingsCount!}/>
                </Section>
            </div>
        </div>
    );
}

/* --- Section Component for Clean Structure --- */
function Section({
                     title,
                     icon,
                     children,
                 }: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            {children}
        </section>
    );
}
