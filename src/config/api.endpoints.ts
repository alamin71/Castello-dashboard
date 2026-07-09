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
    me:                 "/admin/me",
    updateProfile:      "/admin/profile/update",
    removeProfilePhoto: "/admin/profile/photo",
  },

  categories: {
    list:   "/categories",
    create: "/categories",
    update: (id: string) => `/categories/${id}`,
    delete: (id: string) => `/categories/${id}`,
  },

  variants: {
    categories: {
      list:   "/variant-categories",
      create: "/variant-categories",
      update: (id: string) => `/variant-categories/${id}`,
      delete: (id: string) => `/variant-categories/${id}`,
    },
    items: {
      list:   "/variant-items",
      create: "/variant-items",
      update: (id: string) => `/variant-items/${id}`,
      delete: (id: string) => `/variant-items/${id}`,
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
} as const;

export default API;
