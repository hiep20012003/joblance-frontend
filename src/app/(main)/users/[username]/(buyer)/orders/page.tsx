import BuyerManageOrders from "@/components/features/order/BuyerManageOrders";

interface OrdersPageProps {
    params: { username: string };
    searchParams: { page?: string; status?: string };
}

export default async function BuyerManageOrdersSSRPage({
                                                           params,
                                                           searchParams,
                                                       }: OrdersPageProps) {
    // // --- 1. Get User Data (Server-side) ---
    // // You'll need a way to get the user's ID on the server.
    // // This might involve reading a cookie, checking a session, etc.
    // const cookieStore = cookies();
    // const user = await getUserFromCookie(cookieStore); // Implement this function to read your auth cookie
    //
    // if (!user || user.username !== params.username) {
    //     // Redirect if user not logged in or trying to view another user's orders
    //     redirect('/login'); // Or to an unauthorized page
    //     return null; // Ensure nothing else renders
    // }
    //
    // const buyerId = user.id;
    //
    // // --- 2. Parse URL Params (Server-side) ---
    // const urlPage = Number(searchParams.page) || 1;
    // const urlStatus = searchParams.status || 'IN_PROGRESS';
    //
    // // Validate status
    // const isValidStatus = ORDER_STATUS_OPTIONS.some(
    //     (option) => option.value === urlStatus
    // );
    // const initialStatus = isValidStatus ? urlStatus : 'IN_PROGRESS';
    //
    // // --- 3. Fetch Initial Orders (Server-side) ---
    // let initialOrders: IOrderDocument[] = [];
    // let initialTotal: number = 0;
    //
    // try {
    //     const {orders, total} = await fetchOrders({ // Implement this fetch function
    //         buyerId: buyerId,
    //         status: initialStatus,
    //         page: urlPage,N
    //         limit: 4,
    //     });
    //     initialOrders = orders;
    //     initialTotal = total;
    // } catch (error) {
    //     console.error('Failed to fetch initial orders:', error);
    //     // Handle error: perhaps set initialOrders to empty and show a message
    // }

    // --- 4. Render Client Component with Server-fetched Data ---
    return (
        <BuyerManageOrders
            initialPage={1}
            initialTab={'IN_PROGRESS'}
        />
    );
}