import {CheckCheck, Star, X} from "lucide-react";
import React from "react";

export default function ProfileSidebar() {
    let profile: any;
    return (
        <div className="w-1/4 border-l border-gray-200 p-5 space-y-5 overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">About {profile?.name}</h3>

            {/* Basic Info */}
            <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">From</span> <span
                    className="font-medium">{profile?.from}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">On Fiverr since</span> <span
                    className="font-medium">{profile?.onFiverrSince}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">English</span> <span
                    className="font-medium">Native</span></div>
            </div>

            {/* Role Toggle */}
            <div className="flex bg-gray-100 rounded-full p-1 text-sm border">
                <button className="flex-1 bg-white shadow-sm rounded-full py-1 font-medium border border-gray-200">As a
                    client
                </button>
                <button className="flex-1 py-1 text-gray-500">As a freelancer</button>
            </div>

            {/* Rating & Hours */}
            <div className="space-y-3 pt-2 border-b pb-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Rating</span>
                    <div className="font-bold text-lg flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 mr-1 fill-yellow-500"/>
                        {profile?.rating} <span
                        className="font-normal text-sm text-gray-500 ml-1">({profile?.reviews})</span>
                    </div>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Preferred hours</span>
                    <span className="font-medium text-right">{profile?.preferredHours}</span>
                </div>
                <div className="text-green-600 text-sm font-medium flex items-center justify-end">
                    <CheckCheck className="h-4 w-4 mr-1"/> Within preferred hours
                </div>
            </div>

            {/* Activity & Stats */}
            <div className="space-y-4">
                <div className='flex justify-between items-center'>
                    <span
                        className="text-xs text-purple-600 bg-purple-100 inline-block px-2 py-0.5 rounded font-bold">Activity <span
                        className='font-normal'>PLUS</span></span>
                    <X size={16} className='text-gray-400 cursor-pointer'/>
                </div>
                <p className="text-sm">Join Seller Plus to get more insights on {profile?.name}.</p>
                <button className="w-full bg-gray-800 text-white py-2 rounded-lg font-medium">Tell Me More</button>

                {/* Dummy Stats (using placeholder bars) */}
                {['Completed orders', 'Average rating given', 'Average order price', 'Tip frequency', 'Repeat order rate', 'Order completion rate', 'Date of last order', 'Preferred service'].map(stat => (
                    <div key={stat} className="flex justify-between items-center text-sm">
                        <span className='text-gray-700'>{stat}</span>
                        <div className="w-1/3 h-2 bg-gray-200 rounded-full">
                            <div className="h-full bg-gray-400 rounded-full"
                                 style={{width: `${Math.floor(Math.random() * 50) + 50}%`}}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t">
                <p className='font-semibold text-sm mb-2'>Related Services</p>
                <p className='text-blue-600 text-sm cursor-pointer'>See More</p>
            </div>
        </div>
    );
}

