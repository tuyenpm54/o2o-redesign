"use client";

import { useState, useRef, useCallback } from 'react';

interface TableMember {
  id: string;
  name: string;
  confirmedOrders?: Array<{ name: string; qty: number; id?: number; [key: string]: any }>;
  draftItems?: Array<{ item: { id: number }; quantity: number; [key: string]: any }>;
  [key: string]: any;
}

interface CollisionData {
  item: any;
  quantity: number;
  selections?: any;
  message: string;
}

interface CrossSellData {
  mainItem: any;
  quantity: number;
  selections?: any;
  suggestions: any[];
}

interface UseCartOperationsParams {
  resid: string | null;
  tableid: string | null;
  user: any;
  isLoggedIn: boolean;
  loginAsGuest: () => Promise<any>;
  cartItems: any[];
  setCartItems: (items: any[]) => void;
  total: number;
  setTotal: (val: number) => void;
  menuItems: any[];
  tableMembers: TableMember[];
  isCheckoutRequested: boolean;
  isWizardShown: boolean;
  setToast: (toast: { message: string; submessage: string } | null) => void;
  fetchMainData: () => Promise<void>;
  fetchLiveTableData: () => Promise<void>;
  checkUnread: () => void;
  setIsCartDrawerOpen: (val: boolean) => void;
  selectedItem: any;
  setSelectedItem: (item: any) => void;
}

interface UseCartOperationsReturn {
  cartPulse: boolean;
  collisionData: CollisionData | null;
  setCollisionData: (data: CollisionData | null) => void;
  crossSellData: CrossSellData | null;
  setCrossSellData: (data: CrossSellData | null) => void;
  editInitialSelections: any;
  setEditInitialSelections: (val: any) => void;
  editCurrentQty: number;
  setEditCurrentQty: (val: number) => void;
  acknowledgedCollisions: React.MutableRefObject<Set<string>>;
  addToTotal: (item: any, quantity?: number, selections?: any) => Promise<void>;
  removeFromTotal: (item: any) => Promise<void>;
  handleRemoveFromCart: (cartEntry: any) => Promise<void>;
  handleIncrementCartItem: (cartEntry: any) => Promise<void>;
  handleDecrementCartItem: (cartEntry: any) => Promise<void>;
  handleEditCartItem: (cartEntry: any) => void;
  syncCartQuantity: (item: any, newQty: number, selections?: any) => Promise<void>;
  handlePlaceOrder: () => Promise<void>;
  getItemQuantity: (id: number) => number;
  getDraftingUser: (itemId: number) => TableMember | undefined;
  getCrossSellSuggestions: (item: any) => any[];
  proceedAddToCart: (item: any, quantity: number, selections?: any) => Promise<void>;
}

