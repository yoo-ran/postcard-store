import { useCartStore } from '@/store/cart.store';

// ── localStorage mock ─────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockItem = {
  id: 'p1',
  name: 'Postcard A',
  price: 299,
  imageUrl: null,
};

const mockItem2 = {
  id: 'p2',
  name: 'Postcard B',
  price: 499,
  imageUrl: null,
};

// ── Reset between tests ───────────────────────────────────────────────────────
beforeEach(() => {
  useCartStore.setState({ items: [] });
});

// ── addItem ───────────────────────────────────────────────────────────────────
describe('addItem', () => {
  it('adds a new item with quantity 1', () => {
    useCartStore.getState().addItem(mockItem);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
    expect(items[0].id).toBe('p1');
  });

  it('increments quantity when adding a duplicate item', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem(mockItem);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1); // no duplicate entry
    expect(items[0].quantity).toBe(2); // quantity incremented
  });

  it('adds multiple different items as separate entries', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem(mockItem2);
    expect(useCartStore.getState().items).toHaveLength(2);
  });
});

// ── removeItem ────────────────────────────────────────────────────────────────
describe('removeItem', () => {
  it('removes an item by id', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().removeItem('p1');
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('only removes the targeted item', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem(mockItem2);
    useCartStore.getState().removeItem('p1');
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('p2');
  });

  it('does nothing when id does not exist', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().removeItem('nonexistent');
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

// ── updateQuantity ────────────────────────────────────────────────────────────
describe('updateQuantity', () => {
  it('updates the quantity of an item', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().updateQuantity('p1', 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('removes the item when quantity is set to 0', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().updateQuantity('p1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('removes the item when quantity is negative', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().updateQuantity('p1', -1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

// ── totalItems ────────────────────────────────────────────────────────────────
describe('totalItems', () => {
  it('returns 0 for an empty cart', () => {
    expect(useCartStore.getState().totalItems()).toBe(0);
  });

  it('returns the sum of all quantities', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem(mockItem); // quantity → 2
    useCartStore.getState().addItem(mockItem2); // quantity → 1
    expect(useCartStore.getState().totalItems()).toBe(3);
  });
});

// ── totalPrice ────────────────────────────────────────────────────────────────
describe('totalPrice', () => {
  it('returns 0 for an empty cart', () => {
    expect(useCartStore.getState().totalPrice()).toBe(0);
  });

  it('calculates total price in cents correctly', () => {
    useCartStore.getState().addItem(mockItem); // 299 × 1
    useCartStore.getState().addItem(mockItem2); // 499 × 1
    expect(useCartStore.getState().totalPrice()).toBe(798);
  });

  it('accounts for quantity in total price', () => {
    useCartStore.getState().addItem(mockItem); // 299 × 1
    useCartStore.getState().addItem(mockItem); // 299 × 2
    expect(useCartStore.getState().totalPrice()).toBe(598);
  });
});

// ── clearCart ─────────────────────────────────────────────────────────────────
describe('clearCart', () => {
  it('removes all items from the cart', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem(mockItem2);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('resets totalItems and totalPrice to 0', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().totalItems()).toBe(0);
    expect(useCartStore.getState().totalPrice()).toBe(0);
  });
});
