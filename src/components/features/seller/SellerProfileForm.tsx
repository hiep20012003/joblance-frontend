'use client';

import {useCallback, useEffect, useState} from "react";
import {
    Award, Briefcase, CheckCircle, Edit3, Eye, Star, User
} from "lucide-react";
import Link from "next/link";
import {
    useDirectValidation,
    ValidationFlattenErrors,
    ValidationTreeifyErrors
} from "@/lib/hooks/useValidation";
import {
    SellerUpdatePayload,
    sellerUpdateSchema
} from "@/lib/schemas/seller.schema";
import {ISellerDocument} from "@/types/seller";
import SellerSkillForm from "@/components/features/seller/SellerSkillForm";
import SellerCertificateForm from "@/components/features/seller/SellerCertificateForm";
import SellerBasicInfoForm from "@/components/features/seller/SellerBasicInfoForm";
import SellerExperienceForm from "@/components/features/seller/SellerExperienceForm";
import SellerEducationForm from "@/components/features/seller/SellerEducationForm";
import SellerProfileCard from "@/components/features/seller/SellerProfileCard";
import ReactPortal from "@/components/shared/ReactPortal";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {useUserContext} from "@/context/UserContext";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {useToast} from "@/context/ToastContext";
import {updateSellerProfile} from "@/lib/services/client/seller.client";

interface SellerProfileFormProps {
    data: ISellerDocument;
}

