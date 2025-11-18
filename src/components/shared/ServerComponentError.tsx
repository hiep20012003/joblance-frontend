import {FetchApiError} from "@/lib/utils/api";
import RefreshAccessToken from "@/components/shared/RefreshAccessToken";
import {redirect} from "next/navigation";

export default function ServerComponentError({error}: { error: unknown }) {
    if (error instanceof FetchApiError && error.statusCode === 401) {
        return <RefreshAccessToken/>
    }

    redirect(`/support?type=unknow`);
}