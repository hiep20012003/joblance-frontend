'use client';

import FormLabel from "@/components/shared/FormLabel";
import Input from "@/components/shared/Input";
import DropdownInput from "@/components/shared/DropdownInput";
import {Trash2} from "lucide-react";
import {IEducation, ISellerDocument} from "@/types/seller";
import {countries} from "countries-list";
import {ValidationTreeifyErrors} from "@/lib/hooks/useValidation";
import Textarea from "@/components/shared/Textarea";

interface SellerEducationFormProps {
    formData: ISellerDocument;
    updateFormData: (field: keyof ISellerDocument, value: never) => void;
    readOnly?: boolean;
    errors?: ValidationTreeifyErrors<ISellerDocument>;
}

export default function SellerEducationForm({
                                                formData,
                                                updateFormData,
                                                readOnly = false,
                                                errors,
                                            }: SellerEducationFormProps) {
    const countriesName = Object.entries(countries).map(([, value]) => value.name);

    const addEducation = () => {
        if (readOnly) return;
        const updated = [
            ...formData.education,
            {country: "", university: "", title: "", major: "", year: ""},
        ];
        updateFormData("education", updated as never);
    };

    const updateEducation = (index: number, field: keyof IEducation, value: never) => {
        if (readOnly) return;
        const updated = formData.education.map((edu, i) =>
            i === index ? {...edu, [field]: value} : edu
        );
        updateFormData("education", updated as never);
    };

    const removeEducation = (index: number) => {
        if (readOnly) return;
        const updated = formData.education.filter((_, i) => i !== index);
        updateFormData("education", updated as never);
    };

    return (
        <div className="w-full max-w-lg h-full flex flex-col gap-4">
            <div className="flex flex-col min-h-0">
                <div className="min-h-0 overflow-y-auto scrollbar-beautiful space-y-3">
                    {formData.education.map((edu, index) => (
                        <div key={index} className="p-4 border border-gray-300 rounded-lg space-y-2">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-semibold text-gray-500">Education #{index + 1}</span>

                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={() => removeEducation(index)}
                                        className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <FormLabel className={"text-xs"} label="Country"/>
                                    <DropdownInput
                                        readOnly={readOnly}
                                        options={countriesName.map((l) => ({label: l, value: l}))}
                                        value={edu.country ? {label: edu.country, value: edu.country} : null}
                                        onChange={(option) =>
                                            updateEducation(index, "country", option.value as never)
                                        }
                                        placeholder="Select Country"
                                        className="text-sm!"
                                        error={errors?.properties?.education?.items?.[index]?.properties?.country?.errors[0]}
                                    />
                                </div>
                                <div>
                                    <FormLabel className={"text-xs"} label="University"/>
                                    <Textarea
                                        rows={1}
                                        readOnly={readOnly}
                                        value={edu.university}
                                        onChange={(e) =>
                                            updateEducation(index, "university", e.target.value as never)
                                        }
                                        placeholder="University"
                                        className="px-3 py-1.5 text-sm"
                                        maxLength={100} // Limit university name to 100 characters
                                        error={errors?.properties?.education?.items?.[index]?.properties?.university?.errors[0]}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                    <FormLabel className={"text-xs"} label="Degree"/>
                                    <Textarea
                                        rows={1}
                                        readOnly={readOnly}
                                        value={edu.title}
                                        onChange={(e) =>
                                            updateEducation(index, "title", e.target.value as never)
                                        }
                                        placeholder="Degree"
                                        className="px-3 py-1.5 text-sm"
                                        maxLength={50} // Limit degree title to 50 characters
                                        error={errors?.properties?.education?.items?.[index]?.properties?.title?.errors[0]}
                                    />
                                </div>

                                <div>
                                    <FormLabel className={"text-xs"} label="Major"/>
                                    <Textarea
                                        rows={1}
                                        readOnly={readOnly}
                                        value={edu.major}
                                        onChange={(e) =>
                                            updateEducation(index, "major", e.target.value as never)
                                        }
                                        placeholder="Major"
                                        className="px-3 py-1.5 text-sm"
                                        maxLength={50} // Limit major to 50 characters
                                        error={errors?.properties?.education?.items?.[index]?.properties?.major?.errors[0]}
                                    />
                                </div>

                                <div>
                                    <FormLabel className={"text-xs"} label="Year"/>
                                    <Input
                                        readOnly={readOnly}
                                        type="number"
                                        value={edu.year}
                                        onChange={(e) =>
                                            updateEducation(
                                                index,
                                                "year",
                                                (parseInt(e.target.value) || 0) as never
                                            )
                                        }
                                        placeholder="Year"
                                        className="px-3 py-1.5 text-sm"
                                        error={errors?.properties?.education?.items?.[index]?.properties?.year?.errors[0]}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!readOnly && (
                    <div
                        className={
                            formData.education.length > 0 ? "mt-2 flex-shrink-0" : "flex-shrink-0"
                        }
                    >
                        <button
                            type="button"
                            onClick={addEducation}
                            className="cursor-pointer w-full py-2 text-xs border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500"
                        >
                            + Add Another
                        </button>
                    </div>
                )}

                {errors?.properties?.education?.errors[0] && (
                    <p id={`skills-error`} className="text-error-500 text-sm mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {errors?.properties?.education?.errors[0]}
                    </p>
                )}
            </div>
        </div>
    );
}
