// app/auth/loading.tsx
import Spinner from '@/components/shared/Spinner';

export default function Loading() {
    return (
        <div className="flex justify-center items-center h-full">
            <div className="flex items-center gap-3 text-gray-600 text-lg">
                <Spinner/>
            </div>
        </div>
    );
}
