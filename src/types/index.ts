export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status:
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'shipped'
    | 'delivered'
    | 'paid';
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  HashedPassword: string | null;
  role: 'customer' | 'admin';
  orders: Order[];
  createdAt: string;
  updatedAt: string;
};
