'use client';

import FormLabel from "@/components/shared/FormLabel";
import Input from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import {Trash2, Plus} from "lucide-react";
import {
    ISellerDocument,
    ICertificate,
} from "@/types/seller";
import {ValidationTreeifyErrors} from "@/lib/hooks/useValidation";

interface SellerCertificateFormProps {
    formData: ISellerDocument;
    updateFormData: (field: keyof ISellerDocument, value: never) => void;
    readOnly?: boolean;
    errors?: ValidationTreeifyErrors<ISellerDocument>;
}

export default function SellerCertificateForm({
                                                  formData,
                                                  updateFormData,
                                                  readOnly = false,
                                                  errors,
                                              }: SellerCertificateFormProps) {
    const addCertificate = () => {
        if (readOnly) return;
        const updated = [...formData.certificates, {name: "", year: "", from: ""}];
        updateFormData("certificates", updated as never);
    };

    const updateCertificate = (
        index: number,
        field: keyof ICertificate,
        value: never
    ) => {
        if (readOnly) return;
        const updated = formData.certificates.map((cert, i) =>
            i === index ? {...cert, [field]: value} : cert
        );
        updateFormData("certificates", updated as never);
    };

    const removeCertificate = (index: number) => {
        if (readOnly) return;
        const updated = formData.certificates.filter((_, i) => i !== index);
        updateFormData("certificates", updated as never);
    };

    return (
        <div className="w-full max-w-lg h-full flex flex-col">
            <div className="min-h-0 overflow-y-auto scrollbar-beautiful space-y-2">
                {formData.certificates.map((cert, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 shadow-sm bg-white"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-semibold text-gray-500">
                                Certificate #{index + 1}
                            </span>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => removeCertificate(index)}
                                    className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-2">
                            {/* Certificate Name */}
                            <div className="sm:col-span-2">
                                <FormLabel className="text-xs" label="Certificate Name"/>
                                <Textarea
                                    rows={1}
                                    readOnly={readOnly}
                                    value={cert.name}
                                    onChange={(e) =>
                                        updateCertificate(index, "name", e.target.value as never)
                                    }
                                    placeholder="e.g. AWS Certified Developer"
                                    className="text-sm"
                                    error={
                                        errors?.properties?.certificates?.items?.[index]?.properties
                                            ?.name?.errors[0]
                                    }
                                    maxLength={100}
                                />
                            </div>

                            {/* Year */}
                            <div>
                                <FormLabel className="text-xs" label="Year"/>
                                <Input
                                    readOnly={readOnly}
                                    type="number"
                                    value={cert.year}
                                    onChange={(e) =>
                                        updateCertificate(
                                            index,
                                            "year",
                                            (parseInt(e.target.value) || "") as never
                                        )
                                    }
                                    placeholder="YYYY"
                                    className="text-sm"
                                    error={
                                        errors?.properties?.certificates?.items?.[index]?.properties
                                            ?.year?.errors[0]
                                    }
                                />
                            </div>

                            {/* Issued By */}
                            <div className="sm:col-span-3">
                                <FormLabel className="text-xs" label="Issued By"/>
                                <Textarea
                                    rows={1}
                                    readOnly={readOnly}
                                    value={cert.from}
                                    onChange={(e) =>
                                        updateCertificate(index, "from", e.target.value as never)
                                    }
                                    placeholder="e.g. Amazon Web Services"
                                    className="text-sm"
                                    error={
                                        errors?.properties?.certificates?.items?.[index]?.properties
                                            ?.from?.errors[0]
                                    }
                                    maxLength={150}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!readOnly && (
                <div
                    className={
                        formData.certificates.length > 0 ? "mt-2 flex-shrink-0" : "flex-shrink-0"
                    }
                >
                    <button
                        type="button"
                        onClick={addCertificate}
                        className="cursor-pointer w-full py-2 text-xs border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500"
                    >
                        + Add Another
                    </button>
                </div>
            )}

            {errors?.properties?.certificates?.errors[0] && (
                <p
                    id="certificates-error"
                    className="text-error-500 text-sm mt-2 flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {errors.properties.certificates.errors[0]}
                </p>
            )}
        </div>
    );
}
