import {HeroSection} from "@/components/desktop/landing/HeroSection";
import {ServicesSection} from "@/components/desktop/landing/ServiceSection";
import {GIG_CATEGORIES} from "@/lib/constants/constant";
import {FeaturesSection} from "@/components/desktop/landing/FeaturesSection";
import {HowItWorksSection} from "@/components/desktop/landing/HowItWorksSection";
import {CTASection} from "@/components/desktop/landing/CTASection";

export default function LandingPage() {
    return (
        <>
            <HeroSection/>
            <ServicesSection services={GIG_CATEGORIES.map(item => item.category)}/>
            <FeaturesSection/>
            <HowItWorksSection/>
            <CTASection/>
        </>
    )
}