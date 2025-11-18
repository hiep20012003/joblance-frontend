'use client';

import {Globe, Calendar, User, Edit, Lock, Camera, Mail} from 'lucide-react';
import Avatar from '@/components/shared/Avatar';
import BuyerAvatarForm from '@/components/features/buyer/BuyerAvatarForm';
import ChangePasswordForm from '@/components/features/auth/ChangePasswordForm';
import Modal from '@/components/shared/Modal';
import {IBuyerDocument} from '@/types/buyer';
import {useUserContext} from "@/context/UserContext";
import {useMemo, useState} from 'react';
import {usePathname} from 'next/navigation';
import clsx from 'clsx';
import {capitalizeWords} from '@/lib/utils/helper';
import {getCountryData, TCountryCode} from "countries-list";

interface BuyerProfileCardProps {
    buyer?: IBuyerDocument | null;
    onEdit?: () => void;
    isEditing?: boolean;
    className?: string;
}

export default function BuyerProfileCard({
                                             buyer,
                                             onEdit,
                                             isEditing = false,
                                             className,
                                         }: BuyerProfileCardProps) {
    const {user} = useUserContext();
    const pathname = usePathname();
    const showEditButton = useMemo(
        () => user?.id === buyer?._id && pathname.startsWith(`/users/${user?.username}/buying`),
        [buyer?._id, pathname, user?.id, user?.username]
    );

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    if (!buyer) {
        return (
            <div className={clsx(
                'flex justify-center items-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 transition-shadow',
                className
            )}>
                <p className="text-gray-500 text-sm sm:text-base">No buyer data available</p>
            </div>
        );
    }

    const joinedDate = buyer.createdAt
        ? new Date(buyer.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : null;

    const canEdit = user?.id && user?.id === buyer._id;

    return (
        <div className={clsx(
            'bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 flex flex-col items-center transition-shadow',
            className
        )}>
            <div className="relative w-32 h-32 group">
                <Avatar
                    className="border-2 border-primary-500 rounded-full"
                    username={buyer.username || 'Unnamed Buyer'}
                    src={buyer.profilePicture ?? ''}
                    size={128} // 128px
                />

                {canEdit && showEditButton && (
                    <button
                        type="button"
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="btn absolute inset-0 w-32 h-32 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        title="Change Avatar"
                    >
                        <Camera className="w-6 h-6 text-white"/>
                    </button>
                )}
            </div>


            {/* Username */}
            <p className="mt-2 font-semibold text-center text-base sm:text-lg truncate max-w-full">
                {buyer.username || 'Unnamed Buyer'}
            </p>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 my-4"/>

            {/* Info Section */}
            <div className="w-full space-y-3 text-gray-800 text-sm overflow-x-auto">
                {buyer.email && (
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Mail className="w-5 h-5 text-gray-400 flex-shrink-0"/>
                        <span className="truncate break-words max-w-full">
              Contact <span className="font-semibold">{buyer.email}</span>
            </span>
                    </div>
                )}
                {buyer.country && (
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Globe className="w-5 h-5 text-gray-400 flex-shrink-0"/>
                        <span className="truncate break-words max-w-full">
                          Located in <span
                            className="font-semibold">{getCountryData(buyer.country as TCountryCode).name}</span>
            </span>
                    </div>
                )}
                {buyer.sex && (
                    <div className="flex items-center gap-2 sm:gap-3">
                        <User className="w-5 h-5 text-gray-400 flex-shrink-0"/>
                        <span>
              Gender: <span className="font-semibold">{capitalizeWords(buyer.sex)}</span>
            </span>
                    </div>
                )}
                {joinedDate && (
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0"/>
                        <span>
              Joined in <span className="font-semibold">{joinedDate}</span>
            </span>
                    </div>
                )}
            </div>

            {/* Buttons */}
            {canEdit && showEditButton && (
                <div className="flex flex-col gap-2 sm:gap-3 w-full mt-4">
                    <div className="w-full border-t border-gray-200 mt-2 mb-2"/>
                    <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        disabled={isEditing}
                        className="btn btn-soft flex items-center gap-2"
                    >
                        <Lock className="w-4 h-4"/>
                        Change Password
                    </button>
                    <button
                        onClick={onEdit}
                        disabled={isEditing}
                        className="btn bg-primary-500 hover:bg-primary-600 text-white flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4"/>
                        {isEditing ? 'Editing...' : 'Edit Profile'}
                    </button>
                </div>
            )}

            {/* Modals */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                className="max-w-168 w-full rounded-xl max-h-[80vh] overflow-y-auto"
                backdropClassName="bg-black/30"
            >
                <ChangePasswordForm onClose={() => setIsPasswordModalOpen(false)}/>
            </Modal>

            <Modal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                className="max-w-168 w-full rounded-xl max-h-[80vh] overflow-y-auto"
                backdropClassName="bg-black/30"
            >
                <BuyerAvatarForm
                    onClose={() => setIsAvatarModalOpen(false)}
                    initialImageUrl={buyer.profilePicture ?? ''}
                />
            </Modal>
        </div>
    );
}
