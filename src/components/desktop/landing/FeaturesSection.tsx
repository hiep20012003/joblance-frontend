import {Users, FileText, CalendarCheck, Globe} from "lucide-react";

const features = [
    {
        icon: <Users size={32}/>,
        title: "Connect with Top Freelancers",
        description: "Find skilled professionals across multiple domains for any project."
    },
    {
        icon: <FileText size={32}/>,
        title: "Seamless Project Management",
        description: "Post jobs, track progress, and manage tasks all in one platform."
    },
    {
        icon: <CalendarCheck size={32}/>,
        title: "On-Time Delivery",
        description: "Set deadlines and milestones to ensure projects are completed on schedule."
    },
    {
        icon: <Globe size={32}/>,
        title: "Global Opportunities",
        description: "Work with clients and freelancers worldwide, expanding your reach."
    }
];

export const FeaturesSection = () => {
    return (
        <section className="features-section py-32 bg-primary-50">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-4">Why Joblance?</h2>
                <p className="text-center text-gray-400 mb-16">
                    Empowering freelancers and businesses to collaborate efficiently and successfully.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="card p-6 bg-white/5 rounded-xl shadow hover:shadow-lg transition cursor-pointer text-center"
                        >
                            <div className="mb-4 text-foreground">{feature.icon}</div>
                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-gray-400 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
