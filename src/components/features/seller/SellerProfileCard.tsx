'use client'

import {
    Globe,
    Calendar,
    Camera,
    CheckCircle,
    Eye,
    Mail
} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import Modal from "@/components/shared/Modal";
import clsx from "clsx";
import {useState} from "react";
import {ISellerDocument} from "@/types/seller";
import Link from "next/link";
import {useUserContext} from "@/context/UserContext";
import BuyerAvatarForm from "@/components/features/buyer/BuyerAvatarForm";
import {getCountryData, TCountryCode} from "countries-list";

interface SellerProfileCardProps {
    seller?: ISellerDocument | null;
    isEditing?: boolean;
    showViewButton?: boolean;
    className?: string;
}

export default function SellerProfileCard({
                                              seller,
                                              className,
                                              showViewButton = true
                                          }: SellerProfileCardProps) {
    const {user} = useUserContext();
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    if (!seller) {
        return (
            <div
                className={clsx(
                    "flex justify-center items-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 transition-shadow",
                    className
                )}
            >
                <p className="text-gray-500 text-sm sm:text-base">No seller data available</p>
            </div>
        );
    }

    const joinedDate = seller.createdAt
        ? new Date(seller.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : null;

    const canEdit = user?.id && user.id === seller._id;

    return (
        <div
            className={clsx(
                "bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-8 flex flex-col items-center transition-shadow",
                className
            )}
        >
            {/* Avatar + FullName + Username */}
            <div className="flex flex-col items-center relative text-center">
                <div className="relative group">
                    <Avatar
                        className="border-2 border-primary-500"
                        username={seller.username!}
                        src={user?.profilePicture ?? ''}
                        size={128}
                    />

                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => setIsAvatarModalOpen(true)}
                            className="absolute inset-0 btn bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                            title="Change Avatar"
                        >
                            <Camera className="w-6 h-6 text-white"/>
                        </button>
                    )}
                </div>

                <h2 className="text-2xl font-semibold text-gray-900 mt-3 flex items-center gap-2">
                    {seller.fullName || "Unnamed Seller"}
                    {user?.isVerified && <CheckCircle className="w-5 h-5 text-blue-500"/>}
                </h2>

                {seller.username && (
                    <p className="text-base text-gray-500 font-medium mt-1">
                        @{seller.username}
                    </p>
                )}
            </div>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-5"/>

            {/* Basic Info */}
            <div className="w-full space-y-4 text-gray-800 text-sm">
                {seller.email && (
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400"/>
                        <span>
                            Contact <span className="font-semibold">{seller.email}</span>
                        </span>
                    </div>
                )}

                {seller.country && (
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-400"/>
                        <span>
                            Located in <span
                            className="font-semibold">{getCountryData(seller.country as TCountryCode).name}</span>
                        </span>
                    </div>
                )}

                {joinedDate && (
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400"/>
                        <span>
                            Joined <span className="font-semibold">{joinedDate}</span>
                        </span>
                    </div>
                )}
            </div>

            {showViewButton && (
                <div className="flex flex-col gap-3 w-full">
                    <div className="w-full border-t border-gray-200 mt-5 mb-2"/>
                    <Link
                        href={`/sellers/${seller.username}/edit`}
                        className="btn btn-soft text-gray-800 py-3 gap-2"
                    >
                        <Eye className="w-4 h-4"/>
                        View profile
                    </Link>
                </div>
            )}

            {/* Avatar modal */}
            <Modal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                className="max-w-168 w-full rounded-xl"
                backdropClassName="bg-black/30"
            >
                <BuyerAvatarForm
                    onClose={() => setIsAvatarModalOpen(false)}
                    initialImageUrl={user?.profilePicture ?? ''}
                />
            </Modal>
        </div>
    );
}
