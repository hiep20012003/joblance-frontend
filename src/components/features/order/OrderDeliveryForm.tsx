'use client'

import React, {useState} from 'react';
import FormLabel from "@/components/shared/FormLabel";
import Textarea from "@/components/shared/Textarea";
import {MultiFileInput} from "@/components/shared/MultiFileInput";
import {AlertCircle} from "lucide-react";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {ALL_GIG_DELIVERY_MIMES} from "@/lib/constants/constant";
import {useDirectValidation, ValidationTreeifyErrors} from "@/lib/hooks/useValidation";
import {deliveryOrderSchema} from "@/lib/schemas/order.schema";
import {IDeliveredWork} from "@/types/order";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {deliverOrder} from "@/lib/services/client/order.client";
import {useRouter} from "next/navigation";

interface OrderDeliveryFormProps {
    orderId: string;
    onClose: () => void; // Simplified prop for closing the modal
}

export default function OrderDeliveryForm({
                                              orderId,
                                              onClose
                                          }: OrderDeliveryFormProps) {
    const [deliveryMessage, setDeliveryMessage] = useState('');
    const [deliveryFiles, setDeliveryFiles] = useState<File[]>([]);
    const [formErrors, setFormErrors] = useState<ValidationTreeifyErrors<IDeliveredWork>>({});
    const router = useRouter();

    const {parse} = useDirectValidation(deliveryOrderSchema);

    const {mutate, loading} = useFetchMutation(
        (data: FormData) => deliverOrder(orderId, data),
        {
            successMessage: "Deliver order successfully",
            onSuccess: () => {
                onClose?.();
                router.refresh();
            },
        }
    );

    const getFormData = () => {
        const data = new FormData();

        data.append("message", deliveryMessage.trim());

        deliveryFiles.forEach((file) => {
            if (file) data.append("deliveryFiles", file);
        });

        return data;
    };

    const validateForm = () => {
        const formData = getFormData();

        const message = formData.get("message") as string;

        const deliveryFiles = formData.getAll("deliveryFiles") as File[];

        const data = {message, deliveryFiles};

        const {valid, treeifyError} = parse(data);
        setFormErrors(treeifyError);
        return valid;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        // Simulate API call
        await mutate(getFormData());
    };

    const handleCancel = () => {
        onClose(); // Just close the modal
    };

    return (
        <>
            <LoadingWrapper isLoading={loading} fullScreen/>
            <div className="flex-1 overflow-y-auto scrollbar-beautiful p-6">
                <h2 className="text-xl font-semibold mb-4">Deliver Your Order</h2>
                <div
                    className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                    <p className="text-sm">
                        Ensure your delivery is complete and meets all buyer requirements. Clear communication is
                        key!
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <FormLabel label="Delivery Message" required/>
                        <Textarea
                            placeholder="Type your delivery message here..."
                            value={deliveryMessage}
                            onChange={(e) => setDeliveryMessage(e.target.value)}
                            rows={4}
                            maxLength={500}
                            minLength={5}
                            showCounter
                            error={formErrors?.properties?.message?.errors[0]}
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter at least 5 characters</p>
                    </div>
                    <div className="mb-4">
                        <FormLabel label="Attach Files (Optional)"/>
                        <MultiFileInput
                            onChange={setDeliveryFiles}
                            maxFiles={5}
                            maxSizeMB={20}
                            accept={[...ALL_GIG_DELIVERY_MIMES].join(',')}
                            error={formErrors?.properties?.deliveryFiles?.errors[0]}
                        />
                        <p className="text-xs text-gray-500 mt-1">Max 5 files, up to 20MB each. Accepted: images,
                            PDF, DOCX</p>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                            Submit Delivery
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
