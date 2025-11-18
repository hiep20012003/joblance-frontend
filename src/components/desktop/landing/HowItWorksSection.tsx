import {FileText, Search, MessageSquare, CheckCircle} from "lucide-react";

const steps = [
    {
        icon: <FileText size={32}/>,
        title: "Create a Gig",
        description: "Freelancers showcase their skills by posting gigs with detailed descriptions, pricing, and delivery time."
    },
    {
        icon: <Search size={32}/>,
        title: "Find & Hire",
        description: "Clients browse gigs, compare options, and hire the freelancer that fits their project."
    },
    {
        icon: <MessageSquare size={32}/>,
        title: "Work & Communicate",
        description: "Freelancers and clients collaborate, share updates, and request revisions directly on the platform."
    },
    {
        icon: <CheckCircle size={32}/>,
        title: "Payment & Review",
        description: "Clients approve completed work, release payment, and leave a review for the freelancer."
    }
];

export const HowItWorksSection = () => {
    return (
        <section className="how-it-works container mx-auto py-32">
            <h2 className="text-3xl font-bold text-center mb-4">How Joblance Works</h2>
            <p className="text-center text-gray-400 mb-16">
                A simple process to connect freelancers with clients and get projects done efficiently.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step) => (
                    <div
                        key={step.title}
                        className="flex flex-col items-center p-6 bg-white/5 rounded-xl shadow hover:shadow-lg transition text-center"
                    >
                        <div className="mb-4 text-foreground">{step.icon}</div>
                        <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                        <p className="text-gray-400 text-sm">{step.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
