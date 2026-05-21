// Arabic translations — single source of truth for all UI strings.
// English equivalents live in ./en.ts (placeholder for Phase 1).

export const ar = {
  appName: "كامبس واش",
  tagline: "غسيل سيارتك وانت في المحاضرة",
  common: {
    loading: "جاري التحميل...",
    save: "حفظ",
    cancel: "إلغاء",
    continue: "متابعة",
    back: "رجوع",
    logout: "تسجيل خروج",
    error: "حدث خطأ، حاول مرة أخرى",
  },
  landing: {
    description: "غسيل سيارتك وانت في المحاضرة — اطلب الخدمة ونحن نوصلها لموقفك.",
    loginAsStudent: "سجل دخول كطالب",
    loginAsWorker: "سجل دخول كعامل",
  },
  login: {
    title: "تسجيل الدخول",
    phoneLabel: "رقم الجوال",
    phonePlaceholder: "مثال: 96891234567",
    sendOtp: "إرسال رمز التحقق",
    otpLabel: "رمز التحقق",
    otpPlaceholder: "أدخل الرمز المكوّن من 6 أرقام",
    verify: "تأكيد ودخول",
    resend: "إعادة إرسال الرمز",
    changePhone: "تغيير الرقم",
    otpSent: "تم إرسال رمز التحقق إلى جوالك",
    invalidPhone: "رقم الجوال غير صحيح",
    invalidOtp: "رمز التحقق غير صحيح أو منتهي الصلاحية",
  },
  onboarding: {
    title: "أكمل بياناتك",
    subtitle: "نحتاج بعض المعلومات لإكمال حسابك",
    nameLabel: "الاسم",
    namePlaceholder: "أدخل اسمك الكامل",
    roleLabel: "نوع الحساب",
    roleStudent: "طالب",
    roleWorker: "عامل",
    finish: "إنهاء التسجيل",
    nameRequired: "الاسم مطلوب",
    roleRequired: "اختر نوع الحساب",
  },
  student: {
    welcome: "مرحباً",
    placeholder: "صفحة الطالب — قريباً ستتمكن من طلب غسيل سيارتك من هنا.",
  },
  worker: {
    welcome: "مرحباً",
    placeholder: "صفحة العامل — قريباً ستظهر هنا الطلبات المتاحة.",
  },
  language: {
    toggle: "English",
  },
};

export type Translations = typeof ar;
