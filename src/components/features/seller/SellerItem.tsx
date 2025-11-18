import Link from 'next/link';
import Avatar from '@/components/shared/Avatar';
import {Star} from 'lucide-react';
import {ISellerDocument} from "@/types/seller";

interface SellerItemProps {
    item: Required<ISellerDocument>;
}

export const SellerItem: React.FC<SellerItemProps> = ({item}) => {
    const avgRating = item.ratingsCount > 0 ? item.ratingSum / item.ratingsCount : 0;

    return (
        <div
            key={item._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center hover:shadow-md transition"
        >
            <div className="flex justify-start items-center gap-6 mb-6">
                <Avatar
                    src={item.profilePicture}
                    username={item.username}
                    size={58}
                />

                <div className="h-full flex flex-col justify-between items-start gap-2">
                    <h3 className="font-semibold text-gray-900">{item.fullName}</h3>

                    <div className="flex items-center justify-center gap-1">
                        {Array.from({length: 5}).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-5 h-5 ${
                                    i < Math.round(avgRating)
                                        ? 'fill-gray-900 text-gray-900'
                                        : 'fill-gray-300 text-gray-300'
                                }`}
                            />
                        ))}
                        <span className="font-semibold">{avgRating.toFixed(1)}</span>
                        <span className="text-gray-500">({item.ratingsCount})</span>
                    </div>
                </div>
            </div>

            <Link
                href={`/${item.username}`}
                className="btn btn-soft text-white bg-primary-600 w-full"
            >
                View Profile
            </Link>
        </div>
    );
};
