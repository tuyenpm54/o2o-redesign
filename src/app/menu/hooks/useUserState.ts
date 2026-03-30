import { useMemo } from 'react';

export type UserIntent = 'QUICK_ADD' | 'UNCONFIRMED_ALERT' | 'LONG_WAIT_ALERT' | 'POST_MEAL_PAYMENT' | 'TRACK_ORDER' | 'MID_MEAL_PROMPT' | 'PAYMENT_SUGGESTION' | 'NONE';

export interface UserState {
    intent: UserIntent;
    isReturningGuest: boolean;
    visitCount: number;
    minutesSinceLastOrder: number | null;
    activeOrders: any[];
    latestStatus: string | null;
    suggestions: any[];
    hasOrderedDessert: boolean;
}

export function useUserState(user: any, members: any[], allMenuItems: any[] = [], tableOrders: any[] = []) {
    const isReturningGuest = useMemo(() => (user?.visitCount || 0) >= 2, [user]);

    // tableOrders is now an array of rounds: [{ roundId, items: [...], ... }, ...]
    // Expose both: flat activeOrders (for status) and structured orderRounds (for UI)
    const orderRounds = useMemo(() => tableOrders, [tableOrders]);

    const activeOrders = useMemo(() => {
        const allItems: any[] = [];
        for (const round of tableOrders) {
            if (round.items && Array.isArray(round.items)) {
                allItems.push(...round.items);
            }
        }
        return allItems;
    }, [tableOrders]);

    const latestStatus = useMemo(() => {
        if (activeOrders.length === 0) return null;
        if (activeOrders.some((o: any) => !o.status || o.status === 'pending' || o.status === 'Chờ xác nhận')) return 'pending';
        if (activeOrders.some((o: any) => o.status === 'cooking' || o.status === 'Đang chế biến')) return 'cooking';
        if (activeOrders.some((o: any) => o.status === 'preparing' || o.status === 'Chờ phục vụ')) return 'preparing';
        return activeOrders[0].status;
    }, [activeOrders]);

    const suggestions = useMemo(() => {
        return allMenuItems.filter(i =>
            i.category?.toLowerCase().includes('uống') ||
            i.category?.toLowerCase().includes('khát') ||
            i.category?.toLowerCase().includes('tráng miệng')
        ).slice(0, 2);
    }, [allMenuItems]);

    const minutesSinceLastOrder = useMemo(() => {
        if (activeOrders.length === 0) return null;

        const timestamps = activeOrders
            .map((o: any) => o.timestamp)
            .filter((t: any) => !!t);

        if (timestamps.length === 0) return null;

        const latestTs = Math.max(...timestamps);
        return Math.floor((Date.now() - latestTs) / 60000);
    }, [activeOrders]);

    const intent = useMemo((): UserIntent => {
        if (activeOrders.length === 0 || minutesSinceLastOrder === null) return 'NONE';

        // Hardcoded thresholds since dynamic scenarios are removed
        const postMealThreshold = 45;
        const longWaitThreshold = 30;
        const unconfirmedThreshold = 15;
        const quickAddThreshold = 5;

        if (minutesSinceLastOrder >= postMealThreshold) return 'POST_MEAL_PAYMENT';

        if (latestStatus === 'pending') {
            if (minutesSinceLastOrder >= unconfirmedThreshold) return 'UNCONFIRMED_ALERT';
            return 'QUICK_ADD'; 
        }

        if (latestStatus !== 'done' && minutesSinceLastOrder >= longWaitThreshold) {
            return 'LONG_WAIT_ALERT';
        }

        if (minutesSinceLastOrder <= quickAddThreshold) return 'QUICK_ADD';

        return 'NONE';
    }, [minutesSinceLastOrder, activeOrders, latestStatus]);

    const hasOrderedDessert = useMemo(() => {
        return activeOrders.some((o: any) =>
            o.category?.toLowerCase().includes('tráng miệng') ||
            o.category?.toLowerCase().includes('dessert')
        );
    }, [activeOrders]);

    return {
        intent,
        isReturningGuest,
        visitCount: user?.visitCount || 1,
        minutesSinceLastOrder,
        activeOrders,
        orderRounds,
        latestStatus,
        suggestions,
        hasOrderedDessert
    };
}
