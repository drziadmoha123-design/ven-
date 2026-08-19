export type ViewType =
  | 'home'
  | 'products'
  | 'cart'
  | 'checkout'
  | 'account'
  | 'admin'
  | 'tracking'
  | 'product-detail'
  | 'product-details';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  points: number;
  referralCode: string;
  tier?: string;
  role?: 'ADMIN' | 'CUSTOMER';
}

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  pointsPrice: number;
  category: string;
  description?: string;
  desc?: string;
  stock: number;
  rating: number;
  reviewsCount?: number;
  reviews?: number;
  images?: string[];
  img?: string;
  featured?: boolean;
  isNew?: boolean;
  tags?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  img?: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  city: string;
  district: string;
  street: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  itemsCount?: number;
  total: number | string;
  pointsSpent?: number;
  status: OrderStatus;
  paymentMethod?: 'CASH' | 'POINTS';
  method?: string;
  address: OrderAddress;
  trackingNumber?: string;
}

export interface AdminStats {
  totalSales: number;
  totalOrders?: number;
  ordersCount?: number;
  totalUsers?: number;
  customers?: number;
  pointsIssued?: number;
  pointsRedeemed?: number;
  pointsSpent?: number;
  topProducts?: Array<{ id: number | string; name: string; sold: number; revenue?: number }>;
  salesByDay?: Array<{ day: string; val: number }>;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
