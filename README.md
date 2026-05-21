# CampusWash — كامبس واش

تطبيق غسيل سيارات متنقل لطلاب الجامعة. الطالب يطلب الغسيل وهو في المحاضرة، والعامل ينفذ الطلب ويوصله لموقف السيارة.

> **غسيل سيارتك وانت في المحاضرة**

مبني باستخدام **Next.js 14 (App Router) + TypeScript + Tailwind CSS (RTL) + shadcn/ui + Prisma + PostgreSQL + NextAuth.js**.
واجهة عربية بالكامل (RTL) بخط Tajawal وألوان أزرق سماوي (#0EA5E9).

## مراحل البناء

- [x] **المرحلة 1** — إعداد المشروع + قاعدة البيانات + تسجيل الدخول (OTP) + التصميم العام
- [ ] المرحلة 2 — صفحات طلب الغسيل للطالب
- [ ] المرحلة 3 — لوحة العامل وإدارة الطلبات
- [ ] المرحلة 4 — الدفع والتقييمات والإشعارات

## المتطلبات

- Node.js 18.18+ (مُختبَر على Node 22)
- PostgreSQL 14+ — أو Docker لتشغيلها محلياً

## التشغيل خطوة بخطوة

```bash
# 1) ثبّت الحزم
npm install

# 2) جهّز متغيرات البيئة
cp .env.example .env
#    عدّل NEXTAUTH_SECRET (يمكن توليده عبر: openssl rand -base64 32)

# 3) شغّل قاعدة بيانات PostgreSQL محلياً (اختياري — عبر Docker)
docker compose up -d

# 4) أنشئ الجداول (migration)
npx prisma migrate dev

# 5) عبّئ البيانات التجريبية (مواقف + خدمات + حسابات)
npx prisma db seed

# 6) شغّل التطوير
npm run dev
```

افتح المتصفح على: http://localhost:3000

## تسجيل الدخول (OTP)

تسجيل الدخول يتم عبر رقم الجوال ورمز تحقق (OTP).
**في وضع التطوير لا يُرسَل الرمز عبر SMS** — بل يُطبَع في الـ console الخاص بالخادم:

```
📱 [CampusWash OTP] phone=96891234567 code=123456
```

انسخ الرمز من سجل الخادم وأدخله في صفحة الدخول.

### الحسابات التجريبية (بعد `db seed`)

| الدور | رقم الجوال | الاسم |
| --- | --- | --- |
| طالب | `96891234567` | أحمد |
| عامل | `96898765432` | سالم |
| مشرف | `96899999999` | المشرف |

> أي رقم جوال جديد (9–12 رقم) ينشئ حساباً جديداً ويُوجَّه لصفحة `/onboarding` لاختيار الاسم والدور.

## أوامر مفيدة

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | تشغيل خادم التطوير |
| `npm run build` | بناء الإنتاج |
| `npm run db:migrate` | إنشاء/تطبيق migrations |
| `npm run db:seed` | تعبئة البيانات التجريبية |
| `npm run db:studio` | فتح Prisma Studio |
| `docker compose up -d` | تشغيل PostgreSQL محلياً |

## بنية المشروع

```
app/
  api/
    auth/[...nextauth]/   # NextAuth handler
    otp/                  # طلب رمز التحقق
    onboarding/           # حفظ الاسم والدور
  login/                  # صفحة تسجيل الدخول (هاتف → OTP)
  onboarding/             # إكمال البيانات للمستخدم الجديد
  student/                # صفحة الطالب (مؤقتة)
  worker/                 # صفحة العامل (مؤقتة)
  page.tsx                # الصفحة الرئيسية (Landing)
components/
  ui/                     # مكونات shadcn/ui
  providers.tsx           # SessionProvider
lib/
  auth.ts                 # إعداد NextAuth + OTP
  otp.ts                  # توليد/تخزين/إرسال OTP
  prisma.ts               # Prisma client
  validations.ts          # مخططات zod
  translations/           # النصوص العربية (ar.ts) + placeholder إنجليزي
prisma/
  schema.prisma           # نماذج قاعدة البيانات
  seed.ts                 # بيانات تجريبية
types/
  next-auth.d.ts          # توسعة أنواع الجلسة
middleware.ts             # حماية المسارات حسب الدور
```

## ملاحظات تقنية

- **تخزين OTP:** في المرحلة 1 يُخزَّن الرمز في الذاكرة (in-memory Map) لمدة 5 دقائق. هذا مناسب للتطوير فقط ولا يصلح للإنتاج (لا يصمد عبر إعادة التشغيل أو عدة خوادم). يجب استبداله بـ Redis/جدول قاعدة بيانات ومزوّد SMS فعلي في مرحلة لاحقة.
- **الجلسة:** تستخدم استراتيجية JWT، ويُخزَّن فيها `userId` و`role` و`needsOnboarding`.
- **حماية المسارات:** `middleware.ts` يحمي `/student/*` و`/worker/*` و`/admin/*` حسب الدور.
