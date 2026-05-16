/**
 * Seed data for Coffee Shop POS.
 * Produces realistic demo data so the UI has something to render from day one.
 *
 *   15 products  •  20 inventory items  •  10 customers  •  30 past orders
 *    5 suppliers •   5 employees        •   3 months payroll + expenses
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────
const rnd = (min: number, max: number) =>
  Math.random() * (max - min) + min;
const rndInt = (min: number, max: number) => Math.floor(rnd(min, max + 1));
const pick = <T>(arr: T[]): T => arr[rndInt(0, arr.length - 1)];
const pad = (n: number, w = 2) => String(n).padStart(w, "0");

async function main() {
  console.log("🌱  Seeding database...");

  // Order matters: respect FKs. Children before parents on delete.
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.recipeItem.deleteMany(),
    prisma.recipe.deleteMany(),
    prisma.inventoryLog.deleteMany(),
    prisma.supplierInvoiceItem.deleteMany(),
    prisma.supplierPayment.deleteMany(),
    prisma.supplierInvoice.deleteMany(),
    prisma.payrollEntry.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.recurringExpense.deleteMany(),
    prisma.expenseCategory.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.product.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.user.deleteMany(),
    prisma.loyaltyConfig.deleteMany(),
    prisma.settings.deleteMany(),
  ]);

  // ─── Singletons ──────────────────────────────────────────────────────────
  await prisma.settings.create({
    data: {
      id: "singleton",
      shopName: "ركن البن",
      shopNameEn: "Coffee Corner",
      address: "مسقط، سلطنة عُمان",
      phone: "+96891234567",
      vatNumber: "OM1234567890",
      receiptFooter: "شكراً لزيارتكم — نراكم قريباً ☕",
      printerType: "browser",
      autoPrint: true,
      printCopies: 1,
      nextOrderNumber: 1042,
    },
  });

  await prisma.loyaltyConfig.create({
    data: {
      id: "singleton",
      pointsPerUnit: 10,
      redemptionThreshold: 100,
      freeDrinkValue: 1.5,
      active: true,
    },
  });

  // ─── Users ───────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin123", 10);
  const baristaHash = await bcrypt.hash("barista123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@coffee.om",
      name: "المدير",
      passwordHash: adminHash,
      role: "admin",
    },
  });
  const barista = await prisma.user.create({
    data: {
      email: "barista@coffee.om",
      name: "أحمد الباريستا",
      passwordHash: baristaHash,
      role: "barista",
    },
  });

  // ─── Suppliers ──────────────────────────────────────────────────────────
  const suppliers = await Promise.all(
    [
      { name: "محمصة الجزيرة", phone: "+96891111001", paymentTerms: "net_30", contactPerson: "سالم العبري" },
      { name: "مزرعة الألبان العُمانية", phone: "+96891111002", paymentTerms: "net_30", contactPerson: "خالد الحارثي" },
      { name: "موردي السكر والمستلزمات", phone: "+96891111003", paymentTerms: "cash" },
      { name: "مخبز السلطان", phone: "+96891111004", paymentTerms: "net_30", contactPerson: "فاطمة الزدجالي" },
      { name: "العصائر الطازجة المحدودة", phone: "+96891111005", paymentTerms: "net_60" },
    ].map((s) => prisma.supplier.create({ data: s }))
  );

  // ─── Inventory (20 items) ──────────────────────────────────────────────
  // unit cost is per base unit (g / ml / piece) in OMR.
  const invSeeds = [
    { name: "حبوب قهوة عربية", unit: "g", quantity: 5000, unitCost: 0.012, reorderThreshold: 1000, supplierIdx: 0 },
    { name: "حبوب قهوة إيطالية", unit: "g", quantity: 4000, unitCost: 0.015, reorderThreshold: 1000, supplierIdx: 0 },
    { name: "حليب طازج", unit: "ml", quantity: 15000, unitCost: 0.0008, reorderThreshold: 5000, supplierIdx: 1 },
    { name: "حليب الشوفان", unit: "ml", quantity: 3000, unitCost: 0.0025, reorderThreshold: 1000, supplierIdx: 1 },
    { name: "حليب اللوز", unit: "ml", quantity: 2000, unitCost: 0.003, reorderThreshold: 800, supplierIdx: 1 },
    { name: "سكر أبيض", unit: "g", quantity: 8000, unitCost: 0.0006, reorderThreshold: 2000, supplierIdx: 2 },
    { name: "شراب الفانيلا", unit: "ml", quantity: 1500, unitCost: 0.004, reorderThreshold: 500, supplierIdx: 2 },
    { name: "شراب الكراميل", unit: "ml", quantity: 1200, unitCost: 0.004, reorderThreshold: 500, supplierIdx: 2 },
    { name: "شراب الهازلنت", unit: "ml", quantity: 800, unitCost: 0.0045, reorderThreshold: 400, supplierIdx: 2 },
    { name: "مسحوق الكاكاو", unit: "g", quantity: 1500, unitCost: 0.008, reorderThreshold: 500, supplierIdx: 2 },
    { name: "شاي أسود", unit: "g", quantity: 1200, unitCost: 0.005, reorderThreshold: 300, supplierIdx: 2 },
    { name: "شاي أخضر", unit: "g", quantity: 800, unitCost: 0.007, reorderThreshold: 300, supplierIdx: 2 },
    { name: "أوراق نعناع", unit: "g", quantity: 400, unitCost: 0.01, reorderThreshold: 150, supplierIdx: 4 },
    { name: "ليمون", unit: "piece", quantity: 80, unitCost: 0.05, reorderThreshold: 30, supplierIdx: 4 },
    { name: "برتقال", unit: "piece", quantity: 60, unitCost: 0.08, reorderThreshold: 20, supplierIdx: 4 },
    { name: "فراولة", unit: "g", quantity: 1500, unitCost: 0.003, reorderThreshold: 500, supplierIdx: 4 },
    { name: "ثلج", unit: "g", quantity: 20000, unitCost: 0.0001, reorderThreshold: 5000, supplierIdx: 2 },
    { name: "كرواسون", unit: "piece", quantity: 40, unitCost: 0.4, reorderThreshold: 15, supplierIdx: 3 },
    { name: "مافن", unit: "piece", quantity: 30, unitCost: 0.45, reorderThreshold: 10, supplierIdx: 3 },
    { name: "كوكيز", unit: "piece", quantity: 50, unitCost: 0.25, reorderThreshold: 20, supplierIdx: 3 },
  ];

  const inventory = await Promise.all(
    invSeeds.map((i) =>
      prisma.inventoryItem.create({
        data: {
          name: i.name,
          unit: i.unit,
          quantity: i.quantity,
          unitCost: i.unitCost,
          reorderThreshold: i.reorderThreshold,
          supplierId: suppliers[i.supplierIdx].id,
        },
      })
    )
  );
  const inv = Object.fromEntries(inventory.map((x) => [x.name, x]));

  // ─── Products (15 drinks/items) + Recipes ──────────────────────────────
  type ProductSeed = {
    nameAr: string; nameEn: string; price: number; category: string;
    recipe: { name: string; qty: number }[];
  };
  const productSeeds: ProductSeed[] = [
    { nameAr: "قهوة عربية", nameEn: "Arabic Coffee", price: 0.8, category: "hot_coffee",
      recipe: [{ name: "حبوب قهوة عربية", qty: 12 }, { name: "سكر أبيض", qty: 5 }] },
    { nameAr: "إسبريسو", nameEn: "Espresso", price: 1.0, category: "hot_coffee",
      recipe: [{ name: "حبوب قهوة إيطالية", qty: 9 }] },
    { nameAr: "أمريكانو", nameEn: "Americano", price: 1.2, category: "hot_coffee",
      recipe: [{ name: "حبوب قهوة إيطالية", qty: 18 }] },
    { nameAr: "لاتيه", nameEn: "Latte", price: 1.5, category: "hot_coffee",
      recipe: [{ name: "حبوب قهوة إيطالية", qty: 18 }, { name: "حليب طازج", qty: 200 }] },
    { nameAr: "كابتشينو", nameEn: "Cappuccino", price: 1.5, category: "hot_coffee",
      recipe: [{ name: "حبوب قهوة إيطالية", qty: 18 }, { name: "حليب طازج", qty: 150 }] },
    { nameAr: "موكا", nameEn: "Mocha", price: 1.8, category: "hot_coffee",
      recipe: [{ name: "حبوب قهوة إيطالية", qty: 18 }, { name: "حليب طازج", qty: 180 }, { name: "مسحوق الكاكاو", qty: 10 }] },
    { nameAr: "فلات وايت", nameEn: "Flat White", price: 1.6, category: "hot_coffee",
      recipe: [{ name: "حبوب قهوة إيطالية", qty: 18 }, { name: "حليب طازج", qty: 160 }] },
    { nameAr: "آيس لاتيه", nameEn: "Iced Latte", price: 1.7, category: "iced_coffee",
      recipe: [{ name: "حبوب قهوة إيطالية", qty: 18 }, { name: "حليب طازج", qty: 180 }, { name: "ثلج", qty: 100 }] },
    { nameAr: "آيس أمريكانو", nameEn: "Iced Americano", price: 1.4, category: "iced_coffee",
      recipe: [{ name: "حبوب قهوة إيطالية", qty: 18 }, { name: "ثلج", qty: 120 }] },
    { nameAr: "آيس موكا", nameEn: "Iced Mocha", price: 2.0, category: "iced_coffee",
      recipe: [{ name: "حبوب قهوة إيطالية", qty: 18 }, { name: "حليب طازج", qty: 150 }, { name: "مسحوق الكاكاو", qty: 12 }, { name: "ثلج", qty: 100 }] },
    { nameAr: "شاي بالنعناع", nameEn: "Mint Tea", price: 0.8, category: "tea",
      recipe: [{ name: "شاي أسود", qty: 4 }, { name: "أوراق نعناع", qty: 3 }, { name: "سكر أبيض", qty: 8 }] },
    { nameAr: "شاي أخضر", nameEn: "Green Tea", price: 0.9, category: "tea",
      recipe: [{ name: "شاي أخضر", qty: 4 }] },
    { nameAr: "عصير ليمون نعناع", nameEn: "Lemon Mint", price: 1.2, category: "juice",
      recipe: [{ name: "ليمون", qty: 2 }, { name: "أوراق نعناع", qty: 5 }, { name: "سكر أبيض", qty: 15 }, { name: "ثلج", qty: 100 }] },
    { nameAr: "عصير برتقال طازج", nameEn: "Fresh Orange", price: 1.5, category: "juice",
      recipe: [{ name: "برتقال", qty: 3 }] },
    { nameAr: "كرواسون بالزبدة", nameEn: "Butter Croissant", price: 1.0, category: "pastry",
      recipe: [{ name: "كرواسون", qty: 1 }] },
  ];

  const products: { id: string; nameAr: string; price: number }[] = [];
  for (const p of productSeeds) {
    const product = await prisma.product.create({
      data: {
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        price: p.price,
        category: p.category,
        recipe: {
          create: {
            items: {
              create: p.recipe.map((r) => ({
                inventoryItemId: inv[r.name].id,
                quantity: r.qty,
              })),
            },
          },
        },
      },
    });
    products.push(product);
  }

  // ─── Customers (10) ────────────────────────────────────────────────────
  const customerSeeds = [
    { name: "محمد العبري", phone: "+96891000001" },
    { name: "فاطمة الزدجالي", phone: "+96891000002" },
    { name: "خالد الحارثي", phone: "+96891000003" },
    { name: "سارة البلوشي", phone: "+96891000004" },
    { name: "أحمد السعدي", phone: "+96891000005" },
    { name: "نور الكندي", phone: "+96891000006" },
    { name: "يوسف الرواحي", phone: "+96891000007" },
    { name: "ليلى الهنائي", phone: "+96891000008" },
    { name: "علي المعمري", phone: "+96891000009" },
    { name: "ميساء الشكيلي", phone: "+96891000010" },
  ];
  const customers = await Promise.all(
    customerSeeds.map((c, i) =>
      prisma.customer.create({
        data: {
          name: c.name,
          phone: c.phone,
          points: rndInt(0, 250),
          totalSpent: rnd(10, 200),
          visits: rndInt(1, 30),
          passSerialNumber: `CC-${pad(i + 1, 4)}`,
        },
      })
    )
  );

  // ─── Past orders (30 across the last 30 days) ──────────────────────────
  let orderCounter = 1001;
  const ordersData: { id: string; total: number; createdAt: Date }[] = [];

  for (let i = 0; i < 30; i++) {
    const daysAgo = rndInt(0, 29);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(rndInt(7, 21), rndInt(0, 59), 0, 0);

    const itemCount = rndInt(1, 4);
    const lineItems = Array.from({ length: itemCount }).map(() => {
      const p = pick(products);
      const qty = rndInt(1, 3);
      return {
        productId: p.id,
        quantity: qty,
        unitPrice: p.price,
        lineTotal: +(p.price * qty).toFixed(3),
      };
    });
    const subtotal = +lineItems.reduce((s, x) => s + x.lineTotal, 0).toFixed(3);

    const customer = Math.random() > 0.3 ? pick(customers) : null;
    const paymentMethod = pick(["cash", "thawani", "tap"]);
    const completedAt = new Date(createdAt.getTime() + rndInt(3, 12) * 60_000);

    const order = await prisma.order.create({
      data: {
        orderNumber: orderCounter++,
        customerId: customer?.id,
        cashierId: barista.id,
        status: "completed",
        paymentMethod,
        paymentStatus: "paid",
        paidAt: createdAt,
        subtotal,
        total: subtotal,
        pointsEarned: Math.floor(subtotal * 10),
        createdAt,
        completedAt,
        items: { create: lineItems },
      },
    });
    ordersData.push({ id: order.id, total: subtotal, createdAt });
  }

  // bump the next order number forward past seeded data
  await prisma.settings.update({
    where: { id: "singleton" },
    data: { nextOrderNumber: orderCounter },
  });

  // ─── Employees (5) ─────────────────────────────────────────────────────
  const employeeSeeds = [
    { name: "أحمد الباريستا", role: "barista", salary: 350 },
    { name: "سعيد الكاشير", role: "cashier", salary: 320 },
    { name: "منى المديرة", role: "manager", salary: 600 },
    { name: "حسن باريستا", role: "barista", salary: 350 },
    { name: "نوال الكاشير", role: "cashier", salary: 320 },
  ];
  const employees = await Promise.all(
    employeeSeeds.map((e, i) =>
      prisma.employee.create({
        data: {
          name: e.name,
          role: e.role,
          salary: e.salary,
          phone: `+9689200000${i + 1}`,
          startDate: new Date(Date.UTC(2025, 0, 1)),
          bankAccount: `OM${pad(i + 1, 22)}`,
        },
      })
    )
  );

  // ─── Expense categories ───────────────────────────────────────────────
  const categorySeeds = [
    { name: "إيجار", type: "rent", icon: "🏠", color: "#7A5C38", systemKey: null },
    { name: "كهرباء وماء وإنترنت", type: "utilities", icon: "💡", color: "#B8956A", systemKey: null },
    { name: "رواتب", type: "salaries", icon: "👥", color: "#5C4528", systemKey: "salaries" },
    { name: "شراء مكوّنات", type: "ingredients", icon: "📦", color: "#9C7A4E", systemKey: "ingredients" },
    { name: "تسويق وإعلانات", type: "marketing", icon: "📢", color: "#D2B48C", systemKey: null },
    { name: "صيانة وإصلاحات", type: "maintenance", icon: "🔧", color: "#3E2E1B", systemKey: null },
    { name: "نقل وتوصيل", type: "transport", icon: "🚚", color: "#E5D2B8", systemKey: null },
    { name: "رسوم حكومية", type: "government", icon: "📝", color: "#231810", systemKey: null },
    { name: "رسوم بنكية", type: "banking", icon: "💳", color: "#7A5C38", systemKey: null },
    { name: "أخرى", type: "other", icon: "🛒", color: "#B8956A", systemKey: null },
  ];
  const categories = await Promise.all(
    categorySeeds.map((c) =>
      prisma.expenseCategory.create({
        data: {
          name: c.name,
          type: c.type,
          icon: c.icon,
          color: c.color,
          systemKey: c.systemKey,
        },
      })
    )
  );
  const catByType = Object.fromEntries(categories.map((c) => [c.type, c]));

  // ─── Payroll for the last 3 months ────────────────────────────────────
  const today = new Date();
  for (let monthsBack = 0; monthsBack < 3; monthsBack++) {
    const d = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const isPaid = monthsBack > 0;

    for (const emp of employees) {
      const bonus = monthsBack === 0 ? 0 : rndInt(0, 40);
      const deductions = rndInt(0, 20);
      const netPay = +(emp.salary + bonus - deductions).toFixed(3);
      const payroll = await prisma.payrollEntry.create({
        data: {
          employeeId: emp.id,
          month,
          year,
          baseSalary: emp.salary,
          bonus,
          deductions,
          overtime: 0,
          netPay,
          status: isPaid ? "paid" : "pending",
          paidDate: isPaid ? new Date(year, month, 1) : null,
        },
      });
      if (isPaid) {
        await prisma.expense.create({
          data: {
            categoryId: catByType["salaries"].id,
            amount: netPay,
            expenseDate: new Date(year, month, 1),
            description: `راتب ${emp.name} ${pad(month)}/${year}`,
            paymentMethod: "bank",
            source: "payroll",
            sourceId: payroll.id,
          },
        });
      }
    }
  }

  // ─── Recurring expenses (rent + utilities) ────────────────────────────
  const rentTemplate = await prisma.recurringExpense.create({
    data: {
      categoryId: catByType["rent"].id,
      amount: 800,
      description: "إيجار شهري للمحل",
      frequency: "monthly",
      startDate: new Date(today.getFullYear(), today.getMonth() - 3, 1),
      nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
    },
  });
  const utilTemplate = await prisma.recurringExpense.create({
    data: {
      categoryId: catByType["utilities"].id,
      amount: 120,
      description: "فاتورة الكهرباء والماء",
      frequency: "monthly",
      startDate: new Date(today.getFullYear(), today.getMonth() - 3, 5),
      nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 5),
    },
  });

  // Generate past 3 months of those recurring expenses + a few one-offs
  for (let m = 1; m <= 3; m++) {
    const date = new Date(today.getFullYear(), today.getMonth() - m, 1);
    await prisma.expense.create({
      data: {
        categoryId: catByType["rent"].id,
        amount: 800,
        expenseDate: date,
        description: "إيجار شهري للمحل",
        paymentMethod: "bank",
        source: "recurring",
        recurringTemplateId: rentTemplate.id,
      },
    });
    await prisma.expense.create({
      data: {
        categoryId: catByType["utilities"].id,
        amount: +rnd(95, 145).toFixed(3),
        expenseDate: new Date(today.getFullYear(), today.getMonth() - m, 5),
        description: "فاتورة الكهرباء والماء",
        paymentMethod: "bank",
        source: "recurring",
        recurringTemplateId: utilTemplate.id,
      },
    });
    // marketing
    if (m % 2 === 0) {
      await prisma.expense.create({
        data: {
          categoryId: catByType["marketing"].id,
          amount: +rnd(40, 150).toFixed(3),
          expenseDate: new Date(today.getFullYear(), today.getMonth() - m, 12),
          description: "إعلانات إنستغرام",
          paymentMethod: "card",
        },
      });
    }
    // maintenance once
    if (m === 1) {
      await prisma.expense.create({
        data: {
          categoryId: catByType["maintenance"].id,
          amount: 65,
          expenseDate: new Date(today.getFullYear(), today.getMonth() - 1, 18),
          description: "صيانة ماكينة الإسبريسو",
          paymentMethod: "cash",
        },
      });
    }
  }

  // ─── A couple of supplier invoices ────────────────────────────────────
  for (let i = 0; i < 3; i++) {
    const supplier = suppliers[i];
    const issueDate = new Date(today.getFullYear(), today.getMonth() - i, 10);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const itemSeeds = (() => {
      if (i === 0) return [
        { name: "حبوب قهوة إيطالية", qty: 3000, unitPrice: 0.014 },
        { name: "حبوب قهوة عربية", qty: 2000, unitPrice: 0.011 },
      ];
      if (i === 1) return [
        { name: "حليب طازج", qty: 20000, unitPrice: 0.00075 },
      ];
      return [
        { name: "سكر أبيض", qty: 10000, unitPrice: 0.00055 },
        { name: "شراب الفانيلا", qty: 2000, unitPrice: 0.0038 },
      ];
    })();

    const lines = itemSeeds.map((line) => {
      const item = inv[line.name];
      return {
        inventoryItemId: item.id,
        quantity: line.qty,
        unitPrice: line.unitPrice,
        lineTotal: +(line.qty * line.unitPrice).toFixed(3),
      };
    });
    const total = +lines.reduce((s, x) => s + x.lineTotal, 0).toFixed(3);

    const invoice = await prisma.supplierInvoice.create({
      data: {
        supplierId: supplier.id,
        invoiceNumber: `INV-${2026}-${pad(i + 1, 4)}`,
        issueDate,
        dueDate,
        totalAmount: total,
        paidAmount: i === 0 ? total : i === 1 ? +(total / 2).toFixed(3) : 0,
        status: i === 0 ? "paid" : i === 1 ? "partial" : "unpaid",
        confirmed: true,
        items: { create: lines },
      },
    });

    if (i === 0) {
      await prisma.supplierPayment.create({
        data: {
          invoiceId: invoice.id,
          amount: total,
          paymentDate: new Date(issueDate.getTime() + 5 * 86_400_000),
          method: "bank",
          reference: `TRX-${pad(i + 1, 6)}`,
        },
      });
    } else if (i === 1) {
      await prisma.supplierPayment.create({
        data: {
          invoiceId: invoice.id,
          amount: +(total / 2).toFixed(3),
          paymentDate: new Date(issueDate.getTime() + 10 * 86_400_000),
          method: "bank",
        },
      });
    }
  }

  console.log("✅ Seed complete.");
  console.log(`   ${products.length} products • ${inventory.length} inventory items`);
  console.log(`   ${customers.length} customers • ${ordersData.length} past orders`);
  console.log(`   ${suppliers.length} suppliers • ${employees.length} employees`);
  console.log("");
  console.log("👤 Login:");
  console.log("   admin@coffee.om   / admin123");
  console.log("   barista@coffee.om / barista123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
