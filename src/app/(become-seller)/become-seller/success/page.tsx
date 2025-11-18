import {CheckCircle} from "lucide-react";
import Link from "next/link";
import {auth} from "@/auth";
import {redirect} from "next/navigation";

export default async function SellerRegistrationSuccessPage() {
    const session = await auth();

    if (session && !session.user.roles?.includes('seller')) {
        redirect('/become-seller');
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[60vh] px-6">
            <div className="bg-green-100 p-6 rounded-full mb-6">
                <CheckCircle className="w-14 h-14 text-success-600"/>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-success-700">
                Seller Profile Created Successfully!
            </h2>
            <p className="text-gray-600 mt-2 max-w-md">
                Congratulations! Your seller account is now active. You can now create gigs and start offering
                your services.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                    href={`/users/${session?.user.username}/seller_dashboard`}
                    className="px-6 py-3 bg-success-600 text-white rounded-md hover:bg-success-700 transition"
                >
                    Go to Dashboard
                </Link>
                <Link
                    href="/"
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}