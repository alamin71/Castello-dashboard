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
      list:   "/topping-categories",
      create: "/topping-categories",
      update: (id: string) => `/topping-categories/${id}`,
      delete: (id: string) => `/topping-categories/${id}`,
    },
    items: {
      list:   "/topping-items",
      create: "/topping-items",
      update: (id: string) => `/topping-items/${id}`,
      delete: (id: string) => `/topping-items/${id}`,
    },
  },

  products: {
    list:   "/products",
    create: "/products",
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },

  offers: {
    list:   "/special-offers",
    create: "/special-offers",
    update: (id: string) => `/special-offers/${id}`,
    delete: (id: string) => `/special-offers/${id}`,
  },

  policy: {
    get:    (slug: string) => `/admin/policy/${slug}`,
    create: (slug: string) => `/admin/policy/${slug}`,
    update: (slug: string) => `/admin/policy/${slug}`,
  },
} as const;

export default API;
