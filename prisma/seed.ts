import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Small helpers ────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysAhead(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

/** Returns the next weekday date string N business days from today. */
function nextBusinessDay(offset: number): string {
  const d = new Date();
  let added = 0;
  while (added < offset) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d.toISOString().slice(0, 10);
}

function rand(arr: unknown[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── 1. Tenant ────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where:  { slug: "demo" },
    update: { name: "Cuarzo Demo", onboarded: true },
    create: { name: "Cuarzo Demo", slug: "demo", plan: "starter", onboarded: true },
  });
  console.log(`✓ tenant: ${tenant.slug} (${tenant.id})`);

  // ── 2. Modules ────────────────────────────────────────────────────────────────
  for (const module of ["turnera", "catalog", "stock", "orders", "payments", "fiscal", "caja"] as const) {
    await prisma.tenantModule.upsert({
      where:  { tenantId_module: { tenantId: tenant.id, module } },
      update: { active: true },
      create: { tenantId: tenant.id, module },
    });
  }
  console.log("✓ modules enabled");

  // ── 3. Users ──────────────────────────────────────────────────────────────────
  const ownerPw  = await bcrypt.hash("admin123",  12);
  const adminPw  = await bcrypt.hash("admin456",  12);
  const staffPw  = await bcrypt.hash("staff123",  12);

  const owner = await prisma.user.upsert({
    where:  { tenantId_email: { tenantId: tenant.id, email: "admin@cuarzo.dev" } },
    update: { superAdmin: true },
    create: {
      tenantId: tenant.id, email: "admin@cuarzo.dev",
      name: "Pablo Cavillon", role: "owner", password: ownerPw,
      superAdmin: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where:  { tenantId_email: { tenantId: tenant.id, email: "manager@cuarzo.dev" } },
    update: {},
    create: {
      tenantId: tenant.id, email: "manager@cuarzo.dev",
      name: "Valentina Gómez", role: "admin", password: adminPw,
    },
  });

  await prisma.user.upsert({
    where:  { tenantId_email: { tenantId: tenant.id, email: "staff@cuarzo.dev" } },
    update: {},
    create: {
      tenantId: tenant.id, email: "staff@cuarzo.dev",
      name: "Lucas Fernández", role: "staff", password: staffPw,
    },
  });

  console.log("✓ users: owner (superAdmin) / admin / staff");

  // ── 4. Subscription plans ─────────────────────────────────────────────────────
  const plans = [
    { slug: "free",       name: "Free",       priceUSD: 0,   features: ["1 usuario", "Turnera", "50 turnos/mes"] },
    { slug: "starter",    name: "Starter",    priceUSD: 19,  features: ["3 usuarios", "Todos los módulos", "500 turnos/mes", "Soporte email"] },
    { slug: "pro",        name: "Pro",        priceUSD: 49,  features: ["10 usuarios", "Módulos ilimitados", "Turnos ilimitados", "ARCA", "Soporte prioritario"] },
    { slug: "enterprise", name: "Enterprise", priceUSD: 149, features: ["Usuarios ilimitados", "Todo en Pro", "SLA 99.9%", "Onboarding", "API full"] },
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where:  { slug: p.slug },
      update: { name: p.name, priceUSD: p.priceUSD, features: p.features },
      create: { ...p },
    });
  }
  console.log("✓ subscription plans");

  // ── 5. Turnera services ───────────────────────────────────────────────────────
  const serviceData = [
    { name: "Consulta Inicial",    description: "Análisis de necesidades y roadmap digital.", durationMin: 30,  price: 0,     sortOrder: 1 },
    { name: "Demo del Sistema",    description: "Demo personalizada de los módulos Cuarzo.",  durationMin: 60,  price: 0,     sortOrder: 2 },
    { name: "Configuración",       description: "Setup completo del módulo seleccionado.",    durationMin: 90,  price: 15000, sortOrder: 3 },
    { name: "Soporte Técnico",     description: "Sesión de soporte y resolución.",             durationMin: 45,  price: 8000,  sortOrder: 4 },
    { name: "Capacitación Equipo", description: "Formación para todo el equipo.",              durationMin: 120, price: 25000, sortOrder: 5 },
    { name: "Auditoría Digital",   description: "Revisión completa de procesos actuales.",     durationMin: 60,  price: 12000, sortOrder: 6 },
  ];

  const services: Awaited<ReturnType<typeof prisma.turneraService.create>>[] = [];
  for (const s of serviceData) {
    const existing = await prisma.turneraService.findFirst({ where: { tenantId: tenant.id, name: s.name } });
    if (existing) {
      services.push(existing);
    } else {
      const svc = await prisma.turneraService.create({ data: { tenantId: tenant.id, ...s } });
      services.push(svc);
    }
  }
  console.log(`✓ turnera services (${services.length})`);

  // ── 6. Turnera bookings ───────────────────────────────────────────────────────
  const bookingData = [
    // Past confirmed bookings
    { svc: 0, date: "2026-04-10", time: "09:00", name: "María Rodríguez",   email: "maria@email.com",   status: "confirmed" as const },
    { svc: 1, date: "2026-04-15", time: "10:30", name: "Carlos Pérez",      email: "carlos@email.com",  status: "confirmed" as const },
    { svc: 2, date: "2026-04-20", time: "14:00", name: "Ana Martínez",      email: "ana@email.com",     status: "confirmed" as const },
    { svc: 3, date: "2026-04-22", time: "11:00", name: "Diego Sánchez",     email: "diego@email.com",   status: "confirmed" as const },
    { svc: 0, date: "2026-04-28", time: "09:30", name: "Sofía López",       email: "sofia@email.com",   status: "confirmed" as const },
    { svc: 4, date: "2026-05-02", time: "15:00", name: "Matías García",     email: "matias@email.com",  status: "confirmed" as const },
    // Cancelled
    { svc: 1, date: "2026-05-03", time: "10:00", name: "Camila Torres",     email: "camila@email.com",  status: "cancelled" as const },
    { svc: 2, date: "2026-05-05", time: "14:30", name: "Nicolás Ramírez",   email: "nicolas@email.com", status: "cancelled" as const },
    // No shows
    { svc: 3, date: "2026-05-06", time: "11:30", name: "Lucía Fernández",   email: "lucia@email.com",   status: "no_show" as const },
    { svc: 0, date: "2026-05-07", time: "09:00", name: "Joaquín Molina",    email: "joaquin@email.com", status: "no_show" as const },
    // Upcoming
    { svc: 1, date: nextBusinessDay(2), time: "10:00", name: "Isabella Castro",   email: "isabella@email.com",  status: "confirmed" as const },
    { svc: 2, date: nextBusinessDay(3), time: "14:00", name: "Tomás Herrera",     email: "tomas@email.com",     status: "confirmed" as const },
    { svc: 3, date: nextBusinessDay(5), time: "11:00", name: "Valentina Ruiz",    email: "valentina@email.com", status: "confirmed" as const },
    { svc: 4, date: nextBusinessDay(7), time: "15:00", name: "Santiago Vargas",   email: "santiago@email.com",  status: "confirmed" as const },
    { svc: 5, date: nextBusinessDay(10), time: "09:30", name: "Emilia Jiménez",   email: "emilia@email.com",    status: "confirmed" as const },
  ];

  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  function makeCode(i: number) {
    const base = (i + 1).toString().padStart(6, "0").split("").map(d => CHARS[parseInt(d) % 32]).join("");
    return `TUR-${base}`;
  }

  for (let i = 0; i < bookingData.length; i++) {
    const b = bookingData[i];
    const svc = services[b.svc];
    const code = makeCode(i);
    const existingBooking = await prisma.turneraBooking.findUnique({ where: { code } });
    if (!existingBooking) {
      await prisma.turneraBooking.create({
        data: {
          tenantId:        tenant.id,
          serviceId:       svc.id,
          code,
          serviceNameSnap: svc.name,
          durationMinSnap: svc.durationMin,
          priceSnap:       svc.price,
          date:            b.date,
          time:            b.time,
          clientName:      b.name,
          clientEmail:     b.email,
          status:          b.status,
        },
      });
    }
  }
  console.log(`✓ turnera bookings (${bookingData.length})`);

  // ── 7. Catalog categories ─────────────────────────────────────────────────────
  const catNames = ["Indumentaria", "Calzado", "Accesorios", "Tecnología", "Hogar", "Deportes"];
  const categories: Awaited<ReturnType<typeof prisma.catalogCategory.create>>[] = [];
  for (const name of catNames) {
    const existing = await prisma.catalogCategory.findFirst({ where: { tenantId: tenant.id, name } });
    if (existing) {
      categories.push(existing);
    } else {
      const cat = await prisma.catalogCategory.create({ data: { tenantId: tenant.id, name } });
      categories.push(cat);
    }
  }
  console.log(`✓ catalog categories (${categories.length})`);

  // ── 8. Catalog products ───────────────────────────────────────────────────────
  const productData = [
    // Indumentaria
    { sku: "REM-BLA-M",  name: "Remera Blanca M",        category: 0, price: 4500  },
    { sku: "REM-NEG-M",  name: "Remera Negra M",         category: 0, price: 4500  },
    { sku: "REM-AZU-L",  name: "Remera Azul L",          category: 0, price: 4800  },
    { sku: "PAN-CLA-32", name: "Pantalón Clásico 32",    category: 0, price: 12000 },
    { sku: "PAN-JEA-34", name: "Jeans 34",               category: 0, price: 15000 },
    { sku: "BUZ-NAV-XL", name: "Buzo Naval XL",          category: 0, price: 18000 },
    { sku: "CAM-BLA-M",  name: "Camisa Blanca M",        category: 0, price: 9500  },
    { sku: "CAM-AZU-L",  name: "Camisa Azul L",          category: 0, price: 9800  },
    // Calzado
    { sku: "ZAP-NEG-42", name: "Zapatillas Negras 42",   category: 1, price: 28000 },
    { sku: "ZAP-BLA-41", name: "Zapatillas Blancas 41",  category: 1, price: 27000 },
    { sku: "BOT-MAR-43", name: "Botines Marrones 43",    category: 1, price: 35000 },
    { sku: "SAN-001-39", name: "Sandalias Verano 39",    category: 1, price: 12000 },
    // Accesorios
    { sku: "CIN-CUE-001", name: "Cinturón de Cuero",     category: 2, price: 5500  },
    { sku: "GOR-NEG-001", name: "Gorra Negra",           category: 2, price: 3200  },
    { sku: "BOL-LNA-002", name: "Bolso de Lona",         category: 2, price: 14000 },
    // Tecnología
    { sku: "CAR-USB-001", name: "Cargador USB-C",        category: 3, price: 6500  },
    { sku: "AUR-BTH-001", name: "Auriculares Bluetooth", category: 3, price: 22000 },
    { sku: "FUN-CEL-001", name: "Funda Celular Universal", category: 3, price: 2800 },
    // Hogar
    { sku: "TAZ-BLA-001", name: "Taza Blanca 350ml",     category: 4, price: 2200  },
    { sku: "TAZ-NEG-001", name: "Taza Negra 350ml",      category: 4, price: 2200  },
    // Deportes
    { sku: "MED-DEP-L",  name: "Medias Deportivas L",    category: 5, price: 1800  },
    { sku: "GUA-BOX-M",  name: "Guantes Box M",          category: 5, price: 8500  },
    { sku: "COL-HID-001", name: "Colchoneta Yoga",       category: 5, price: 11000 },
  ];

  const products: Awaited<ReturnType<typeof prisma.catalogProduct.create>>[] = [];
  for (const p of productData) {
    const existing = await prisma.catalogProduct.findFirst({ where: { tenantId: tenant.id, sku: p.sku } });
    if (existing) {
      products.push(existing);
    } else {
      const prod = await prisma.catalogProduct.create({
        data: {
          tenantId:   tenant.id,
          categoryId: categories[p.category].id,
          sku:        p.sku,
          name:       p.name,
          basePrice:  p.price,
        },
      });
      products.push(prod);
    }
  }
  console.log(`✓ catalog products (${products.length})`);

  // ── 9. Warehouse + stock ──────────────────────────────────────────────────────
  let warehouse = await prisma.stockWarehouse.findFirst({ where: { tenantId: tenant.id, name: "Depósito Central" } });
  if (!warehouse) {
    warehouse = await prisma.stockWarehouse.create({
      data: { tenantId: tenant.id, name: "Depósito Central", address: "Av. Corrientes 1234, Buenos Aires" },
    });
  }

  let warehouse2 = await prisma.stockWarehouse.findFirst({ where: { tenantId: tenant.id, name: "Sucursal Palermo" } });
  if (!warehouse2) {
    warehouse2 = await prisma.stockWarehouse.create({
      data: { tenantId: tenant.id, name: "Sucursal Palermo", address: "Thames 1890, Palermo, Buenos Aires" },
    });
  }

  // Stock levels for warehouse 1
  // qty, minStock — items where qty <= minStock will trigger the low-stock alert
  const stockData = [
    { qty: 50, minStock: 10 }, // REM-BLA-M
    { qty: 45, minStock: 10 }, // REM-NEG-M
    { qty: 30, minStock: 10 }, // REM-AZU-L
    { qty: 20, minStock: 10 }, // PAN-CLA-32
    { qty: 35, minStock: 10 }, // PAN-JEA-34
    { qty:  8, minStock: 15 }, // BUZ-NAV-XL ← below minStock (low stock!)
    { qty: 28, minStock: 10 }, // CAM-BLA-M
    { qty: 22, minStock: 10 }, // CAM-AZU-L
    { qty: 40, minStock: 10 }, // ZAP-NEG-42
    { qty: 38, minStock: 10 }, // ZAP-BLA-41
    { qty:  5, minStock: 20 }, // BOT-MAR-43 ← below minStock (low stock!)
    { qty: 60, minStock: 15 }, // SAN-001-39
    { qty: 18, minStock:  5 }, // CIN-CUE-001
    { qty: 55, minStock: 20 }, // GOR-NEG-001
    { qty:  3, minStock: 10 }, // BOL-LNA-002 ← below minStock (low stock!)
    { qty: 75, minStock: 20 }, // CAR-USB-001
    { qty: 20, minStock: 10 }, // AUR-BTH-001
    { qty: 90, minStock: 25 }, // FUN-CEL-001
    { qty: 100, minStock: 30 }, // TAZ-BLA-001
    { qty: 100, minStock: 30 }, // TAZ-NEG-001
    { qty: 200, minStock: 50 }, // MED-DEP-L
    { qty:  8, minStock: 15 }, // GUA-BOX-M ← below minStock (low stock!)
    { qty: 25, minStock: 10 }, // COL-HID-001
  ];

  for (let i = 0; i < products.length; i++) {
    const { qty, minStock } = stockData[i] ?? { qty: 20, minStock: 5 };
    const existing = await prisma.stockItem.findFirst({
      where: { tenantId: tenant.id, productId: products[i].id, warehouseId: warehouse.id },
    });
    if (!existing) {
      await prisma.stockItem.create({
        data: { tenantId: tenant.id, productId: products[i].id, warehouseId: warehouse.id, qty, minStock },
      });
      await prisma.stockMovement.create({
        data: { tenantId: tenant.id, productId: products[i].id, warehouseId: warehouse.id, delta: qty, reason: "initial" },
      });
    } else {
      await prisma.stockItem.update({ where: { id: existing.id }, data: { minStock } });
    }
  }
  console.log(`✓ stock (${products.length} items in Depósito Central, 4 below minStock)`);

  // Stock for warehouse 2 (subset)
  for (let i = 0; i < 8; i++) {
    const qty = 10 + i * 3;
    const existing = await prisma.stockItem.findFirst({
      where: { tenantId: tenant.id, productId: products[i].id, warehouseId: warehouse2.id },
    });
    if (!existing) {
      await prisma.stockItem.create({
        data: { tenantId: tenant.id, productId: products[i].id, warehouseId: warehouse2.id, qty },
      });
      await prisma.stockMovement.create({
        data: { tenantId: tenant.id, productId: products[i].id, warehouseId: warehouse2.id, delta: qty, reason: "initial" },
      });
    }
  }
  console.log("✓ stock in Sucursal Palermo");

  // ── 10. CRM clients ───────────────────────────────────────────────────────────
  const clientData = [
    { name: "Distribuidora El Sauce",       email: "elsauce@distribucion.com",  phone: "11-4523-7890" },
    { name: "Boutique Primavera",           email: "info@boutiqueprimavera.com", phone: "11-3344-5566" },
    { name: "Sport Center Norte",           email: "ventas@sportcenter.com",    phone: "11-6677-8899" },
    { name: "Moda Express SA",              email: "compras@modaexpress.com",   phone: "11-2233-4455" },
    { name: "TechStore Córdoba",            email: "tech@techstorecba.com",     phone: "351-421-9876" },
    { name: "La Esquina del Deporte",       email: "esquina@deportes.com",      phone: "11-5566-7788" },
    { name: "Accesorios Premium",           email: "premium@accesorios.ar",     phone: "11-9900-1122" },
    { name: "Hogar & Deco",                 email: "info@hogardeco.com.ar",     phone: "11-3311-2200" },
    { name: "Calzados del Sur",             email: "ventas@calzadossur.com",    phone: "11-4400-5511" },
    { name: "Mini Market El Refugio",       email: "refugio@minimarket.ar",     phone: "11-6644-7753" },
    { name: "Juan Pérez",                   email: "juanperez@gmail.com",       phone: "11-5544-3322" },
    { name: "Ana González",                 email: "ana.gonzalez@hotmail.com",  phone: "11-7788-9900" },
  ];

  const clients: Awaited<ReturnType<typeof prisma.client.create>>[] = [];
  for (const c of clientData) {
    const existing = await prisma.client.findFirst({ where: { tenantId: tenant.id, email: c.email } });
    if (existing) {
      clients.push(existing);
    } else {
      const client = await prisma.client.create({ data: { tenantId: tenant.id, ...c } });
      clients.push(client);
    }
  }
  console.log(`✓ CRM clients (${clients.length})`);

  // ── 11. Suppliers ─────────────────────────────────────────────────────────────
  const supplierData = [
    { name: "Textil Andino SRL",        contactName: "Roberto Andrade", email: "compras@textilandino.com",  phone: "11-4400-1234" },
    { name: "Calzado Patagónico SA",    contactName: "Graciela Torres", email: "ventas@calzadopatag.com",  phone: "294-422-3333" },
    { name: "Tech Imports ARG",         contactName: "Daniel Kwan",     email: "imports@techarg.com",       phone: "11-5566-0099" },
    { name: "Distribuidora La Pampa",   contactName: "Alejandro Ruiz",  email: "lapampa@distrib.com.ar",   phone: "11-3322-9988" },
  ];

  for (const s of supplierData) {
    const existing = await prisma.supplier.findFirst({ where: { tenantId: tenant.id, name: s.name } });
    if (!existing) {
      await prisma.supplier.create({ data: { tenantId: tenant.id, ...s } });
    }
  }
  console.log(`✓ suppliers (${supplierData.length})`);

  // ── 12. Orders ────────────────────────────────────────────────────────────────
  const orderClientData = [
    { email: clientData[0].email,  name: clientData[0].name,  phone: clientData[0].phone },
    { email: clientData[1].email,  name: clientData[1].name,  phone: clientData[1].phone },
    { email: clientData[2].email,  name: clientData[2].name,  phone: clientData[2].phone },
    { email: clientData[10].email!, name: clientData[10].name, phone: clientData[10].phone },
    { email: clientData[11].email!, name: clientData[11].name, phone: clientData[11].phone },
  ];

  const orderClients: Awaited<ReturnType<typeof prisma.orderClient.upsert>>[] = [];
  for (const oc of orderClientData) {
    const c = await prisma.orderClient.upsert({
      where:  { tenantId_email: { tenantId: tenant.id, email: oc.email! } },
      update: { name: oc.name },
      create: { tenantId: tenant.id, email: oc.email!, name: oc.name, phone: oc.phone },
    });
    orderClients.push(c);
  }

  // Create orders across all statuses
  const ordersSpec = [
    // Delivered with payment
    {
      client: 0, status: "delivered" as const,
      items: [{ p: 0, q: 3 }, { p: 6, q: 2 }],
      paymentMethod: "transferencia" as const,
    },
    {
      client: 1, status: "delivered" as const,
      items: [{ p: 8, q: 1 }, { p: 12, q: 2 }],
      paymentMethod: "efectivo" as const,
    },
    // Shipped
    {
      client: 2, status: "shipped" as const,
      items: [{ p: 3, q: 2 }, { p: 4, q: 1 }, { p: 1, q: 5 }],
      paymentMethod: "mercadopago" as const,
    },
    // Processing
    {
      client: 0, status: "processing" as const,
      items: [{ p: 9, q: 2 }, { p: 10, q: 1 }],
      paymentMethod: "transferencia" as const,
    },
    // Confirmed
    {
      client: 3, status: "confirmed" as const,
      items: [{ p: 16, q: 1 }, { p: 17, q: 2 }],
      paymentMethod: "efectivo" as const,
    },
    {
      client: 4, status: "confirmed" as const,
      items: [{ p: 19, q: 4 }, { p: 18, q: 6 }],
      paymentMethod: "efectivo" as const,
    },
    // Draft
    {
      client: 1, status: "draft" as const,
      items: [{ p: 5, q: 1 }, { p: 2, q: 3 }],
      paymentMethod: "efectivo" as const,
    },
    // Cancelled
    {
      client: 2, status: "cancelled" as const,
      items: [{ p: 11, q: 2 }],
      paymentMethod: "efectivo" as const,
    },
    // More confirmed orders to have realistic data
    {
      client: 0, status: "confirmed" as const,
      items: [{ p: 13, q: 3 }, { p: 14, q: 1 }],
      paymentMethod: "transferencia" as const,
    },
    {
      client: 3, status: "processing" as const,
      items: [{ p: 20, q: 10 }, { p: 21, q: 2 }],
      paymentMethod: "mercadopago" as const,
    },
  ];

  for (const spec of ordersSpec) {
    // Check if an order with this client already exists to keep idempotency
    const orderClient = orderClients[spec.client];
    const existingOrder = await prisma.order.findFirst({
      where: { tenantId: tenant.id, clientId: orderClient.id, status: spec.status },
    });
    if (existingOrder) continue;

    const itemsWithPrice = spec.items.map((it) => ({
      productId: products[it.p].id,
      variantId: null as string | null,
      skuSnap:   products[it.p].sku,
      nameSnap:  products[it.p].name,
      qty:       it.q,
      unitPrice: Number(products[it.p].basePrice),
    }));

    const subtotal = itemsWithPrice.reduce((s, it) => s + it.qty * it.unitPrice, 0);

    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        clientId: orderClient.id,
        status:   spec.status,
        subtotal,
        discount: 0,
        tax:      0,
        total:    subtotal,
        items: {
          create: itemsWithPrice,
        },
      },
    });

    // Add payment for non-draft/non-cancelled orders
    if (!["draft", "cancelled"].includes(spec.status)) {
      await prisma.payment.create({
        data: {
          tenantId: tenant.id,
          orderId:  order.id,
          amount:   subtotal,
          currency: "ARS",
          method:   spec.paymentMethod,
          status:   "completed",
        },
      });
    }
  }
  console.log(`✓ orders (${ordersSpec.length} across all statuses)`);

  // ── 13. Caja movimientos ──────────────────────────────────────────────────────
  const cajaData = [
    // Ingresos
    { tipo: "ingreso" as const, monto: 45000,  descripcion: "Venta contado - Distribuidora El Sauce",      categoria: "Ventas",     metodoPago: "efectivo",       fecha: daysAgo(30) },
    { tipo: "ingreso" as const, monto: 128000, descripcion: "Transferencia - Boutique Primavera",           categoria: "Ventas",     metodoPago: "transferencia",  fecha: daysAgo(28) },
    { tipo: "ingreso" as const, monto: 67500,  descripcion: "Cobro MercadoPago - Sport Center",            categoria: "Ventas",     metodoPago: "mercadopago",    fecha: daysAgo(25) },
    { tipo: "ingreso" as const, monto: 15000,  descripcion: "Seña pedido - Moda Express SA",               categoria: "Adelantos",  metodoPago: "transferencia",  fecha: daysAgo(22) },
    { tipo: "ingreso" as const, monto: 89000,  descripcion: "Liquidación stock - Calzados del Sur",        categoria: "Ventas",     metodoPago: "efectivo",       fecha: daysAgo(20) },
    { tipo: "ingreso" as const, monto: 34200,  descripcion: "Cobro factura 003 - TechStore Córdoba",       categoria: "Ventas",     metodoPago: "transferencia",  fecha: daysAgo(18) },
    { tipo: "ingreso" as const, monto: 22000,  descripcion: "Venta directa - La Esquina del Deporte",      categoria: "Ventas",     metodoPago: "efectivo",       fecha: daysAgo(15) },
    { tipo: "ingreso" as const, monto: 75000,  descripcion: "Pago pendiente - Moda Express SA",            categoria: "Ventas",     metodoPago: "transferencia",  fecha: daysAgo(12) },
    { tipo: "ingreso" as const, monto: 12500,  descripcion: "Venta mostrador",                             categoria: "Ventas",     metodoPago: "efectivo",       fecha: daysAgo(10) },
    { tipo: "ingreso" as const, monto: 48000,  descripcion: "Cobro pedido 0009 - Boutique Primavera",      categoria: "Ventas",     metodoPago: "mercadopago",    fecha: daysAgo(8)  },
    { tipo: "ingreso" as const, monto: 9500,   descripcion: "Devolución proveedor - Textil Andino",        categoria: "Devolución", metodoPago: "transferencia",  fecha: daysAgo(5)  },
    { tipo: "ingreso" as const, monto: 31000,  descripcion: "Venta contado",                               categoria: "Ventas",     metodoPago: "efectivo",       fecha: daysAgo(3)  },
    { tipo: "ingreso" as const, monto: 58000,  descripcion: "Pago cuota 2 - Sport Center Norte",           categoria: "Ventas",     metodoPago: "transferencia",  fecha: daysAgo(1)  },
    // Egresos
    { tipo: "egreso" as const,  monto: 38000,  descripcion: "Compra stock - Textil Andino SRL",            categoria: "Compras",    metodoPago: "transferencia",  fecha: daysAgo(29) },
    { tipo: "egreso" as const,  monto: 12500,  descripcion: "Alquiler depósito - Junio",                  categoria: "Alquiler",   metodoPago: "transferencia",  fecha: daysAgo(26) },
    { tipo: "egreso" as const,  monto: 7800,   descripcion: "Servicios (luz + internet)",                  categoria: "Servicios",  metodoPago: "efectivo",       fecha: daysAgo(24) },
    { tipo: "egreso" as const,  monto: 55000,  descripcion: "Compra calzado - Calzado Patagónico SA",      categoria: "Compras",    metodoPago: "transferencia",  fecha: daysAgo(21) },
    { tipo: "egreso" as const,  monto: 4200,   descripcion: "Mantenimiento PC + impresora",                categoria: "Servicios",  metodoPago: "efectivo",       fecha: daysAgo(19) },
    { tipo: "egreso" as const,  monto: 18000,  descripcion: "Salario administrativo - Junio (50%)",        categoria: "Personal",   metodoPago: "transferencia",  fecha: daysAgo(16) },
    { tipo: "egreso" as const,  monto: 9600,   descripcion: "Publicidad redes sociales",                   categoria: "Marketing",  metodoPago: "mercadopago",    fecha: daysAgo(14) },
    { tipo: "egreso" as const,  monto: 28000,  descripcion: "Compra tech accesorios - Tech Imports ARG",   categoria: "Compras",    metodoPago: "transferencia",  fecha: daysAgo(11) },
    { tipo: "egreso" as const,  monto: 3500,   descripcion: "Gastos envíos y fletes",                      categoria: "Logística",  metodoPago: "efectivo",       fecha: daysAgo(9)  },
    { tipo: "egreso" as const,  monto: 18000,  descripcion: "Salario administrativo - Junio (50%)",        categoria: "Personal",   metodoPago: "transferencia",  fecha: daysAgo(7)  },
    { tipo: "egreso" as const,  monto: 6200,   descripcion: "Materiales packaging",                        categoria: "Insumos",    metodoPago: "efectivo",       fecha: daysAgo(4)  },
    { tipo: "egreso" as const,  monto: 11000,  descripcion: "Suscripción plataformas (ARCA + Cuarzo)",    categoria: "Servicios",  metodoPago: "mercadopago",    fecha: daysAgo(2)  },
  ];

  for (const mov of cajaData) {
    const existingMov = await prisma.cajaMovimiento.findFirst({
      where: { tenantId: tenant.id, descripcion: mov.descripcion, fecha: mov.fecha },
    });
    if (!existingMov) {
      await prisma.cajaMovimiento.create({ data: { tenantId: tenant.id, ...mov } });
    }
  }
  console.log(`✓ caja movimientos (${cajaData.length})`);

  // ── 14. Fiscal config (demo / test environment) ───────────────────────────────
  const existingFiscal = await prisma.fiscalConfig.findUnique({ where: { tenantId: tenant.id } });
  if (!existingFiscal) {
    await prisma.fiscalConfig.create({
      data: {
        tenantId:     tenant.id,
        cuit:         "20-12345678-9",
        ivaCondition: "Responsable Inscripto",
        puntoVenta:   1,
        production:   false,
      },
    });
    console.log("✓ fiscal config (test environment, CUIT 20-12345678-9)");
  }

  // ── 15. Subscription plan for the demo tenant ──────────────────────────────────
  const starterPlan = await prisma.subscriptionPlan.findUnique({ where: { slug: "starter" } });
  if (starterPlan) {
    const existingSub = await prisma.subscription.findUnique({ where: { tenantId: tenant.id } });
    if (!existingSub) {
      await prisma.subscription.create({
        data: {
          tenantId:           tenant.id,
          planId:             starterPlan.id,
          status:             "authorized",
          currentPeriodStart: daysAgo(5),
          currentPeriodEnd:   daysAhead(25),
        },
      });
      console.log("✓ subscription: starter (authorized)");
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  Seed complete — Cuarzo Demo ready to explore");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  URL:        http://localhost:3000/admin");
  console.log("  Owner:      admin@cuarzo.dev   / admin123  (superAdmin=true)");
  console.log("  Admin:      manager@cuarzo.dev / admin456");
  console.log("  Staff:      staff@cuarzo.dev   / staff123");
  console.log("  SuperAdmin: http://localhost:3000/superadmin");
  console.log("═══════════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
