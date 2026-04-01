import { useState, useCallback, useRef, MutableRefObject } from 'react';
import { getCachedData } from '../utils/cache';
import { MenuItem, CartSelection, CartEntry, TableMember } from '@/types/models';

export interface TableAPI {
  tableMembers: TableMember[];
  menuItems: MenuItem[];
  getDraftingUser: (id: number) => any;
  fetchMainData: () => void;
  fetchLiveTableData: (force?: boolean) => void;
}


interface UseMenuCartProps {
  resid: string;
  tableid: string;
  user: any;
  isLoggedIn: boolean;
  loginAsGuest: () => Promise<any>;
  setToast: (toast: { message: string, submessage?: string } | null) => void;
  checkUnread: () => void;
  isWizardShown: boolean;
  tableAPI: MutableRefObject<TableAPI>;
  setSelectedItem: (item: MenuItem | null) => void;
  setEditInitialSelections: (sel: CartSelection | null) => void;
  setEditCurrentQty: (qty: number) => void;
}

/**
 * useMenuCart Hook
 * Manages the shopping cart items, total calculations, modifications, 
 * and API calls for placing orders. 
 * This hook requires `tableAPI` object reference to perform cross-checks (e.g. drafting collisions)
 * without falling into dependency cycles or unstable closures.
 * 
 * @param {UseMenuCartProps} props - Props providing UI callbacks and `tableAPI` ref.
 * @returns {Object} Object containing cart items, total calculation, and cart modifier functions.
 */
