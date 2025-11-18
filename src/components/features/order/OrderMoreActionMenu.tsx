import React from "react";
import MenuDropdown from "@/components/shared/MenuDropdown";
import {CircleX} from 'lucide-react';
import AlertModal from "@/components/shared/AlertModal";
import {useRouter} from "next/navigation";
import Modal from "@/components/shared/Modal";
import RequestCancelForm from "@/components/features/order/RequestCancelForm";
import {OrderStatus} from "@/lib/constants/constant";
import {useOrder} from "@/components/features/order/OrderContext";

export default function OrderMoreActionMenu({
                                                isOpen,
                                                onClose,
                                                anchorRef,
                                            }: {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<Element | null>;
}) {
    const [isRequestCancelModalOpen, setRequestCancelModalOpen] = React.useState(false);
    const [isToggleAlertOpen, setToggleAlertOpen] = React.useState(false);
    const router = useRouter();

    const {order} = useOrder();


    const handleRequestCancelClick = () => {
        // Open confirmation modal instead of directly closing menu
        setToggleAlertOpen(true);
        onClose?.();
    };

    const handleConfirmCancel = () => {
        // Logic để thực hiện request cancel order
        console.log("Order cancellation requested");
        setToggleAlertOpen(false);
        setRequestCancelModalOpen(true);
    };

    return (
        <>
            <MenuDropdown
                anchorRef={anchorRef}
                isOpen={isOpen}
                onClose={onClose}
                className="flex flex-col bg-background border border-gray-200 rounded-md shadow"
            >
                <ul className="flex flex-col">
                    {[OrderStatus.IN_PROGRESS, OrderStatus.DELIVERED].includes(order.status) && (
                        <li>
                            <button
                                className="btn btn-plain font-normal px-4 py-2 text-gray-700 bg-transparent rounded-md hover:bg-error-50 hover:text-error-600 flex items-center gap-2"
                                onClick={handleRequestCancelClick}
                            >
                                <CircleX size={14}/>
                                Request Cancel
                            </button>
                        </li>
                    )}
                </ul>
            </MenuDropdown>

            <AlertModal
                isOpen={isToggleAlertOpen}
                onClose={() => setToggleAlertOpen(false)}
                type="confirm"
                title="Request Order Cancellation?"
                description="Are you sure you want to request cancellation for this order? This action will notify the seller."
                confirmText="Yes, Request Cancel"
                cancelText="No, Keep Order"
                showCancel
                onConfirm={handleConfirmCancel}
            />

            <Modal
                isOpen={isRequestCancelModalOpen}
                onClose={() => setRequestCancelModalOpen(false)}
                className="container mx-auto flex bg-white rounded-xl shadow-xl p-1 max-h-[90vh] w-full max-w-md"
                backdropClassName="bg-black/20"
            >
                <RequestCancelForm
                    order={order}
                    onClose={() => setRequestCancelModalOpen(false)}
                />
            </Modal>
        </>
    );
}
