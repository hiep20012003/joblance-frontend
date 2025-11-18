'use client'

import {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from "react";
import clsx from "clsx";
import FormLabel from "@/components/shared/FormLabel";
import Input from "@/components/shared/Input";
import DropdownInput from "@/components/shared/DropdownInput";
import {countries, getCountryCode, getCountryData, TCountryCode} from "countries-list";
import {IBuyerDocument} from "@/types/buyer";
import {useValidation} from "@/lib/hooks/useValidation";
import {updateProfileSchema} from "@/lib/schemas/buyer.schema";
import {capitalizeWords} from "@/lib/utils/helper";
import {updateProfile} from "@/lib/services/client/buyer.client";
import {useUserContext} from "@/context/UserContext";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";

export interface BuyerProfileFormHandles {
    submitForm: () => void;
    resetForm: () => void;
}

interface BuyerProfileFormProps {
    buyer: IBuyerDocument | null;
    readOnly?: boolean;
    className?: string;
    onSubmit?: (data?: IBuyerDocument) => void;
    onCancel?: () => void;
    onLoading?: (loading: boolean) => void;
    showButtons?: boolean;
}

const BuyerProfileForm = forwardRef<BuyerProfileFormHandles, BuyerProfileFormProps>(
    ({buyer, readOnly = false, className, onSubmit, onCancel, onLoading, showButtons = true}, ref) => {
        const [validate, errors] = useValidation(updateProfileSchema);
        const {setBuyer} = useUserContext();

        const [formData, setFormData] = useState<IBuyerDocument>({
            username: "",
            email: "",
            sex: "",
            country: "",
            ...buyer,
        });

        const countriesName = useMemo(() => Object.values(countries)
                .map(c => c.name)
                .sort((a, b) => a.localeCompare(b)),
            []
        );

        const updateFormData = (field: keyof IBuyerDocument, value: string) => {
            setFormData(prev => ({...prev, [field]: value}));
        };

        const selectedGender = useMemo(
            () => formData.sex ? {label: capitalizeWords(formData.sex), value: formData.sex} : null,
            [formData.sex]
        );

        const selectedCountry = useMemo(
            () => formData.country ? {
                label: getCountryData(formData.country as TCountryCode)?.name,
                value: formData.country
            } : null,
            [formData.country]
        );

        const {mutate, loading: submitting} = useFetchMutation(
            updateProfile,
            {
                redirectOnUnauthorized: true,
                successMessage: 'Profile updated successfully',
                onSuccess: async (result) => {
                    const updatedBuyer = result as IBuyerDocument;
                    setBuyer(updatedBuyer);
                    if (onSubmit) onSubmit(updatedBuyer);
                },
            }
        );

        useEffect(() => {
            onLoading?.(submitting);
        }, [onLoading, submitting]);

        const submitForm = async () => {
            if (!validate({
                country: formData.country as string,
                sex: formData.sex as 'male' | 'female' | 'other'
            })) return;

            const formDataToSend = new FormData();
            formDataToSend.append("sex", formData.sex ?? "");
            formDataToSend.append("country", formData.country ?? "");

            await mutate({id: buyer?._id ?? '', formData: formDataToSend});
        };

        const resetForm = () => {
            setFormData({
                username: "",
                email: "",
                sex: "",
                country: "",
                ...buyer
            });
            if (onCancel) onCancel();
        };

        useImperativeHandle(ref, () => ({
            submitForm,
            resetForm,
        }));

        return (
            <form className={clsx("bg-transparent flex flex-col gap-4 p-6", className)}>
                {/* Username */}
                <div>
                    <FormLabel label="Username"/>
                    <Input
                        type="text"
                        value={formData.username || ""}
                        onChange={e => updateFormData("username", e.target.value)}
                        placeholder="Enter your username"
                        readOnly={true}
                        className="text-sm"
                    />
                </div>

                {/* Email */}
                <div>
                    <FormLabel label="Email"/>
                    <Input
                        type="email"
                        value={formData.email || ""}
                        onChange={e => updateFormData("email", e.target.value)}
                        placeholder="Enter your email"
                        readOnly={true}
                        className="text-sm"
                    />
                </div>

                {/* Gender */}
                <div>
                    <FormLabel label="Gender"/>
                    <DropdownInput
                        options={[
                            {label: "Male", value: "male"},
                            {label: "Female", value: "female"},
                            {label: "Other", value: "other"},
                        ]}
                        value={selectedGender}
                        onChange={option => updateFormData("sex", option.value)}
                        placeholder="Select gender"
                        readOnly={readOnly}
                        error={errors?.sex?.[0]}
                        className="text-sm"
                    />
                </div>

                {/* Country */}
                <div>
                    <FormLabel label="Country"/>
                    <DropdownInput
                        options={countriesName.map(name => ({label: name, value: String(getCountryCode(name))}))}
                        value={selectedCountry}
                        onChange={option => updateFormData("country", option.value)}
                        placeholder="Select country"
                        readOnly={readOnly}
                        error={errors?.country?.[0]}
                        className="text-sm"
                    />
                </div>

                {/* Buttons submit/cancel */}
                {!readOnly && showButtons && (
                    <div className="flex gap-4 mt-4">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="btn btn-soft text-gray-600 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={submitForm}
                            className="btn text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        >
                            Save
                        </button>
                    </div>
                )}
            </form>
        );
    }
);

BuyerProfileForm.displayName = "BuyerProfileForm";

export default BuyerProfileForm;
