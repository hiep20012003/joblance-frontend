'use client';

import {IOrderDocument} from "@/types/order";
import {IGigDocument} from "@/types/gig";
import FormLabel from "@/components/shared/FormLabel";
import Textarea from "@/components/shared/Textarea";
import {FormEvent, useEffect, useState} from "react";
import CheckboxInput from "@/components/shared/CheckboxInput";
import {SingleFileInput} from "@/components/shared/SingleFileInput";
import Link from "next/link";
import {redirect, usePathname, useRouter, useSearchParams} from "next/navigation";
import {useDirectValidation, ValidationTreeifyErrors} from "@/lib/hooks/useValidation";
import {submitOrderRequirementsSchema} from "@/lib/schemas/order.schema";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {submitRequirements} from "@/lib/services/client/order.client";
import {useToast} from "@/context/ToastContext";
import {BASE_MIMES} from "@/lib/constants/constant";

export default function OrderRequirementForm({
                                                 order,
                                                 gig,
                                             }: {
    order: Required<IOrderDocument>;
    gig: Required<IGigDocument>;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const [requirements, setRequirements] = useState(
        gig.requirements.map((req) => ({
            requirementId: req._id!,
            question: req.question,
            answerText: "",
            answered: false,
            hasFile: req.hasFile,
            required: req.required,
        }))
    );

    const [requirementFiles, setRequirementFiles] = useState<
        { id: string; file: File | null }[]
    >(
        gig.requirements
            .filter((req) => req.hasFile)
            .map((req) => ({id: req._id as string, file: null}))
    );

    const [agreed, setAgreed] = useState(false);

    const {parse} = useDirectValidation(submitOrderRequirementsSchema);
    const [formErrors, setFormErrors] = useState<ValidationTreeifyErrors<{ requirements: [] }>>({});
    const {addToastByStatus} = useToast();

    const {mutate, loading: isSubmitting} = useFetchMutation(
        (data: FormData) => submitRequirements(order._id, data),
        {
            redirectOnUnauthorized: true,
            successMessage: 'Requirements submitted successfully',
            onSuccess: () => {
                router.replace(`/orders/${order._id}?source=${encodeURIComponent(pathname)}`);
            },
        }
    );

    const getFormData = () => {
        const data = new FormData();

        // Only send answered requirements
        const answeredRequirements = requirements.filter((r) => r.answered);
        data.append("requirements", JSON.stringify(answeredRequirements));

        // Only send uploaded files
        requirementFiles.forEach((item) => {
            if (item.file) data.append("requirementFiles", item.file);
        });

        return data;
    };

    const validateForm = () => {
        if (!agreed) {
            alert("Please confirm that the information you provided is accurate and complete.");
            return false;
        }

        const parsedData = {
            requirements,
            requirementFiles: requirementFiles
                .filter((f) => f.file !== null)
                .map((f) => f.file as File),
        };

        const {valid, treeifyError} = parse(parsedData);
        setFormErrors(treeifyError);

        if (!valid) {
            addToastByStatus('Please fill in all required fields.', 400);
            return false;
        }

        return true;
    };

    const updateRequirements = (id: string, value: string) => {
        setRequirements((prev) =>
            prev.map((req) =>
                req.requirementId === id
                    ? {
                        ...req,
                        answered: value.trim().length > 0,
                        answerText: value,
                    }
                    : req
            )
        );
    };

    const updateRequirementFiles = (requirementId: string, file: File | null) => {
        setRequirementFiles((prev) => {
            const exists = prev.find((f) => f.id === requirementId);
            if (exists) {
                return prev.map((f) => (f.id === requirementId ? {...f, file} : f));
            }
            return [...prev, {id: requirementId, file}];
        });

        setRequirements((prev) =>
            prev.map((req) =>
                req.requirementId === requirementId
                    ? {...req, answered: !!file}
                    : req
            )
        );
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const formData = getFormData();
        await mutate(formData);
    };

    // useEffect(() => {
    //     if (order.status !== 'ACTIVE')
    //         router.push(`/orders/${order.buyerUsername}/orders/${order._id}/detail`);
    // }, [order, router])

    return (
        <form noValidate className="flex flex-col gap-4 max-w-lg" onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h2 className="font-bold text-2xl text-gray-900">
                    Submit Requirements to Start Your Order
                </h2>
                <p className="font-semibold text-xl text-gray-900">
                    The seller needs the following information to start working on your order
                </p>
            </div>

            {/* Inputs */}
            <div>
                {requirements.map((req, index) => (
                    <div key={req.requirementId} className="mb-4">
                        <FormLabel
                            label={`${index + 1}. ${req.question}`}
                            required={req.required}
                            htmlFor={req.requirementId}
                            className="text-base text-gray-900 font-normal!"
                        />

                        {req.hasFile ? (
                            <>
                                <SingleFileInput
                                    name={req.requirementId}
                                    id={req.requirementId}
                                    accept={[...BASE_MIMES.documents, ...BASE_MIMES.images, ...BASE_MIMES.archives].join(',')}
                                    maxSizeMB={10}
                                    onChange={(file) => updateRequirementFiles(req.requirementId!, file)}
                                    className="text-sm"
                                    required={req.required}
                                    error={formErrors?.properties?.requirements?.properties?.[req.requirementId]?.errors[0]}
                                />
                            </>
                        ) : (
                            <>
                                <Textarea
                                    name={req.requirementId}
                                    className="text-sm"
                                    rows={3}
                                    value={req.answerText}
                                    onChange={(e) => updateRequirements(req.requirementId!, e.target.value)}
                                    placeholder="Your answer"
                                    required={req.required}
                                    error={formErrors?.properties?.requirements?.properties?.[req.requirementId]?.errors[0]}
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <CheckboxInput
                        className="text-sm font-normal"
                        label="The information I provided is accurate and complete."
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        required
                    />
                </div>

                <div className="justify-end flex items-center gap-4">
                    <Link
                        className="btn btn-soft text-gray-700 rounded-md text-base font-normal"
                        href={`/users/${order.buyerUsername}/orders`}
                    >
                        Remind Me Later
                    </Link>
                    <button
                        type="submit"
                        className="btn bg-primary-600 rounded-md text-base text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Start Order"}
                    </button>
                </div>
            </div>
        </form>
    );
}
