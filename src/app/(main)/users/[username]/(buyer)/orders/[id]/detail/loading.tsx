// app/auth/loading.tsx
import {OrderDetailSkeleton} from "@/components/features/order/OrderDetail";

export default function Loading() {
    return (
        <div className="container mx-auto px-6 py-6">
            <OrderDetailSkeleton/>
        </div>
    );
}
