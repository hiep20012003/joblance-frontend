import Link from "next/link";

export const CTASection = () => {
    return (
        <section className="cta-section bg-primary-600 py-24">
            <div className="container mx-auto text-center text-white px-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    Start Your Next Project with Joblance
                </h2>
                <p className="text-lg md:text-xl mb-8">
                    Connect with top freelancers and get your work done efficiently and safely.
                </p>
                <div className="flex justify-center">
                    <Link
                        href="/auth?form=signup"
                        className="btn bg-background text-primary-600 px-8 py-3 font-semibold rounded-lg shadow-lg hover:bg-gray-50 transition"
                    >
                        Join Now
                    </Link>
                </div>
            </div>
        </section>
    );
};