export function useMenuCart({
  resid,
  tableid,
  user,
  isLoggedIn,
  loginAsGuest,
  setToast,
  checkUnread,
  isWizardShown,
  tableAPI,
  setSelectedItem,
  setEditInitialSelections,
  setEditCurrentQty
}: UseMenuCartProps) {
  const [cartItems, setCartItems] = useState<CartEntry[]>(() => getCachedData(`o2o_cart_${resid}_${tableid}`, []));
  const [total, setTotal] = useState(0);
  const [cartPulse, setCartPulse] = useState(false);
  const [isCheckoutRequested, setIsCheckoutRequested] = useState(false);
  const [isTotalUpdating, setIsTotalUpdating] = useState(false);
  const [collisionData, setCollisionData] = useState<{ item: MenuItem; quantity: number; selections?: CartSelection; message: string } | null>(null);
  const [crossSellData, setCrossSellData] = useState<{ mainItem: MenuItem; quantity: number; selections?: CartSelection; suggestions: MenuItem[] } | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  
  // To avoid unneeded re-renders, use a ref for some things if we don't want them in the dependency array, 
  // but standard useCallback is fine here.
  
  const proceedAddToCart = useCallback(async (item: MenuItem, quantity: number, selections?: CartSelection) => {
    try {
      let currentUser = user;
      let authenticated = isLoggedIn;

      if (!authenticated) {
        setToast({ message: "Đang khởi tạo phiên...", submessage: "Vui lòng đợi giây lát" });
        const guest = await loginAsGuest();
        if (!guest) {
          setToast({ message: "Lỗi đăng nhập", submessage: "Vui lòng thử lại sau" });
          return;
        }
        currentUser = guest;
        authenticated = true;
        if (resid && tableid) {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resid, tableid })
          });
        }
      }

      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 500);

      setCartItems((prev: any[]) => {
        const newCart = [...prev];
        const existingIdx = newCart.findIndex(i => 
          i.item.id === item.id && JSON.stringify(i.selections || {}) === JSON.stringify(selections || {})
        );
        
        if (existingIdx !== -1) {
          const updatedItem = { ...newCart[existingIdx] };
          updatedItem.quantity += quantity;
          if (updatedItem.quantity <= 0) {
            newCart.splice(existingIdx, 1);
          } else {
            newCart[existingIdx] = updatedItem;
          }
        } else if (quantity > 0) {
          newCart.push({ item, quantity, selections: selections || {} });
        }
        return newCart;
      });
      setTotal((prev: number) => Math.max(0, prev + (item.price * (Number(quantity) || 0))));
      setIsTotalUpdating(true);

      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resId: resid, tableid, item, quantity, selections })
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          setToast({
            message: "Lỗi thêm vào giỏ hàng",
            submessage: errorData.error || "Vui lòng thử lại sau"
          });
          setTimeout(() => setToast(null), 4000);
        }
        tableAPI.current?.fetchMainData();
        setIsTotalUpdating(false);
      }).catch(e => {
        console.error("Cart update failed", e);
        setToast({ message: "Lỗi kết nối", submessage: "Không thể thêm món vào giỏ hàng" });
        setTimeout(() => setToast(null), 4000);
        tableAPI.current?.fetchMainData();
        setIsTotalUpdating(false);
      });

    } catch (e) {
      console.error("Critical cart error", e);
    }
  }, [user, isLoggedIn, loginAsGuest, resid, tableid, setToast, tableAPI]);

  const getCrossSellSuggestions = useCallback((item: MenuItem) => {
    if (item.category !== 'Món Chính' && item.category !== 'Lẩu & Nướng') return [];
    try { if (sessionStorage.getItem('cross_sell_shown') === 'true') return []; } catch (e) { }

    const drinks = (tableAPI.current?.menuItems || []).filter((i: any) => i.category.toLowerCase().includes('khát') || i.category.toLowerCase().includes('uống') || i.category.toLowerCase().includes('drink'));
    return drinks.slice(0, 3);
  }, [tableAPI]);

  const acknowledgedCollisions = useRef<Set<string>>(new Set());

  const addToTotal = useCallback(async (item: MenuItem, quantity: number = 1, selections?: CartSelection) => {
    if (quantity > 0 && isCheckoutRequested) {
      setToast({ message: "Bàn đang yêu cầu thanh toán", submessage: "Không thể gọi thêm món lúc này" });
      return;
    }
    if (quantity > 0) {
      const draftingUser = tableAPI.current?.getDraftingUser(item.id);
      if (draftingUser) {
        setToast({ message: `${draftingUser.name} đang chọn món này`, submessage: "Vui lòng chờ họ gọi hoặc đổi món khác" });
        return;
      }

      const collisionFriend = (tableAPI.current?.tableMembers || []).find(m =>
        m.confirmedOrders && m.confirmedOrders.some((o: any) => o.name === item.name && o.qty > 0)
      );

      if (!isWizardShown && collisionFriend && !acknowledgedCollisions.current.has(item.name)) {
        const msg = collisionFriend.id === user?.id
          ? `Bạn đã gọi món này rồi`
          : `${collisionFriend.name} ở cùng bàn đã gọi món này`;

        setCollisionData({
          item,
          quantity,
          selections,
          message: `${msg}, bạn có chắc muốn gọi thêm không?`
        });
        return;
      }

      if (!isWizardShown) {
        const suggestions = getCrossSellSuggestions(item);
        if (suggestions.length > 0) {
          setCrossSellData({ mainItem: item, quantity, selections, suggestions });
          return;
        }
      }
    }
    await proceedAddToCart(item, quantity, selections);
  }, [isCheckoutRequested, tableAPI, isWizardShown, getCrossSellSuggestions, proceedAddToCart, user?.id, setToast]);

  const removeFromTotal = useCallback(async (item: MenuItem) => {
    const cartEntry = cartItems.find(i => i.item.id === item.id);
    if (cartEntry) {
      await proceedAddToCart(item, -1, cartEntry.selections);
    }
  }, [cartItems, proceedAddToCart]);

  const handlePlaceOrder = useCallback(async () => {
    const previousCartItems = [...cartItems];
    const previousTotal = total;

    setIsCartDrawerOpen(false);
    setCartItems([]);
    setTotal(0);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resId: resid, tableid: tableid })
      });

      if (res.ok) {
        tableAPI.current?.fetchLiveTableData(true);
        setTimeout(() => { tableAPI.current?.fetchMainData(); }, 800);
        setTimeout(checkUnread, 1500);
      } else {
        const data = await res.json();
        setCartItems(previousCartItems);
        setTotal(previousTotal);
        setIsCartDrawerOpen(true);
        setToast({
          message: data.error || "Đặt món thất bại",
          submessage: "Vui lòng thử lại sau"
        });
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      console.error("Place order failed:", err);
      setCartItems(previousCartItems);
      setTotal(previousTotal);
      setIsCartDrawerOpen(true);
      setToast({ message: "Lỗi kết nối", submessage: "Vui lòng kiểm tra lại mạng" });
      setTimeout(() => setToast(null), 4000);
    }
  }, [cartItems, total, resid, tableid, tableAPI, checkUnread, setToast]);

  const getItemQuantity = useCallback((id: number) => {
    return cartItems
      .filter((i: any) => i.item.id === id)
      .reduce((sum: number, curr: any) => sum + Number(curr.quantity), 0);
  }, [cartItems]);

  const handleEditCartItem = useCallback((cartEntry: CartEntry) => {
    setSelectedItem(cartEntry.item);
    setEditInitialSelections(cartEntry.selections || null);
    setEditCurrentQty(Number(cartEntry.quantity) || 1);
    setIsCartDrawerOpen(false);
  }, [setSelectedItem, setEditInitialSelections, setEditCurrentQty]);

  return {
    cartItems, setCartItems,
    total, setTotal,
    cartPulse, setCartPulse,
    isCheckoutRequested, setIsCheckoutRequested,
    collisionData, setCollisionData,
    crossSellData, setCrossSellData,
    isCartDrawerOpen, setIsCartDrawerOpen,
    isTotalUpdating,
    proceedAddToCart,
    addToTotal,
    removeFromTotal,
    handlePlaceOrder,
    getItemQuantity,
    handleEditCartItem,
    acknowledgedCollisions
  };
}
