import FormLabel from "@/components/shared/FormLabel";
import Input from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import {ISellerDocument} from "@/types/seller";
import {ValidationTreeifyErrors} from "@/lib/hooks/useValidation";
import {Plus, Trash2} from "lucide-react";

interface SellerBasicInfoFormProps {
    formData: ISellerDocument;
    updateFormData: <K extends keyof ISellerDocument>(
        field: string,
        value: ISellerDocument[K]
    ) => void;
    readOnly?: boolean;
    errors?: ValidationTreeifyErrors<ISellerDocument>;
}

export default function SellerBasicInfoForm({
                                                errors,
                                                formData,
                                                updateFormData,
                                                readOnly = false,
                                            }: SellerBasicInfoFormProps) {

    const addSocialLink = () => {
        if (readOnly) return;
        updateFormData("socialLinks", [...formData.socialLinks, ""] as never);
    };

    const updateSocialLink = (index: number, value: string) => {
        const updated = formData.socialLinks.map((link, i) =>
            i === index ? value : link
        );
        updateFormData("socialLinks", updated as never);
    };

    const removeSocialLink = (index: number) => {
        if (readOnly) return;

        if (errors?.properties?.socialLinks?.items) {
            errors.properties.socialLinks.items.splice(index, 1);
        }

        const updated = formData.socialLinks.filter((_, i) => i !== index);
        updateFormData("socialLinks", updated as never);
    };

    return (
        <div className="h-full w-full max-w-lg flex flex-col gap-2">
            <div className="flex flex-row gap-4">
                <div className="flex-3">
                    <FormLabel label="Full Name"/>
                    <Textarea
                        className={'text-sm'}
                        rows={1}
                        readOnly={readOnly}
                        value={formData.fullName}
                        onChange={(e) => updateFormData("fullName", e.target.value)}
                        placeholder="Enter your full name"
                        maxLength={80}
                        error={errors?.properties?.fullName?.errors[0]}
                    />
                </div>

                <div className="flex-2">
                    <FormLabel label="Response Time (hours)"/>
                    <Input
                        className={'text-sm'}
                        readOnly={readOnly}
                        type="number"
                        value={formData.responseTime}
                        onChange={(e) =>
                            updateFormData("responseTime", e.target.value)
                        }
                        placeholder="Enter number of hours (e.g., 1–168)"
                        min={1}
                        max={168}
                        maxLength={3}
                        error={errors?.properties?.responseTime?.errors[0]}
                    />
                </div>
            </div>

            <div className="w-full">
                <FormLabel label="One-liner"/>
                <Textarea
                    className={'text-sm'}
                    rows={1}
                    readOnly={readOnly}
                    value={formData.oneliner}
                    onChange={(e) => updateFormData("oneliner", e.target.value)}
                    placeholder="e.g., Expert Web Developer | 5+ Years Experience"
                    maxLength={100}
                    error={errors?.properties?.oneliner?.errors[0]}
                />
            </div>

            <div className="w-full flex flex-col">
                <FormLabel label="Description"/>
                <Textarea
                    className={'text-sm'}
                    readOnly={readOnly}
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    placeholder="Describe your expertise..."
                    maxLength={600}
                    error={errors?.properties?.description?.errors[0]}
                />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <FormLabel required={false} label="Socials"/>
                <div className="min-h-0 overflow-y-auto scrollbar-beautiful space-y-2">
                    {formData.socialLinks.map((link, index) => (
                        <div key={index} className="flex justify-center gap-2 items-center">
                            <Textarea
                                className={'text-sm flex-1'}
                                rows={1}
                                readOnly={readOnly}
                                value={link}
                                onChange={(e) => updateSocialLink(index, e.target.value)}
                                placeholder="https://linkedin.com/in/username"
                                maxLength={200}
                                error={errors?.properties?.socialLinks?.items?.[index]?.errors[0]}
                            />
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => removeSocialLink(index)}
                                    className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {!readOnly && (
                    <div
                        className={
                            formData.socialLinks.length > 0
                                ? "mt-2 flex-shrink-0"
                                : "flex-shrink-0"
                        }
                    >
                        <button
                            type="button"
                            onClick={addSocialLink}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition"
                        >
                            <Plus className="w-3 h-3"/>
                            Add Social Link
                        </button>
                    </div>
                )}

                {errors?.properties?.socialLinks?.errors[0] && (
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
                        {errors?.properties?.socialLinks?.errors[0]}
                    </p>
                )}
            </div>
        </div>
    );
}
