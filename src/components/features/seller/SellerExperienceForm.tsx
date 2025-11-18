import FormLabel from "@/components/shared/FormLabel";
import Input from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import DateInput from "@/components/shared/DateInput";
import CheckboxInput from "@/components/shared/CheckboxInput";
import {Trash2} from "lucide-react";
import {
    IExperience,
    ISellerDocument,
} from "@/types/seller";
import {ValidationTreeifyErrors} from "@/lib/hooks/useValidation";

interface SellerExperienceFormProps {
    formData: ISellerDocument;
    updateFormData: <K extends keyof ISellerDocument>(field: K, value: ISellerDocument[K]) => void;
    readOnly?: boolean;
    errors?: ValidationTreeifyErrors<ISellerDocument>;
}

export default function SellerExperienceForm({
                                                 formData,
                                                 updateFormData,
                                                 readOnly = false,
                                                 errors,
                                             }: SellerExperienceFormProps) {
    const addExperience = () => {
        const updated = [
            ...formData.experience,
            {
                company: "",
                title: "",
                startDate: "",
                endDate: "",
                description: "",
                currentlyWorkingHere: false,
            },
        ];
        updateFormData("experience", updated as never);
    };

    const updateExperience = (
        index: number,
        field: keyof IExperience,
        value: never
    ) => {
        const updated = formData.experience.map((exp, i) => {
            if (i === index) {
                const newExp = {...exp, [field]: value};

                // Nếu currentlyWorkingHere = true => xóa endDate
                if (field === "currentlyWorkingHere" && value === true) {
                    delete newExp.endDate;
                }

                return newExp;
            }
            return exp;
        });

        updateFormData("experience", updated as never);
    };

    const removeExperience = (index: number) => {
        const updated = formData.experience.filter((_, i) => i !== index);
        updateFormData("experience", updated as never);
    };

    return (
        <div className="w-full max-w-lg h-full flex flex-col">
            <div className="min-h-0 overflow-y-auto scrollbar-beautiful space-y-2">
                {formData.experience.map((exp, index) => (
                    <div
                        key={index}
                        className="p-4 border border-gray-300 rounded-lg space-y-2"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500">
                                Experience #{index + 1}
                            </span>

                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => removeExperience(index)}
                                    className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            )}
                        </div>

                        {/* Company & Title */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                                <FormLabel className="text-xs" label="Company"/>
                                <Input
                                    readOnly={readOnly}
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) =>
                                        updateExperience(index, "company", e.target.value as never)
                                    }
                                    placeholder="Company name"
                                    className="text-sm"
                                    maxLength={100}
                                    error={errors?.properties?.experience?.items?.[index]?.properties?.company?.errors[0]}
                                />
                            </div>

                            <div>
                                <FormLabel className="text-xs" label="Job Title"/>
                                <Input
                                    readOnly={readOnly}
                                    type="text"
                                    value={exp.title}
                                    onChange={(e) =>
                                        updateExperience(index, "title", e.target.value as never)
                                    }
                                    placeholder="Job Title"
                                    className="text-sm"
                                    maxLength={100}
                                    error={errors?.properties?.experience?.items?.[index]?.properties?.title?.errors[0]}
                                />
                            </div>
                        </div>

                        {/* Start & End Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                                <FormLabel className="text-xs" label="Start Date"/>
                                <DateInput
                                    readOnly={readOnly}
                                    value={exp.startDate ? new Date(exp.startDate) : null}
                                    onChange={(date) =>
                                        updateExperience(index, "startDate", date.toISOString() as never)
                                    }
                                    placeholder="Start Date"
                                    dateFormat="DD/MM/YYYY"
                                    className="text-sm"
                                    error={errors?.properties?.experience?.items?.[index]?.properties?.startDate?.errors[0]}
                                />
                            </div>

                            <div>
                                <FormLabel className="text-xs" label="End Date"/>
                                <DateInput
                                    readOnly={readOnly}
                                    value={exp.endDate ? new Date(exp.endDate) : null}
                                    onChange={(date) =>
                                        updateExperience(index, "endDate", date.toISOString() as never)
                                    }
                                    placeholder="End Date"
                                    dateFormat="DD/MM/YYYY"
                                    disabled={exp.currentlyWorkingHere}
                                    className="text-sm"
                                    error={errors?.properties?.experience?.items?.[index]?.properties?.endDate?.errors[0]}
                                />
                            </div>
                        </div>

                        {/* Checkbox */}
                        <div>
                            <CheckboxInput
                                readOnly={readOnly}
                                label="Currently working here"
                                checked={exp.currentlyWorkingHere}
                                onChange={(e) =>
                                    updateExperience(
                                        index,
                                        "currentlyWorkingHere",
                                        e.target.checked as never
                                    )
                                }
                                error={errors?.properties?.experience?.items?.[index]?.properties?.currentlyWorkingHere?.errors[0]}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <FormLabel className="text-xs" label="Description"/>
                            <Textarea
                                readOnly={readOnly}
                                value={exp.description}
                                onChange={(e) =>
                                    updateExperience(index, "description", e.target.value as never)
                                }
                                placeholder="Brief description of your role"
                                rows={3}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg resize-none"
                                maxLength={500}
                                error={errors?.properties?.experience?.items?.[index]?.properties?.description?.errors[0]}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {!readOnly && (
                <div
                    className={
                        formData.experience.length > 0
                            ? "mt-2 flex-shrink-0"
                            : "flex-shrink-0"
                    }
                >
                    <button
                        type="button"
                        onClick={addExperience}
                        className="cursor-pointer w-full py-2 text-xs border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500"
                    >
                        + Add Another
                    </button>
                </div>
            )}

            {errors?.properties?.experience?.errors[0] && (
                <p
                    id={`skills-error`}
                    className="text-error-500 text-sm mt-2 flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {errors?.properties?.experience?.errors[0]}
                </p>
            )}
        </div>
    );
}
