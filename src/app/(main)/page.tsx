import LandingPage from "@/components/desktop/landing/LandingPage";
import HomePage from "@/components/desktop/home/Home";
import {auth} from "@/auth";
import {getTopGigs} from "@/lib/services/server/gig.server";
import ServerComponentError from "@/components/shared/ServerComponentError";
import {GIG_CATEGORIES} from "@/lib/constants/constant";
import {selectRandomItem} from "@/lib/utils/helper";
import {getTopSellers} from "@/lib/services/server/seller.server";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";


export default async function RootPage() {
    try {
        const user = (await auth())?.user;
        if (!user) return <LandingPage/>;

        const cookieStore = await cookies();
        const mode = cookieStore.get("mode");
        if (mode && mode.value === 'seller') {
            redirect(`/users/${user.username}/seller_dashboard`)
        }

        const randomCategoryObject = selectRandomItem(GIG_CATEGORIES);
        const randomCategory = randomCategoryObject.category;

        const [topGigs, topSellers, recommendedGigs] = await Promise.all([
            getTopGigs({size: 10}),
            getTopSellers({limit: 10}),
            getTopGigs({size: 10, category: randomCategory})
        ]);

        return (
            <HomePage
                topGigs={topGigs}
                recommendedGigs={recommendedGigs}
                recommendedCategory={randomCategory}
                topSellers={topSellers}
            />
        );
    } catch (error) {
        if (isRedirectError(error)) throw error;

        return <ServerComponentError error={error}/>;
    }
}

