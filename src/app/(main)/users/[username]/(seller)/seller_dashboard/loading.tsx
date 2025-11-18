// app/auth/loading.tsx
import Spinner from '@/components/shared/Spinner';

export default function Loading() {
    return (
        <div className="flex flex-1 justify-center items-center min-h-[500px]">
            <div className="flex items-center gap-3 text-gray-600 text-lg">
                <Spinner/>
            </div>
        </div>
    );
}
