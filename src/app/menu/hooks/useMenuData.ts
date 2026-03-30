"use client";

import { useState, useCallback } from 'react';

interface Restaurant {
  name?: string;
  menu?: { items: any[]; categories: string[]; preferences: any[] };
  [key: string]: any;
}

interface UseMenuDataReturn {
  restaurant: Restaurant | null;
  menuItems: any[];
  categories: string[];
  preferencesList: any[];
  isLoading: boolean;
  errorHeader: string;
  cartItems: any[];
  setCartItems: (items: any[]) => void;
  total: number;
  setTotal: (val: number) => void;
  fetchMainData: () => Promise<void>;
}

export function useMenuData(
  resid: string | null,
  tableid: string | null
): UseMenuDataReturn {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [preferencesList, setPreferencesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState("");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const fetchMainData = useCallback(async () => {
    if (!resid || !tableid) {
      setErrorHeader("Thiếu thông tin nhà hàng hoặc mã bàn");
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
        setMenuItems(menuData);
        setPreferencesList(resData.menu.preferences || []);
        setCategories(resData.menu.categories || []);
      } else {
        setErrorHeader("Không tìm thấy dữ liệu nhà hàng");
      }

      if (cartData && !cartData.error) {
        const cart = cartData.data ?? cartData;
        // Build a lookup map to enrich cart items with full menu data (especially img)
        const menuMap: Record<number, any> = {};
        menuData.forEach((m: any) => { menuMap[m.id] = m; });
        const enrichedItems = (cart.items || []).map((ci: any) => ({
          ...ci,
          item: { ...ci.item, img: ci.item?.img || menuMap[ci.item?.id]?.img }
        }));
        setCartItems(enrichedItems);
        setTotal(cart.total || 0);
      }
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        // Silent common network error
      } else {
        console.warn("Failed to fetch menu data:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [resid, tableid]);

  return {
    restaurant,
    menuItems,
    categories,
    preferencesList,
    isLoading,
    errorHeader,
    cartItems,
    setCartItems,
    total,
    setTotal,
    fetchMainData,
  };
}
