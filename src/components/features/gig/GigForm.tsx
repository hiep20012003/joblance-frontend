'use client'

import {forwardRef, useImperativeHandle, useState} from "react";
import FormLabel from "@/components/shared/FormLabel";
import Input from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import DropdownInput from "@/components/shared/DropdownInput";
import CheckboxInput from "@/components/shared/CheckboxInput";
import {Trash2, Plus} from "lucide-react";
import {GigCreatePayload, gigUpdateSchema} from "@/lib/schemas/gig.schema";
import {ValidationTreeifyErrors} from "@/lib/hooks/useValidation";
import {useDirectValidation} from "@/lib/hooks/useValidation";
import {gigCreateSchema} from "@/lib/schemas/gig.schema";
import {IGigDocument} from "@/types/gig";
import {BASE_MIMES, GIG_CATEGORIES, RENDERABLE_IMAGE_MIMES} from "@/lib/constants/constant";
import {fromSlug, toSlug} from "@/lib/utils/helper";
import TagInput from "@/components/shared/TagInput";
import {useUserContext} from "@/context/UserContext";
import {SingleFileInput} from "@/components/shared/SingleFileInput";

export interface GigFormHandles {
    submitForm: () => FormData | null;
    validateForm: () => boolean;
    resetForm: () => void;
}

interface GigFormProps {
    initialData?: IGigDocument | null;
    readOnly?: boolean;
    onSubmit?: (formData: FormData) => void;
    onCancel?: () => void;
    type: 'create' | 'update';
}