export default function SellerProfileForm({data}: SellerProfileFormProps) {
    const {addToastByType} = useToast();
    const {setSeller, seller} = useUserContext();

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<SellerUpdatePayload>({
        fullName: data?.fullName || "",
        description: data?.description || "",
        oneliner: data?.oneliner || "",
        socialLinks: data?.socialLinks || [],
        responseTime: data?.responseTime || 1,
        skills: data?.skills || [],
        languages: data?.languages || [{language: "", level: ""}],
        experience: data?.experience || [],
        education: data?.education || [],
        certificates: data?.certificates || []
    });

    const {parse} = useDirectValidation(sellerUpdateSchema);
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

    const validateAll = (): boolean => {
        const {errors: flatErrors, treeifyError} = parse(formData);
        setErrors({
            flat: flatErrors ?? {},
            tree: treeifyError as ValidationTreeifyErrors<ISellerDocument>
        });
        return !flatErrors || Object.keys(flatErrors).length === 0;
    };

    const {mutate: saveSeller, loading: isUpdating} = useFetchMutation(
        (formData: SellerUpdatePayload) => updateSellerProfile(seller?._id ?? '', formData),
        {
            successMessage: "Profile updated successfully",
            redirectOnUnauthorized: true,
            onSuccess: (result) => {
                setSeller(result ?? null);
                setEditMode(false);
            }
        });

    const handleSave = async () => {
        if (!validateAll()) {
            addToastByType("Please fix the errors before saving.", "error");
            return;
        }

        await saveSeller(formData);
    };

    const handleCancel = () => {
        setFormData({
            fullName: seller?.fullName || "",
            description: seller?.description || "",
            oneliner: seller?.oneliner || "",
            socialLinks: seller?.socialLinks || [],
            responseTime: seller?.responseTime || 1,
            skills: seller?.skills || [],
            languages: seller?.languages || [{language: "", level: ""}],
            experience: seller?.experience || [],
            education: seller?.education || [],
            certificates: seller?.certificates || []
        });
        setErrors({flat: {}, tree: {}});
        setEditMode(false);
    };

    const [showPortal, setShowPortal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        setSeller(data);
    }, [data, setSeller]);

    useEffect(() => {
        if (editMode) {
            setShowPortal(true);
            setIsClosing(false);
        } else if (showPortal) {
            setIsClosing(true);
            const timer = setTimeout(() => setShowPortal(false), 300);
            return () => clearTimeout(timer);
        }
    }, [editMode, showPortal]);

    if (!data) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-gray-500 text-sm sm:text-base">
                    No seller data available
                </p>
            </div>
        );
    }

    return (
        <LoadingWrapper isLoading={isUpdating} fullScreen zIndex={9999}>
            <div className="container mx-auto flex flex-col gap-6 p-6 pb-12">
                {/* Header */}
                <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">Seller Profile</h1>
                        <p className="text-sm text-gray-500">Manage your profile and information</p>
                    </div>
                    <div className="flex gap-2">
                        {!editMode ? (
                            <>
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="btn gap-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    <Edit3 className="w-4 h-4"/>
                                    Edit
                                </button>
                                <Link
                                    href={`/${seller?.username}`}
                                    target="_blank"
                                    className="btn btn-outlined gap-2 text-gray-800"
                                >
                                    <Eye className="w-4 h-4"/>
                                    View Public Profile
                                </Link>
                            </>
                        ) : (
                            <span className="text-sm text-gray-500 italic">Editing Mode Active</span>
                        )}
                    </div>
                </div>

                {/* Desktop: Grid Layout - Chỉ hiển thị trên lg+ */}
                <div className="hidden lg:grid lg:grid-cols-[2fr_3fr] gap-6">
                    {/* LEFT COLUMN */}
                    <div className="flex flex-col gap-6">
                        <SellerProfileCard seller={seller} showViewButton={false}/>

                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-primary-600"/> Skills & Languages
                            </h2>
                            <SellerSkillForm
                                formData={formData}
                                updateFormData={updateFormData}
                                errors={errors.tree}
                                readOnly={!editMode}
                            />
                        </section>

                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-primary-600"/> Certifications
                            </h2>
                            <SellerCertificateForm
                                formData={formData}
                                updateFormData={updateFormData}
                                errors={errors.tree}
                                readOnly={!editMode}
                            />
                        </section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex flex-col gap-6">
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary-600"/> Basic Information
                            </h2>
                            <SellerBasicInfoForm
                                formData={formData}
                                updateFormData={updateFormData}
                                errors={errors.tree}
                                readOnly={!editMode}
                            />
                        </section>

                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary-600"/> Education
                            </h2>
                            <SellerEducationForm
                                formData={formData}
                                updateFormData={updateFormData}
                                errors={errors.tree}
                                readOnly={!editMode}
                            />
                        </section>

                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary-600"/> Experience
                            </h2>
                            <SellerExperienceForm
                                formData={formData}
                                updateFormData={updateFormData}
                                errors={errors.tree}
                                readOnly={!editMode}
                            />
                        </section>
                    </div>
                </div>

                {/* Mobile: Flex Layout - Chỉ hiển thị dưới lg */}
                <div className="grid grid-cols-1 -col lg:hidden gap-6">
                    <SellerProfileCard seller={seller} showViewButton={false}/>

                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary-600"/> Basic Information
                        </h2>
                        <SellerBasicInfoForm
                            formData={formData}
                            updateFormData={updateFormData}
                            errors={errors.tree}
                            readOnly={!editMode}
                        />
                    </section>

                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-primary-600"/> Skills & Languages
                        </h2>
                        <SellerSkillForm
                            formData={formData}
                            updateFormData={updateFormData}
                            errors={errors.tree}
                            readOnly={!editMode}
                        />
                    </section>

                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-primary-600"/> Education
                        </h2>
                        <SellerEducationForm
                            formData={formData}
                            updateFormData={updateFormData}
                            errors={errors.tree}
                            readOnly={!editMode}
                        />
                    </section>

                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary-600"/> Experience
                        </h2>
                        <SellerExperienceForm
                            formData={formData}
                            updateFormData={updateFormData}
                            errors={errors.tree}
                            readOnly={!editMode}
                        />
                    </section>

                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-primary-600"/> Certifications
                        </h2>
                        <SellerCertificateForm
                            formData={formData}
                            updateFormData={updateFormData}
                            errors={errors.tree}
                            readOnly={!editMode}
                        />
                    </section>
                </div>

                {/* FLOATING ACTION BAR */}
                {showPortal && (
                    <ReactPortal>
                        <div
                            className={`fixed bottom-0 left-0 right-0 z-50
                            ${isClosing ? "animate-slide-down" : "animate-slide-up"}
                            bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_10px_8px_rgba(0,0,0,0.05)] py-4 px-6`}
                        >
                            <div className="container mx-auto flex justify-end gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="btn btn-soft text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="btn text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </ReactPortal>
                )}
            </div>
        </LoadingWrapper>
    );
}
