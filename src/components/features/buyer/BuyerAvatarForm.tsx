'use client';

import {FormEvent, useState} from 'react';
import {useValidation} from '@/lib/hooks/useValidation';
import {useToast} from '@/context/ToastContext';
import {Camera} from 'lucide-react';
import LoadingWrapper from '@/components/shared/LoadingWrapper';
import {avatarSchema} from "@/lib/schemas/buyer.schema";
import {updateProfile} from "@/lib/services/client/buyer.client";
import {useUserContext} from "@/context/UserContext";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {SingleFileInput} from "@/components/shared/SingleFileInput";
import {useSession} from "next-auth/react";
import {BASE_MIMES, RENDERABLE_IMAGE_MIMES} from "@/lib/constants/constant";

type AvatarFormPayload = {
    profilePictureFile: File | null;
};

interface BuyerAvatarFormProps {
    initialImageUrl?: string;
    onClose?: () => void;
}

export default function BuyerAvatarForm({initialImageUrl = '', onClose}: BuyerAvatarFormProps) {
    const [avatarInfo, setAvatarInfo] = useState<AvatarFormPayload>({
        profilePictureFile: null,
    });

    const {data: session, update: updateSession} = useSession();

    const {user} = useUserContext();
    const {setUser, buyer, setBuyer, setSeller, seller} = useUserContext();

    const {addToastByStatus} = useToast();
    const [validate, errors] = useValidation(avatarSchema);

    const {mutate, loading: isLoading} = useFetchMutation(
        updateProfile,
        {
            redirectOnUnauthorized: true,
            successMessage: 'Avatar updated successfully',
            onSuccess: async (result) => {
                await updateSession({...session, user: {...user, profilePicture: result?.profilePicture as string}})
                setUser({...user, profilePicture: result?.profilePicture as string});
                setBuyer(result);
                setAvatarInfo({profilePictureFile: null});
                onClose?.();
            },
        }
    );

    const handleFileChange = (file: File | null) => {
        setAvatarInfo({profilePictureFile: file});
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate(avatarInfo)) return;

        const file = avatarInfo.profilePictureFile;
        if (!file) {
            addToastByStatus('No file selected', 400);
            return;
        }

        const formData = new FormData();
        formData.append('profilePictureFile', file);

        await mutate({id: user?.id ?? '', formData});
    };

    return (
        <><LoadingWrapper isLoading={isLoading} fullScreen/>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 max-w-md mx-auto relative p-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-primary-600"/>
                        Update Profile Picture
                    </h3>
                    <p className="text-sm text-gray-500">
                        Accepted formats: PNG, JPEG, WEBP. Max size: 5MB.
                    </p>
                </div>
                <div>
                    <SingleFileInput
                        id="profilePicture"
                        label="Profile Picture"
                        accept={BASE_MIMES.images.join(',')}
                        maxSizeMB={5}
                        defaultFileUrl={initialImageUrl}
                        onChange={handleFileChange}
                        error={errors?.profilePictureFile?.[0]}/>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={() => {
                            setAvatarInfo({profilePictureFile: null});
                            onClose?.();
                        }}
                        disabled={isLoading}
                        className="btn btn-soft text-gray-600 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                        Save
                    </button>
                </div>
            </form>
        </>
    );
}
