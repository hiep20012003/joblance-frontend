// app/auth/loading.tsx
import Spinner from '@/components/shared/Spinner';

export default function Loading() {
    return (
        <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
            <div className="flex items-center gap-3 text-gray-600 text-lg">
                <Spinner className="h-8 w-8 border-primary-600 border-t-transparent animate-spin"/>
                <span>Loading...</span>
            </div>
        </div>
    );
}
