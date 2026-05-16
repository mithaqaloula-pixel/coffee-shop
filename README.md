# Coffee Shop POS & Management System

نظام إدارة مقهى متكامل — نقاط البيع، المخزون، الولاء، الطباعة الحرارية، والمحاسبة.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Prisma + SQLite**.
Fully RTL Arabic UI with a warm coffee-shop aesthetic (brown/cream palette).

## Build progress

The system is being built in 12 sequential steps. Each step is reviewed before moving on.

- [x] **1. Project setup** — Next.js, Tailwind, shadcn/ui primitives, Prisma init, RTL + Tajawal font, coffee palette
- [ ] 2. Full Prisma schema + migrate + seed
- [ ] 3. Inventory CRUD
- [ ] 4. Menu & Recipes (auto cost calculation)
- [ ] 5. Cashier / New Order screen
- [ ] 6. Payment modal (Thawani + Tap)
- [ ] 7. Thermal receipt printing
- [ ] 8. Preparation queue + kitchen tickets
- [ ] 9. Loyalty system + `.pkpass` cards
- [ ] 10. Accounting module (suppliers, invoices, payroll, expenses, P&L)
- [ ] 11. Settings (printer, payments, shop profile)
- [ ] 12. Dashboard + operational reports

## Getting started

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed       # available from step 2
npm run dev
```

Open http://localhost:3000

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Prisma + SQLite (PostgreSQL-ready) |
| Auth | NextAuth.js |
| Charts | Recharts |
| Icons | lucide-react |
| Font | Tajawal (Google Fonts) |
| Payments | Thawani + Tap |
| Printing | node-thermal-printer (ESC/POS) |
| Loyalty cards | passkit-generator (.pkpass) |
