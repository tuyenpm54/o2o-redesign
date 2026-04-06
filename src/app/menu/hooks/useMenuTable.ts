import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { getCachedData } from '../utils/cache';

interface UseMenuTableProps {
  resid: string;
  tableid: string;
  user: any;
  onLiveMembersFetched: (newMembers: any[], isFirstLoad: boolean) => void;
  onCheckoutRequested: (requested: boolean) => void;
  onPaid: () => void;
  onTableClosed: () => void;
  onSupportRequests: (requests: any[]) => void;
  onCartFetched: (cartItems: any[], total: number) => void;
  onError: (msg: string) => void;
}

/**
 * useMenuTable Hook
 * Manages the domain data logic for the restaurant and table context.
 * Responsible for fetching and syncing table members, menu items, categories, 
 * preferences, and active live poll events (e.g. checkout requests).
 * 
 * @param {UseMenuTableProps} props - Props containing callbacks to sync events to other domains.
 * @returns {Object} Object containing restaurant data, table members, and fetching methods.
 */
export function useMenuTable({
  resid,
  tableid,
  user,
  onLiveMembersFetched,
  onCheckoutRequested,
  onPaid,
  onTableClosed,
  onSupportRequests,
  onCartFetched,
  onError
}: UseMenuTableProps) {
  const [restaurant, setRestaurant] = useState<any>(() => getCachedData(`o2o_res_${resid}`, null));
  const [menuItems, setMenuItems] = useState<any[]>(() => getCachedData(`o2o_menu_${resid}`, []));
  const [preferencesList, setPreferencesList] = useState<any[]>(() => getCachedData(`o2o_pref_${resid}`, []));
  const [categories, setCategories] = useState<string[]>(() => getCachedData(`o2o_cat_${resid}`, []));
  const [tableMembers, setTableMembers] = useState<any[]>(() => getCachedData(`o2o_tm_${resid}_${tableid}`, []));
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  const [sittingSince, setSittingSince] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const seenMemberIds = useRef<Set<string>>(new Set(tableMembers.map(m => m.id)));
  const membersRef = useRef<any[]>(tableMembers);
  const mountTimeRef = useRef<number>(Date.now());

  const [isLoading, setIsLoading] = useState(() => getCachedData(`o2o_res_${resid}`, null) === null);
  
  const [localHistory, setLocalHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_order_history');
      if (stored) setLocalHistory(JSON.parse(stored));
    } catch(e) {}
  }, []);

    useEffect(() => {
    // legacy fetch removed
  }, [resid]);

  const localVersionRef = useRef<number>(0);

  const fetchLiveTableData = useCallback(async (force = false) => {
    if (!resid || !tableid) return;
    try {
      if (!force) {
          const syncRes = await fetch(
             `/api/restaurants/${resid}/sync?tableid=${tableid}&t=${Date.now()}`,
             { cache: 'no-store' }
          );
          if (syncRes.ok) {
              const { version } = await syncRes.json();
              if (typeof version === 'number' && version <= localVersionRef.current) return;
              if (typeof version === 'number') localVersionRef.current = version;
          }
      }

      const liveRes = await fetch(`/api/restaurants/${resid}/live?tableid=${tableid}&t=${Date.now()}`, { cache: 'no-store' });
      if (!liveRes.ok) return;
      const liveData = await liveRes.json();
      if (liveData && !liveData.error) {
        if (!localVersionRef.current) localVersionRef.current = Date.now();

        const newMembers = liveData.members || [];
        const isFirstLoad = membersRef.current.length === 0;
        
        onLiveMembersFetched(newMembers, isFirstLoad);
        
        setTableMembers(newMembers);
        try { sessionStorage.setItem(`o2o_tm_${resid}_${tableid}`, JSON.stringify(newMembers)); } catch(e){}
        membersRef.current = newMembers;
        
        // Store table-level orders (all orders for the active table session)
        if (liveData.tableOrders) setTableOrders(liveData.tableOrders);
        
        if (liveData.hasOwnProperty('isCheckoutRequested')) onCheckoutRequested(liveData.isCheckoutRequested);
        if (liveData.sittingSince) setSittingSince(liveData.sittingSince);
        if (liveData.isPaid) onPaid();
        if (liveData.tableClosedTimestamp && liveData.tableClosedTimestamp > mountTimeRef.current) onTableClosed();
        if (liveData.supportRequests) onSupportRequests(liveData.supportRequests);
        if (liveData.notifications) setNotifications(liveData.notifications);
      }
    } catch (err: any) {
      if (err.name !== 'TypeError' || err.message !== 'Failed to fetch') console.warn("Live data poll failed:", err);
    }
  }, [resid, tableid, onLiveMembersFetched, onCheckoutRequested, onPaid, onTableClosed, onSupportRequests]);

  const fetchMainData = useCallback(async () => {
    if (!resid || !tableid) {
      onError("Thiếu thông tin nhà hàng hoặc mã bàn");
      setIsLoading(false);
      return;
    }
    try {
      const [resRes, cartRes] = await Promise.all([
        fetch(`/api/restaurants/${resid}`),
        fetch(`/api/cart?resId=${resid}&tableid=${tableid}`, { cache: 'no-store' })
      ]);
      const resData = await resRes.json();
      const cartData = await cartRes.json();

      const menuData = resData?.menu?.items || [];
      if (resData && !resData.error) {
        setRestaurant(resData);
        try { sessionStorage.setItem(`o2o_res_${resid}`, JSON.stringify(resData)); } catch(e){}
        setMenuItems(menuData);
        try { sessionStorage.setItem(`o2o_menu_${resid}`, JSON.stringify(menuData)); } catch(e){}
        setPreferencesList(resData.menu.preferences || []);
        try { sessionStorage.setItem(`o2o_pref_${resid}`, JSON.stringify(resData.menu.preferences || [])); } catch(e){}
        setCategories(resData.menu.categories || []);
        try { sessionStorage.setItem(`o2o_cat_${resid}`, JSON.stringify(resData.menu.categories || [])); } catch(e){}
      } else onError("Không tìm thấy dữ liệu nhà hàng");

      if (cartData && !cartData.error) {
        const cart = cartData.data ?? cartData;
        const menuMap: Record<number, any> = {};
        menuData.forEach((m: any) => { menuMap[m.id] = m; });
        const enrichedItems = (cart.items || []).map((ci: any) => ({
          ...ci, item: { ...ci.item, img: ci.item?.img || menuMap[ci.item?.id]?.img }
        }));
        onCartFetched(enrichedItems, cart.total || 0);
      }
    } catch (err: any) {
      if (err.name !== 'TypeError' || err.message !== 'Failed to fetch') console.warn("Failed to fetch menu data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [resid, tableid, onError, onCartFetched]);

  // Expose these for the UI
  const isItemConfirmed = useCallback((itemName: string) => {
    return tableMembers.some(m => m.confirmedOrders?.some((o: any) => o.name === itemName && o.qty > 0));
  }, [tableMembers]);

  const getConfirmedQty = useCallback((itemName: string) => {
    return tableMembers.reduce((sum, m) => {
      const orders = m.confirmedOrders?.filter((o: any) => o.name === itemName) || [];
      return sum + orders.reduce((s: number, o: any) => s + (Number(o.qty) || 0), 0);
    }, 0);
  }, [tableMembers]);

  const getDraftingUser = useCallback((itemId: number) => {
    return tableMembers.find(m => m.id !== user?.id && m.draftItems?.some((d: any) => d.item.id === itemId && d.quantity > 0));
  }, [tableMembers, user?.id]);

  const topItems = useMemo(() => {
    return menuItems.filter((item: any) => item.status === "Best Seller" || item.tags?.includes("Bán chạy")).slice(0, 5);
  }, [menuItems]);

  const personalizedItems = useMemo(() => {
    const usr = user as any;
    const historyData = localHistory?.length > 0 ? localHistory : (usr?.history || []);
    
    // Step 1: Lịch sử gọi món
    let recommendedFromHistory: any[] = [];
    if (historyData.length > 0) {
      const freq: Record<string, number> = {};
      const reasons: Record<string, string> = {};
      
      historyData.forEach((h: any) => {
        const id = h.id?.toString() || h.toString();
        const qty = h.quantity || 1;
        freq[id] = (freq[id] || 0) + Number(qty);
        if (h.matchReason) reasons[id] = h.matchReason;
      });
      
      const sortedIds = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
      
      recommendedFromHistory = sortedIds
        .map(id => menuItems.find(m => m.id?.toString() === id))
        .filter(Boolean)
        .map(item => ({
          ...item,
          matchReason: reasons[item.id?.toString()] || `Đã gọi ${freq[item.id?.toString()]} lần`
        }));
    }

    // Chỉ hiển thị món user từng gọi theo thứ tự số lượng gọi từ cao tới thấp, tối đa 5 món
    if (recommendedFromHistory.length > 0) {
      return recommendedFromHistory.slice(0, 5);
    }

    // --- FALLBACK FOR PREVIEW / NEW USERS ---
    // If no history exists, we pick 2-3 random "best seller" items or first 3 items 
    // to ensure the "Món bạn từng gọi" block shows up during development/preview.
    // In production, we might want to hide it, but for development it helps to see it.
    const isPreview = typeof window !== 'undefined' && localStorage.getItem('preview_storefront_config');
    if (isPreview && menuItems.length > 0) {
      return menuItems
        .filter((i: any) => i.status === "Best Seller" || i.tags?.includes("Bán chạy"))
        .slice(0, 3)
        .map((item: any) => ({
          ...item,
          matchReason: "Gợi ý dành riêng cho bạn"
        }));
    }

    return [];
  }, [menuItems, user, localHistory]);

  return {
    restaurant, setRestaurant,
    menuItems, setMenuItems,
    preferencesList, setPreferencesList,
    categories, setCategories,
    tableMembers, setTableMembers,
    tableOrders,
    sittingSince, setSittingSince,
    isLoading, setIsLoading,
    fetchLiveTableData, fetchMainData,
    seenMemberIds, membersRef,
    isItemConfirmed,
    getConfirmedQty,
    getDraftingUser,
    topItems,
    personalizedItems,
    notifications,
    setNotifications
  };
}
