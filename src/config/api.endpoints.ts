// All backend API endpoints in one place.
// Base URL (NEXT_PUBLIC_API_URL) already includes /api/v1

const API = {
  auth: {
    login:           "/admin/login",
    logout:          "/admin/logout",
    changePassword:  "/admin/change-password",
    forgotPassword:  "/admin/forget-password",
    resendOtp:       "/admin/resend-otp",
    verifyResetOtp:  "/admin/verify-reset-otp",
    resetPassword:   "/admin/reset-password",
    me:                    "/admin/profile",
    updateProfile:         "/admin/profile/update",
    removeProfilePhoto:    "/admin/profile/photo",
    changeEmailRequest:    "/admin/change-email/request",
    changeEmailVerifyOtp:  "/admin/change-email/verify-otp",
  },

  categories: {
    list:    "/admin/menu/categories",
    create:  "/admin/menu/categories",
    update:  (id: string) => `/admin/menu/categories/${id}`,
    delete:  (id: string) => `/admin/menu/categories/${id}`,
    reorder: "/admin/menu/categories/reorder",
  },

  variants: {
    categories: {
      list:   "/admin/menu/variants/categories",
      create: "/admin/menu/variants/categories",
      update: (id: string) => `/admin/menu/variants/categories/${id}`,
      delete: (id: string) => `/admin/menu/variants/categories/${id}`,
    },
    items: {
      list:   "/admin/menu/variants/items",
      create: "/admin/menu/variants/items",
      update: (id: string) => `/admin/menu/variants/items/${id}`,
      delete: (id: string) => `/admin/menu/variants/items/${id}`,
    },
  },

  toppings: {
    categories: {
      list:   "/admin/menu/toppings/categories",
      create: "/admin/menu/toppings/categories",
      update: (id: string) => `/admin/menu/toppings/categories/${id}`,
      delete: (id: string) => `/admin/menu/toppings/categories/${id}`,
    },
    items: {
      list:   "/admin/menu/toppings/items",
      create: "/admin/menu/toppings/items",
      update: (id: string) => `/admin/menu/toppings/items/${id}`,
      delete: (id: string) => `/admin/menu/toppings/items/${id}`,
    },
  },

  products: {
    list:   "/admin/menu/products",
    create: "/admin/menu/products",
    update: (id: string) => `/admin/menu/products/${id}`,
    delete: (id: string) => `/admin/menu/products/${id}`,
  },

  offers: {
    list:   "/admin/promotions/offers",
    create: "/admin/promotions/offers",
    getById: (id: string) => `/admin/promotions/offers/${id}`,
    update: (id: string) => `/admin/promotions/offers/${id}`,
    delete: (id: string) => `/admin/promotions/offers/${id}`,
  },

  coupons: {
    list:   "/admin/promotions/coupons",
    create: "/admin/promotions/coupons",
    update: (id: string) => `/admin/promotions/coupons/${id}`,
    delete: (id: string) => `/admin/promotions/coupons/${id}`,
  },

  discounts: {
    list:   "/admin/promotions/discounts",
    create: "/admin/promotions/discounts",
    update: (id: string) => `/admin/promotions/discounts/${id}`,
    delete: (id: string) => `/admin/promotions/discounts/${id}`,
  },

  policy: {
    get:    (slug: string) => `/admin/policy/${slug}`,
    create: (slug: string) => `/admin/policy/${slug}`,
    update: (slug: string) => `/admin/policy/${slug}`,
  },
} as const;

export default API;
