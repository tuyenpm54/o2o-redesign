export interface MenuItem {
  id: number;
  name: string;
  price: number;
  cat?: string;
  img: string;
  desc?: string;
  matchReason?: string;
  originalPrice?: number;
}

export interface ComboItem extends MenuItem {
  originalPrice: number;
  save: number;
  people: number;
}

export interface CartItem {
  id?: number | string;
  item?: any;
  name?: string;
  price?: number;
  qty?: number;
  quantity?: number; // legacy alias
  selections?: any;
  img?: string;
}

export interface OrderItem {
  id: string;
  item_id?: number;
  name: string;
  price: number;
  qty: number;
  status: string;
  selections?: string;
  img?: string;
  timestamp: number;
  status_updated_at: number;
  round?: number;
}

export interface TableMember {
  id: string;
  name: string;
  avatar: string | null;
  color?: string;
  role?: string;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  tier?: string;
  points?: number;
  avatar?: string;
  preferences?: string[];
  isGuest?: number | boolean;
}

export interface SupportRequest {
  id: string;
  text: string;
  time: string;
  timestamp: number;
  status: string;
  status_updated_at?: number;
}
