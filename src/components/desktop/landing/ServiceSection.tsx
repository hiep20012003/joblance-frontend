import {Code, Palette, Music, Briefcase, LineChart, PenTool, Film, Mic, Users} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
    "Graphics & Design": <Palette size={32}/>,
    "Digital Marketing": <LineChart size={32}/>,
    "Writing & Translation": <PenTool size={32}/>,
    "Video & Animation": <Film size={32}/>,
    "Music & Audio": <Music size={32}/>,
    "Programming & Tech": <Code size={32}/>,
    "Business": <Briefcase size={32}/>,
    "Consulting": <Users size={32}/>,
};

export const ServicesSection = ({services}: { services: string[] }) => {
    return (
        <section className="services-section container mx-auto py-32">
            <h2 className="text-3xl font-bold mb-4 text-center">Explore Services</h2>
            <p className="text-center text-gray-400 mb-16">
                Browse our wide range of categories and find the perfect service for your project.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
                {services.map((service) => (
                    <div key={service}
                         className="card gap-3 p-6 bg-white/5 rounded-xl shadow hover:shadow-lg transition cursor-pointer w-[calc(50%-1.5rem)] sm:w-[calc(33%-1.5rem)] lg:w-[calc(25%-1.5rem)]">
                        <div className="text-foreground">{categoryIcons[service] || <Briefcase size={32}/>}</div>
                        <span className="font-medium text-lg text-center">{service}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