const GigForm = forwardRef<GigFormHandles, GigFormProps>(
    ({initialData, readOnly = false, onSubmit, onCancel, type}, ref) => {
        const {user} = useUserContext()
        const isEditMode = !!initialData;
        const [formErrors, setFormErrors] = useState<ValidationTreeifyErrors<IGigDocument>>({});

        const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

        const [formData, setFormData] = useState(() =>
            initialData
                ? {...initialData, price: initialData.price / 100}
                : {
                    sellerId: user?.id ?? "",
                    email: user?.email ?? "",
                    username: user?.username ?? "",
                    profilePicture: user?.profilePicture ?? "",
                    title: "",
                    description: "",
                    categories: "",
                    subCategories: [],
                    tags: [],
                    requirements: [{question: "", hasFile: false, required: true}],
                    coverImage: "",
                    price: 0,
                    expectedDeliveryDays: 1,
                    basicTitle: "",
                    basicDescription: "",
                }
        );

        const {parse} = useDirectValidation(type === 'create' ? gigCreateSchema : gigUpdateSchema);

        const updateField = <K extends keyof GigCreatePayload>(field: keyof GigCreatePayload, value: GigCreatePayload[K]) => {
            if (readOnly) return;
            setFormData((prev) => ({...prev, [field]: value}));
        };

        const addRequirement = () => {
            if (readOnly) return;
            const newReq = formData.requirements.length === 0 ? {
                question: "",
                hasFile: false,
                required: true
            } : {question: "", hasFile: false, required: false}
            updateField("requirements", [...formData.requirements, newReq]);
        };

        const updateRequirement = (index: number, field: "question" | "hasFile" | "required", value: string | boolean) => {
            if (readOnly) return;
            const updated = formData.requirements.map((req, i) =>
                i === index ? {...req, [field]: value} : req
            );
            updateField("requirements", updated);
        };

        const removeRequirement = (index: number) => {
            if (readOnly) return;
            const updated = formData.requirements.filter((_, i) => i !== index);
            if (updated.length > 0) {
                updated[0].required = true;
            }
            updateField("requirements", updated);
        };

        const handleFileChange = (file: File | null) => {
            setCoverImageFile(file);
        };

        const getFormData = () => {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("categories", formData.categories);
            data.append("subCategories", JSON.stringify(formData.subCategories));
            data.append("tags", JSON.stringify(formData.tags));
            data.append("requirements", JSON.stringify(formData.requirements));
            data.append("price", formData.price.toString());
            data.append("expectedDeliveryDays", formData.expectedDeliveryDays.toString());
            data.append("basicTitle", formData.basicTitle);
            data.append("basicDescription", formData.basicDescription);
            if (coverImageFile)
                data.append("coverImageFile", coverImageFile);

            if (!isEditMode && user?.id) {
                data.append("sellerId", formData.sellerId);
                data.append("email", formData.email);
                data.append("username", formData.username);
                data.append("profilePicture", formData.profilePicture);
            }

            return data;
        };

        const validateForm = () => {
            const data = Object.fromEntries(getFormData().entries()) as unknown as GigCreatePayload;
            const {valid, treeifyError} = parse(data);
            setFormErrors(treeifyError);
            return valid;
        };

        const submitForm = () => {
            if (validateForm()) {
                const data = getFormData();
                onSubmit?.(data);
                return data;
            }
            return null;
        };

        const resetForm = () => {
            if (readOnly) return;
            setFormData(
                initialData || {
                    sellerId: user?.id ?? "",
                    email: user?.email ?? "",
                    username: user?.username ?? "",
                    profilePicture: user?.profilePicture ?? "",
                    title: "",
                    description: "",
                    categories: "",
                    subCategories: [],
                    tags: [],
                    requirements: [],
                    currency: "",
                    coverImage: "",
                    price: 0,
                    expectedDeliveryDays: 1,
                    basicTitle: "",
                    basicDescription: "",
                    coverImageFile: null
                }
            );
        };

        useImperativeHandle(ref, () => ({
            submitForm,
            validateForm,
            resetForm,
        }));

        // Category options
        const categoryOptions = GIG_CATEGORIES.map(c => ({
            label: fromSlug(c.category),
            value: toSlug(c.category),
        }));

        // Subcategory options based on selected category
        const subCategoryOptions = (
            GIG_CATEGORIES.find(c => toSlug(c.category) === formData.categories || c.category === formData.categories)?.subcategories || [])
            .map(c => ({
                label: fromSlug(c),
                value: toSlug(c),
            }));

        return (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cột 1: Cover Image, Title, Description */}
                <div className="flex flex-col gap-4">
                    {/* Cover Image */}
                    <div className="p-4 border border-gray-300 rounded-lg">
                        <SingleFileInput
                            id="coverImage"
                            label="Upload Cover Image"
                            accept={BASE_MIMES.images.join(',')}
                            maxSizeMB={10}
                            defaultFileUrl={formData.coverImage}
                            onChange={handleFileChange}
                            readOnly={readOnly}
                            error={formErrors?.properties?.coverImageFile?.errors[0]}
                            className="text-sm"
                            required={false}
                        />
                    </div>

                    {/* Title */}
                    <div className="p-4 border border-gray-300 rounded-lg">
                        <FormLabel className="text-gray-500" label="Gig Title"/>
                        <Textarea
                            rows={1}
                            readOnly={readOnly}
                            value={formData.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            placeholder="Enter gig title..."
                            maxLength={100}
                            className="px-3 py-1.5 text-sm"
                            error={formErrors?.properties?.title?.errors[0]}
                        />
                        <FormLabel className="text-gray-500 mt-3" label="Basic Package Title"/>
                        <Textarea
                            rows={1}
                            readOnly={readOnly}
                            value={formData.basicTitle}
                            onChange={(e) => updateField("basicTitle", e.target.value)}
                            placeholder="Enter basic package title..."
                            maxLength={100}
                            className="px-3 py-1.5 text-sm"
                            error={formErrors?.properties?.basicTitle?.errors[0]}
                        />
                    </div>

                    {/* Description */}
                    <div className="p-4 border border-gray-300 rounded-lg">
                        <FormLabel className="text-gray-500" label="Description"/>
                        <Textarea
                            readOnly={readOnly}
                            value={formData.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            placeholder="Enter gig description..."
                            maxLength={2000}
                            rows={4}
                            className="px-3 py-1.5 text-sm"
                            error={formErrors?.properties?.description?.errors[0]}
                        />
                        <FormLabel className="text-gray-500 mt-3" label="Basic Package Description"/>
                        <Textarea
                            readOnly={readOnly}
                            value={formData.basicDescription}
                            onChange={(e) => updateField("basicDescription", e.target.value)}
                            placeholder="Enter basic package description..."
                            maxLength={200}
                            rows={2}
                            className="px-3 py-1.5 text-sm"
                            error={formErrors?.properties?.basicDescription?.errors[0]}
                        />
                    </div>
                </div>

                {/* Cột 2: Category, Tags, Price, Delivery Days, Requirements */}
                <div className="flex flex-col gap-4">
                    {/* Category */}
                    <div className="p-4 border border-gray-300 rounded-lg">
                        <FormLabel className="text-gray-500" label="Category"/>
                        <DropdownInput
                            readOnly={readOnly}
                            options={categoryOptions}
                            value={categoryOptions.find(opt => opt.value === formData.categories || opt.value === toSlug(formData.categories)) || null}
                            onChange={(opt) => {
                                updateField("categories", opt?.value || "");
                                updateField("subCategories", []); // Reset subcategories when category changes
                            }}
                            placeholder="Select category..."
                            className="text-sm"
                            error={formErrors?.properties?.categories?.errors[0]}
                        />
                        <FormLabel className="text-gray-500 mt-2.5" label="Sub Categories"/>
                        <div className="min-h-0 overflow-y-auto scrollbar-beautiful space-y-2">
                            {formData.subCategories.length > 0 ? (
                                formData.subCategories.map((sub, idx) => (
                                    <div
                                        key={sub || idx}
                                        className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100"
                                    >
                                        <span className="text-sm">{fromSlug(sub)}</span>
                                        {!readOnly && (
                                            <button
                                                type="button"
                                                onClick={() => updateField("subCategories", formData.subCategories.filter((_, i) => i !== idx))}
                                                className="text-gray-500 hover:text-red-500 hover:cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : undefined}
                        </div>
                        {!readOnly && (
                            <div className={formData.subCategories.length > 0 ? 'mt-2' : ''}>
                                <DropdownInput
                                    options={subCategoryOptions}
                                    value={null}
                                    onChange={(option) => {
                                        if (!option) return;
                                        if (!formData.subCategories.some(s => s === option.value)) {
                                            updateField("subCategories", [...formData.subCategories, option.value]);
                                        }
                                    }}
                                    placeholder="Select subcategory..."
                                    className="text-sm"
                                    error={formErrors?.properties?.subCategories?.errors[0]}
                                />
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="p-4 border border-gray-300 rounded-lg">
                        <FormLabel label="Tags"/>
                        <TagInput
                            readOnly={readOnly}
                            tags={formData.tags}
                            onChangeTags={(tags) => updateField("tags", tags)}
                            placeholder="Add tags (e.g., logo, branding)"
                            maxLength={30}
                            className="text-sm"
                            error={formErrors?.properties?.tags?.errors[0]}
                        />
                    </div>

                    {/* Price and Delivery Days */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-300 rounded-lg">
                            <FormLabel className="text-gray-500" label="Price"/>
                            <Input
                                readOnly={readOnly}
                                type="number"
                                value={(formData.price) || ""}
                                onChange={(e) => updateField("price", Number(e.target.value))}
                                placeholder="Enter price (min $4.99)"
                                min={4.99}
                                step={0.01}
                                className="px-3 py-1.5 text-sm"
                                error={formErrors?.properties?.price?.errors[0]}
                            />
                        </div>
                        <div className="p-4 border border-gray-300 rounded-lg">
                            <FormLabel className="text-gray-500" label="Expected Delivery Days"/>
                            <Input
                                readOnly={readOnly}
                                type="number"
                                value={formData.expectedDeliveryDays || ""}
                                onChange={(e) => updateField("expectedDeliveryDays", e.target.value)}
                                placeholder="Enter delivery days (1-365)"
                                min={1}
                                max={365}
                                className="px-3 py-1.5 text-sm"
                                error={formErrors?.properties?.expectedDeliveryDays?.errors[0]}
                            />
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="p-3 border border-gray-200 rounded-md shadow-sm">
                        <FormLabel className="text-sm font-medium text-gray-600" label="Requirements"/>
                        <div className="min-h-0 overflow-y-auto scrollbar-beautiful space-y-3">
                            {formData.requirements.length > 0 ? (
                                formData.requirements.map((req, index) => {
                                    const isSingleRequirement = index === 0;
                                    return (
                                        <div
                                            key={index}
                                            className="relative border border-gray-200 rounded-md p-3 bg-white shadow-sm hover:bg-gray-50 transition-all space-y-2"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                            <span
                                                className="text-xs font-semibold text-gray-500">Requirement #{index + 1}</span>
                                                {!readOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRequirement(index)}
                                                        className="text-gray-500 hover:text-red-500 transition-colors hover:cursor-pointer"
                                                        aria-label={`Remove requirement ${index + 1}`}
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                )}
                                            </div>
                                            <Textarea
                                                rows={2}
                                                readOnly={readOnly}
                                                value={req.question}
                                                onChange={(e) => updateRequirement(index, "question", e.target.value)}
                                                placeholder="Enter requirement question..."
                                                maxLength={500}
                                                className="px-3 py-1.5 text-sm leading-5"
                                                error={formErrors?.properties?.requirements?.items?.[index]?.properties?.question?.errors[0]}
                                            />
                                            <div className={"flex gap-4"}>
                                                <CheckboxInput
                                                    readOnly={readOnly || isSingleRequirement}
                                                    label="Optional"
                                                    checked={!req.required}
                                                    onChange={(e) => updateRequirement(index, "required", !e.target.checked)}
                                                    className="text-sm font-normal"
                                                />
                                                <CheckboxInput
                                                    readOnly={readOnly}
                                                    label="Requires File Upload"
                                                    checked={req.hasFile}
                                                    onChange={(e) => updateRequirement(index, "hasFile", e.target.checked)}
                                                    className="text-sm font-normal"
                                                />
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-gray-400 text-sm">No requirements added</p>
                            )}
                        </div>
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={addRequirement}
                                className="hover:cursor-pointer mt-3 w-full py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md shadow-sm hover:bg-primary-100 hover:shadow transition-all"
                                aria-label="Add new requirement"
                            >
                                <Plus className="w-4 h-4 inline mr-1"/> Add Another
                            </button>
                        )}
                        {formErrors?.properties?.requirements?.errors[0] && (
                            <p id="requirements-error" className="text-error-500 text-xs mt-2 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {formErrors?.properties?.requirements?.errors[0]}
                            </p>
                        )}
                    </div>
                </div>
                {/* Nút Submit và Cancel */}
                {!readOnly && (
                    <div className="col-span-1 md:col-span-2 mt-4 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                resetForm()
                                onCancel?.();
                            }}
                            className="btn btn-soft px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 hover:shadow transition-all"
                            aria-label="Cancel gig form"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={submitForm}
                            className="btn btn-soft px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 hover:shadow transition-all"
                            aria-label="Submit gig form"
                        >
                            {isEditMode ? "Update Gig" : "Create Gig"}
                        </button>
                    </div>
                )}
            </div>
        );
    }
);

GigForm.displayName = "GigForm";
export default GigForm;