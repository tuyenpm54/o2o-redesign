export interface MenuItem {
  id: number;
  name: string;
  desc?: string;
  price: number;
  originalPrice?: number;
  img?: string;
  category: string;
  tags?: string[];
  status?: string;
  [key: string]: any;
}

export interface CartSelection {
  [key: string]: string[];
}

export interface CartEntry {
  id?: number;
  item: MenuItem;
  quantity: number;
  selections?: CartSelection;
}

export interface ConfirmOrder {
  id: number;
  name: string;
  qty: number;
  selections?: CartSelection;
  [key: string]: any;
}

export interface DraftItem {
  item: MenuItem;
  quantity: number;
  selections?: CartSelection;
}

export interface TableMember {
  id: string;
  name: string;
  avatar?: string;
  isHost?: boolean;
  confirmedOrders?: ConfirmOrder[];
  draftItems?: DraftItem[];
  [key: string]: any;
}

export interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  cover?: string;
  theme?: string;
  menu?: {
    categories?: string[];
    preferences?: string[];
    items?: MenuItem[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ServiceRequest {
  label: string;
  status: string;
  timestamp: number;
  [key: string]: any;
}
