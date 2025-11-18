'use client'

import {useEffect, useRef, useState} from "react";
import BuyerProfileCard from "@/components/features/buyer/BuyerProfileCard";
import BuyerProfileForm, {BuyerProfileFormHandles} from "@/components/features/buyer/BuyerProfileForm";
import {IBuyerDocument} from "@/types/buyer";
import {useUserContext} from "@/context/UserContext";
import LoadingWrapper from "@/components/shared/LoadingWrapper";

interface BuyerProfileManagerProps {
    data: IBuyerDocument | null;
}

export default function BuyerProfileManager({data}: BuyerProfileManagerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const formRef = useRef<BuyerProfileFormHandles>(null);
    const [loading, setLoading] = useState(false);

    const {setBuyer, buyer} = useUserContext();

    useEffect(() => {
        setBuyer(data);
    }, [data, setBuyer]);

    const handleSaveClick = () => {
        formRef.current?.submitForm();
    }
    const handleCancelClick = () => {
        formRef.current?.resetForm();
        setIsEditing(false);
    };

    if (!buyer) {
        return (
            <div className="h-[80vh] container mx-auto flex flex-col items-center justify-center bg-background p-6">
                <p className="text-gray-500 text-lg">No buyer profile available.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 container mx-auto p-6 bg-background">
            {/* Grid container */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(300px,1fr)_2fr] gap-8">
                {/* Buyer Card */}
                <BuyerProfileCard
                    className="w-full"
                    buyer={buyer}
                    onEdit={() => setIsEditing(true)}
                    isEditing={isEditing}
                />

                {/* Profile Form */}
                <LoadingWrapper isLoading={loading}
                                className={"border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col"}
                >
                    {/* Header */}
                    <div
                        className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {isEditing ? "Edit Profile" : "Profile Details"}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {isEditing
                                    ? "Update your personal information below"
                                    : "View your profile information"}
                            </p>
                        </div>

                        {isEditing && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancelClick}
                                    className="btn btn-soft text-gray-600 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveClick}
                                    className="btn text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </div>

                    <BuyerProfileForm
                        onLoading={(loading) => setLoading(loading)}
                        showButtons={false}
                        ref={formRef}
                        className="flex-1 p-6"
                        buyer={buyer}
                        readOnly={!isEditing}
                        onSubmit={() => setIsEditing(false)}
                        onCancel={() => setIsEditing(false)}
                    />
                </LoadingWrapper>
            </div>
        </div>
    );
}
