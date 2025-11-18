import FormLabel from "@/components/shared/FormLabel";
import TagInput from "@/components/shared/TagInput";
import {Plus, Trash2} from "lucide-react";
import DropdownInput from "@/components/shared/DropdownInput";
import {languages} from "countries-list";
import {useMemo} from "react";
import {ValidationTreeifyErrors} from "@/lib/hooks/useValidation";
import {ILanguage, ISellerDocument} from "@/types/seller";
import {LANGUAGE_LEVEL, POPULAR_SKILLS} from "@/lib/constants/constant";

interface SellerSkillFormProps {
    formData: ISellerDocument;
    updateFormData: (field: keyof ISellerDocument, value: never) => void;
    readOnly?: boolean;
    errors?: ValidationTreeifyErrors<ISellerDocument>;
}

export default function SellerSkillForm({
                                            formData,
                                            updateFormData,
                                            readOnly = false,
                                            errors,
                                        }: SellerSkillFormProps) {
    const languagesName = Object.entries(languages).map(([, value]) => value.name);

    const languageOptions = useMemo(
        () => languagesName.map((l) => ({label: l, value: l})),
        [languagesName]
    );

    const levelOptions = useMemo(
        () => LANGUAGE_LEVEL.map((l) => ({label: l, value: l})),
        []
    );

    const toggleSkill = (skill: string) => {
        if (readOnly) return;
        const updatedSkills = formData.skills.includes(skill)
            ? formData.skills.filter((s) => s !== skill)
            : [...formData.skills, skill];
        updateFormData("skills", updatedSkills as never);
    };

    const addLanguage = () => {
        if (readOnly) return;
        const updated = [...formData.languages, {language: "", level: ""}];
        updateFormData("languages", updated as never);
    };

    const updateLanguage = (index: number, field: keyof ILanguage, value: string) => {
        const updated = formData.languages.map((lang, i) =>
            i === index ? {...lang, [field]: value} : lang
        );
        updateFormData("languages", updated as never);
    };

    const removeLanguage = (index: number) => {
        if (readOnly) return;
        const updated = formData.languages.filter((_, i) => i !== index);
        updateFormData("languages", updated as never);
    };

    return (
        <div className="w-full max-w-lg h-full flex flex-col gap-4">
            {/* ========== Skills Section ========== */}
            <div className="w-full flex flex-col">
                <FormLabel htmlFor={"skills"} label="Skills (Select at least 3)"/>
                <TagInput
                    name="skills"
                    readOnly={readOnly}
                    tags={formData.skills}
                    onChangeTags={(newTags) => updateFormData("skills", newTags as never)}
                    placeholder="Enter skill and press Enter"
                    icon={<Plus className="w-4 h-4 text-gray-400"/>}
                    maxLength={30}
                    className="text-sm"
                />

                {!readOnly && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {POPULAR_SKILLS.map((skill) => (
                            <button
                                key={skill}
                                type="button"
                                disabled={readOnly}
                                onClick={() => toggleSkill(skill)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    formData.skills.includes(skill)
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                } ${readOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                )}

                {errors?.properties?.skills?.errors[0] && (
                    <p
                        id="skills-error"
                        className="text-error-500 text-sm mt-2 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {errors.properties.skills.errors[0]}
                    </p>
                )}
            </div>

            {/* ========== Languages Section ========== */}
            <div className="flex-1 flex flex-col min-h-0">
                <FormLabel label="Languages"/>

                <div className="min-h-0 overflow-y-auto scrollbar-beautiful space-y-2">
                    {formData.languages.map((lang, index) => (
                        <div key={index} className="flex justify-center gap-2 items-center">
                            <div className="flex-1">
                                <DropdownInput
                                    className="text-sm"
                                    name="language"
                                    readOnly={readOnly}
                                    options={languageOptions}
                                    value={
                                        lang.language
                                            ? {label: lang.language, value: lang.language}
                                            : null
                                    }
                                    onChange={(option) =>
                                        updateLanguage(index, "language", option.value)
                                    }
                                    placeholder="Select language"
                                    error={
                                        errors?.properties?.languages?.items?.[index]?.properties
                                            ?.language?.errors[0]
                                    }
                                />
                            </div>

                            <div className="flex-1">
                                <DropdownInput
                                    className="text-sm"
                                    name="level"
                                    readOnly={readOnly}
                                    options={levelOptions}
                                    value={
                                        lang.level ? {label: lang.level, value: lang.level} : null
                                    }
                                    onChange={(option) =>
                                        updateLanguage(index, "level", option.value)
                                    }
                                    placeholder="Select level"
                                    error={
                                        errors?.properties?.languages?.items?.[index]?.properties
                                            ?.level?.errors[0]
                                    }
                                />
                            </div>

                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => removeLanguage(index)}
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
                            formData.languages.length > 0
                                ? "mt-2 flex-shrink-0"
                                : "flex-shrink-0"
                        }
                    >
                        <button
                            type="button"
                            onClick={addLanguage}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition"
                        >
                            <Plus className="w-3 h-3"/>
                            Add Language
                        </button>
                    </div>
                )}

                {errors?.properties?.languages?.errors[0] && (
                    <p
                        id="languages-error"
                        className="text-error-500 text-sm mt-2 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {errors.properties.languages.errors[0]}
                    </p>
                )}
            </div>
        </div>
    );
}