export function useCartOperations({
  resid,
  tableid,
  user,
  isLoggedIn,
  loginAsGuest,
  cartItems,
  setCartItems,
  total,
  setTotal,
  menuItems,
  tableMembers,
  isCheckoutRequested,
  isWizardShown,
  setToast,
  fetchMainData,
  fetchLiveTableData,
  checkUnread,
  setIsCartDrawerOpen,
  selectedItem,
  setSelectedItem,
}: UseCartOperationsParams): UseCartOperationsReturn {
  const [cartPulse, setCartPulse] = useState(false);
  const [collisionData, setCollisionData] = useState<CollisionData | null>(null);
  const [crossSellData, setCrossSellData] = useState<CrossSellData | null>(null);
  const [editInitialSelections, setEditInitialSelections] = useState<any>(null);
  const [editCurrentQty, setEditCurrentQty] = useState<number>(0);
  const acknowledgedCollisions = useRef<Set<string>>(new Set());

  // ── Helpers ──

  const getDraftingUser = useCallback(
    (itemId: number) =>
      tableMembers.find(
        (m) => m.id !== user?.id && m.draftItems?.some((d: any) => d.item.id === itemId && d.quantity > 0)
      ),
    [tableMembers, user?.id]
  );

  const getCrossSellSuggestions = useCallback(
    (item: any) => {
      if (item.category !== 'Món Chính' && item.category !== 'Lẩu & Nướng') return [];
      try {
        if (sessionStorage.getItem('cross_sell_shown') === 'true') return [];
      } catch (e) { /* no-op */ }

      const drinks = menuItems.filter(
        (i) =>
          i.category.toLowerCase().includes('khát') ||
          i.category.toLowerCase().includes('uống') ||
          i.category.toLowerCase().includes('drink')
      );
      return drinks.slice(0, 3);
    },
    [menuItems]
  );

  const getItemQuantity = useCallback(
    (id: number) =>
      cartItems
        .filter((i) => i.item.id === id)
        .reduce((sum, curr) => sum + Number(curr.quantity), 0),
    [cartItems]
  );

  // ── Core cart mutation ──

  const proceedAddToCart = useCallback(
    async (item: any, quantity: number, selections?: any) => {
      try {
        let currentUser = user;
        let authenticated = isLoggedIn;

        if (!authenticated) {
          setToast({ message: 'Đang khởi tạo phiên...', submessage: 'Vui lòng đợi giây lát' });
          const guest = await loginAsGuest();
          if (!guest) {
            setToast({ message: 'Lỗi đăng nhập', submessage: 'Vui lòng thử lại sau' });
            return;
          }
          currentUser = guest;
          authenticated = true;
          if (resid && tableid) {
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ resid, tableid }),
            });
          }
        }

        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resId: resid, tableid, item, quantity, selections }),
        });

        if (res.ok) {
          setCartPulse(true);
          setTimeout(() => setCartPulse(false), 500);
          await fetchMainData();
        } else {
          const errorData = await res.json().catch(() => ({}));
          setToast({
            message: 'Lỗi thêm vào giỏ hàng',
            submessage: errorData.error || 'Vui lòng thử lại sau',
          });
          setTimeout(() => setToast(null), 4000);
        }
      } catch (e) {
        console.error('Cart update failed', e);
        setToast({ message: 'Lỗi kết nối', submessage: 'Không thể thêm món vào giỏ hàng' });
        setTimeout(() => setToast(null), 4000);
      }
    },
    [resid, tableid, user, isLoggedIn, loginAsGuest, fetchMainData, setToast]
  );

  // ── Public operations ──

  const addToTotal = useCallback(
    async (item: any, quantity: number = 1, selections?: any) => {
      if (quantity > 0 && isCheckoutRequested) {
        setToast({ message: 'Bàn đang yêu cầu thanh toán', submessage: 'Không thể gọi thêm món lúc này' });
        return;
      }
      if (quantity > 0) {
        const draftingUser = getDraftingUser(item.id);
        if (draftingUser) {
          setToast({
            message: `${draftingUser.name} đang chọn món này`,
            submessage: 'Vui lòng chờ họ gọi hoặc đổi món khác',
          });
          return;
        }

        const collisionFriend = tableMembers.find(
          (m) =>
            m.confirmedOrders && m.confirmedOrders.some((o: any) => o.name === item.name && o.qty > 0)
        );

        if (!isWizardShown && collisionFriend && !acknowledgedCollisions.current.has(item.name)) {
          const msg =
            collisionFriend.id === user?.id
              ? 'Bạn đã gọi món này rồi'
              : `${collisionFriend.name} ở cùng bàn đã gọi món này`;

          setCollisionData({
            item,
            quantity,
            selections,
            message: `${msg}, bạn có chắc muốn gọi thêm không?`,
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
    },
    [
      isCheckoutRequested,
      getDraftingUser,
      tableMembers,
      isWizardShown,
      user?.id,
      getCrossSellSuggestions,
      proceedAddToCart,
      setToast,
    ]
  );

  const removeFromTotal = useCallback(
    async (item: any) => {
      const cartEntry = cartItems.find((i) => i.item.id === item.id);
      if (cartEntry) {
        await proceedAddToCart(item, -1, cartEntry.selections);
      }
    },
    [cartItems, proceedAddToCart]
  );

  const handleRemoveFromCart = useCallback(
    async (cartEntry: any) => {
      await proceedAddToCart(cartEntry.item, -cartEntry.quantity, cartEntry.selections);
    },
    [proceedAddToCart]
  );

  const handleIncrementCartItem = useCallback(
    async (cartEntry: any) => {
      await proceedAddToCart(cartEntry.item, 1, cartEntry.selections);
    },
    [proceedAddToCart]
  );

  const handleDecrementCartItem = useCallback(
    async (cartEntry: any) => {
      await proceedAddToCart(cartEntry.item, -1, cartEntry.selections);
    },
    [proceedAddToCart]
  );

  const handleEditCartItem = useCallback(
    (cartEntry: any) => {
      setSelectedItem(cartEntry.item);
      setEditInitialSelections(cartEntry.selections);
      setEditCurrentQty(Number(cartEntry.quantity) || 1);
      setIsCartDrawerOpen(false);
    },
    [setSelectedItem, setIsCartDrawerOpen]
  );

  const syncCartQuantity = useCallback(
    async (item: any, newQty: number, selections?: any) => {
      const targetQty = Number(newQty);

      if (editInitialSelections && JSON.stringify(editInitialSelections) !== JSON.stringify(selections)) {
        // Selections changed — remove old variant, add new
        await proceedAddToCart(item, -editCurrentQty, editInitialSelections);
        if (targetQty > 0) {
          await proceedAddToCart(item, targetQty, selections);
        }
      } else {
        const currentEntry = cartItems.find(
          (i) =>
            i.item.id === item.id &&
            JSON.stringify(i.selections) === JSON.stringify(selections)
        );
        const currentQty = Number(currentEntry?.quantity || 0);
        const diff = targetQty - currentQty;

        if (diff > 0 && isCheckoutRequested) {
          setToast({ message: 'Bàn đang yêu cầu thanh toán', submessage: 'Không thể gọi thêm món lúc này' });
          return;
        }

        if (diff !== 0) {
          await proceedAddToCart(item, diff, selections);
        }
      }

      setSelectedItem(null);
      setEditInitialSelections(null);
      setEditCurrentQty(0);
    },
    [cartItems, editInitialSelections, editCurrentQty, isCheckoutRequested, proceedAddToCart, setToast, setSelectedItem]
  );

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
        body: JSON.stringify({ resId: resid, tableid }),
      });

      if (res.ok) {
        fetchLiveTableData();
        setTimeout(() => fetchMainData(), 800);
        setTimeout(checkUnread, 1500);
      } else {
        const data = await res.json();
        setCartItems(previousCartItems);
        setTotal(previousTotal);
        setIsCartDrawerOpen(true);
        setToast({
          message: data.error || 'Đặt món thất bại',
          submessage: 'Vui lòng thử lại sau',
        });
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      console.error('Place order failed:', err);
      setCartItems(previousCartItems);
      setTotal(previousTotal);
      setIsCartDrawerOpen(true);
      setToast({ message: 'Lỗi kết nối', submessage: 'Vui lòng kiểm tra lại mạng' });
      setTimeout(() => setToast(null), 4000);
    }
  }, [
    cartItems,
    total,
    resid,
    tableid,
    setCartItems,
    setTotal,
    setIsCartDrawerOpen,
    fetchMainData,
    fetchLiveTableData,
    checkUnread,
    setToast,
  ]);

  return {
    cartPulse,
    collisionData,
    setCollisionData,
    crossSellData,
    setCrossSellData,
    editInitialSelections,
    setEditInitialSelections,
    editCurrentQty,
    setEditCurrentQty,
    acknowledgedCollisions,
    addToTotal,
    removeFromTotal,
    handleRemoveFromCart,
    handleIncrementCartItem,
    handleDecrementCartItem,
    handleEditCartItem,
    syncCartQuantity,
    handlePlaceOrder,
    getItemQuantity,
    getDraftingUser,
    getCrossSellSuggestions,
    proceedAddToCart,
  };
}
