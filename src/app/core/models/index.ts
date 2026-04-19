export interface User {
  _id: string; name: string; email: string; phone?: string; role: 'admin'|'customer';
  avatar?: string; addresses: Address[]; wishlist: string[]; isActive: boolean;
}
export interface Address {
  _id: string; label: string; fullName: string; phone: string; street: string;
  city: string; province?: string; country: string; postalCode?: string; isDefault: boolean;
}
export interface Category {
  _id: string; name: string; slug: string; description?: string; image?: string;
  parent?: Category; children?: Category[];
}
export interface Product {
  _id: string; name: string; slug: string; description: string; shortDescription?: string;
  price: number; comparePrice?: number; category: Category; images: { url: string; alt: string; isPrimary: boolean }[];
  variants: { name: string; options: { value: string; stock: number; priceModifier: number }[] }[];
  stock: number; soldCount: number; brand?: string; tags: string[]; isFeatured: boolean;
  ratings: { average: number; count: number }; isActive: boolean;
}
export interface CartItem {
  _id: string; product: Product; quantity: number; price: number;
  variant?: { name: string; value: string }; totalPrice: number;
}
export interface Cart {
  items: CartItem[]; subtotal: number; totalItems: number;
  coupon?: { code: string; discount: number; type: string };
}
export interface OrderItem {
  product: string; name: string; image: string; quantity: number; price: number; totalPrice: number;
}
export interface Order {
  _id: string; orderNumber: string; user: User | string;
  items: OrderItem[]; shipping: Address & { shippingFee: number };
  subtotal: number; shippingFee: number; discount: number; tax: number; totalAmount: number;
  paymentMethod: 'KHQR'|'COD'; paymentStatus: 'pending'|'paid'|'failed'|'refunded';
  transactionId?: string; paidAt?: string;
  status: 'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled';
  statusHistory: { status: string; note: string; updatedAt: string }[];
  createdAt: string;
}
export interface Payment {
  _id: string; order: string; status: string;
  khqrData?: { qrCode: string; qrString: string; expiresAt: string };
  transactionId?: string; paidAt?: string; amount: number; currency: string;
}
export interface Review {
  _id: string; product: string; user: User; rating: number; title?: string;
  body: string; isVerifiedPurchase: boolean; helpfulVotes: number;
  adminReply?: { text: string; repliedAt: string }; createdAt: string;
}
export interface ApiResponse<T> { success: boolean; data: T; message?: string; total?: number; pages?: number; page?: number; }
