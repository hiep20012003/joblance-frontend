'use client';

import React, {FormEvent, useCallback, useState} from 'react';
import {Award, Briefcase, CheckCircle, Star, User} from 'lucide-react';
import {useRouter} from "next/navigation";
import {
    useDirectValidation,
    ValidationFlattenErrors,
    ValidationTreeifyErrors
} from "@/lib/hooks/useValidation";
import {
    SellerCreatePayload,
    sellerCreateSchema
} from "@/lib/schemas/seller.schema";
import {ISellerDocument} from "@/types/seller";

import SellerCertificateForm from "@/components/features/seller/SellerCertificateForm";
import SellerEducationForm from "@/components/features/seller/SellerEducationForm";
import SellerSkillForm from "@/components/features/seller/SellerSkillForm";
import SellerBasicInfoForm from "@/components/features/seller/SellerBasicInfoForm";
import SellerExperienceForm from "@/components/features/seller/SellerExperienceForm";
import {useUserContext} from "@/context/UserContext";
import {useToast} from "@/context/ToastContext";
import {createSellerProfile} from "@/lib/services/client/seller.client";
import {parseFetchError} from "@/lib/utils/helper";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {useSession} from "next-auth/react";

/**
 * Seller Registration Page - Professional Fiverr-style design
 * -----------------------------------------------------------
 * Clean layout, clear UX guidance, helpful tooltips and helper text
 * - Each section represents a meaningful step in the seller onboarding
 * - All fields include a short description to help the user understand what to fill
 */
export default function SellerRegistrationForm() {
    const router = useRouter();

    const {setSeller} = useUserContext()
    const {data: session, update: updateSession} = useSession()

    const {addToastByStatus, addToastByType} = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<SellerCreatePayload>({
        fullName: '',
        description: '',
        oneliner: '',
        socialLinks: [],
        responseTime: 0,
        skills: [],
        languages: [{language: '', level: ''}],
        experience: [],
        education: [],
        certificates: [],
    });

    const {parse} = useDirectValidation(sellerCreateSchema);
    const [errors, setErrors] = useState<{
        flat: ValidationFlattenErrors;
        tree: ValidationTreeifyErrors<ISellerDocument>;
    }>({flat: {}, tree: {}});

    const updateFormData = useCallback(
        <K extends keyof ISellerDocument>(field: K, value: ISellerDocument[K]) => {
            setFormData(prev => ({...prev, [field]: value}));
        },
        []
    );

    /** Validate all fields before submit */
    const validateAll = (): boolean => {
        const {errors: flatErrors, treeifyError} = parse(formData);
        setErrors({
            flat: flatErrors ?? {},
            tree: treeifyError as ValidationTreeifyErrors<ISellerDocument>
        });
        return !flatErrors || Object.keys(flatErrors).length === 0;
    };

    /** Submit seller registration */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateAll()) {
            addToastByType("Please fix the errors before submitting.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createSellerProfile(formData);

            setSeller(result?.seller as ISellerDocument ?? null)
            const user = session?.user;
            await updateSession({...session, user: {...user, roles: user?.roles?.push('seller')}})
            addToastByType("Profile created successfully!", "success");

            router.replace('/become-seller/success');
        } catch (err) {
            const {status, data} = parseFetchError(err);
            addToastByStatus(data.message, status);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <LoadingWrapper isLoading={isSubmitting} fullScreen zIndex={9999}>
            <form onSubmit={handleSubmit} className="container mx-auto p-6">
                {/* Grid container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT COLUMN */}
                    <div className="flex flex-col gap-6">
                        {/* BASIC INFO */}
                        <section className="bg-white rounded-lg border p-6 shadow-sm">
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                <User className="w-5 h-5 text-primary-600"/> Basic Information
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Provide your personal details and short bio. This helps clients know who you are.
                            </p>

                            <SellerBasicInfoForm
                                formData={formData}
                                updateFormData={updateFormData}
                                errors={errors.tree}
                            />
                        </section>

                        {/* EXPERIENCE */}
                        <section className="bg-white rounded-lg border p-6 shadow-sm">
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                <Briefcase className="w-5 h-5 text-primary-600"/> Work Experience
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Add relevant professional experience or freelance work history that builds credibility.
                            </p>

                            <SellerExperienceForm
                                formData={formData}
                                updateFormData={updateFormData}
                                errors={errors.tree}
                            />
                        </section>

                        {/* EDUCATION */}
                        <section className="bg-white rounded-lg border p-6 shadow-sm">
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                <Award className="w-5 h-5 text-primary-600"/> Education
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Include your educational background or certifications that enhance your expertise.
                            </p>

                            <SellerEducationForm
                                formData={formData}
                                updateFormData={updateFormData}
                                errors={errors.tree}
                            />
                        </section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex flex-col gap-6">
                        {/* SKILLS */}
                        <section className="bg-white rounded-lg border p-6 shadow-sm">
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-primary-600"/> Skills & Languages
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                List your top skills and languages. Clients will use these to find your services.
                            </p>

                            <SellerSkillForm
                                formData={formData}
                                updateFormData={updateFormData}
                                errors={errors.tree}
                            />
                        </section>

                        {/* CERTIFICATES */}
                        <section className="bg-white rounded-lg border p-6 shadow-sm">
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-primary-600"/> Certifications
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Showcase any professional certifications or awards that validate your skills.
                            </p>

                            <SellerCertificateForm
                                formData={formData}
                                updateFormData={updateFormData}
                                errors={errors.tree}
                            />
                        </section>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type={'submit'}
                        disabled={isSubmitting}
                        className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-md px-6 py-2"
                    >
                        {isSubmitting ? "Saving..." : "Save & Continue"}
                    </button>
                </div>

                <p className="text-xs text-gray-400 mt-4 text-center">
                    By submitting this form, you confirm that the information provided is accurate and complete.
                    Your profile will be visible to potential clients upon approval.
                </p>
            </form>
        </LoadingWrapper>
    );
}
