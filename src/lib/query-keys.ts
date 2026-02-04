/**
 * Query Keys Factory
 * Centralizes all query keys for cache management and type safety
 */

interface UseAdditionsOptions {
  showAll?: boolean;
}

interface UseProductsOptions {
  categoryId?: string;
  isActive?: boolean;
  isAvailable?: boolean;
}

interface UseOrdersOptions {
  status?: string;
  type?: string;
  date?: string;
}

interface UseUsersOptions {
  role?: string;
  status?: string;
}

export const queryKeys = {
  // Additions
  additions: {
    all: () => ["additions"] as const,
    lists: () => [...queryKeys.additions.all(), "list"] as const,
    list: (options?: UseAdditionsOptions) =>
      [...queryKeys.additions.lists(), options] as const,
    details: () => [...queryKeys.additions.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.additions.details(), id] as const,
  },

  // Products
  products: {
    all: () => ["products"] as const,
    lists: () => [...queryKeys.products.all(), "list"] as const,
    list: (options?: UseProductsOptions) =>
      [...queryKeys.products.lists(), options] as const,
    details: () => [...queryKeys.products.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  // Categories
  categories: {
    all: () => ["categories"] as const,
    lists: () => [...queryKeys.categories.all(), "list"] as const,
    list: () => [...queryKeys.categories.lists()] as const,
    details: () => [...queryKeys.categories.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },

  // Orders
  orders: {
    all: () => ["orders"] as const,
    lists: () => [...queryKeys.orders.all(), "list"] as const,
    list: (options?: UseOrdersOptions) =>
      [...queryKeys.orders.lists(), options] as const,
    details: () => [...queryKeys.orders.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // Users
  users: {
    all: () => ["users"] as const,
    lists: () => [...queryKeys.users.all(), "list"] as const,
    list: (options?: UseUsersOptions) =>
      [...queryKeys.users.lists(), options] as const,
    details: () => [...queryKeys.users.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    addresses: (userId: string) =>
      [...queryKeys.users.all(), "addresses", userId] as const,
  },

  // Business
  business: {
    all: () => ["business"] as const,
    config: () => [...queryKeys.business.all(), "config"] as const,
    hours: () => [...queryKeys.business.all(), "hours"] as const,
  },
} as const;
