import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Solar Panels", slug: "solar-panels", description: "Monocrystalline and polycrystalline panels for every roof." },
  { name: "Inverters", slug: "inverters", description: "Hybrid, pure sine-wave and grid-tie inverters." },
  { name: "Solar Batteries", slug: "solar-batteries", description: "LiFePO4 and lead-acid storage for reliable backup power." },
  { name: "Charge Controllers", slug: "charge-controllers", description: "MPPT and PWM controllers for efficient charging." },
  { name: "Solar Lighting", slug: "solar-lighting", description: "Street lights, flood lights and indoor solar lighting." },
  { name: "Power Stations", slug: "power-stations", description: "Portable all-in-one power stations for home and travel." },
  { name: "Solar Kits", slug: "solar-kits", description: "Complete plug-and-play systems for homes and offices." },
  { name: "Accessories & Cables", slug: "accessories-cables", description: "Mounting, cabling and connectors for every install." },
];

const BRANDS = ["NovaCell", "SunForge", "VoltArc", "HelioMax", "GridEase"];

function specs(pairs: [string, string][]) {
  return pairs.map(([label, value], position) => ({ label, value, position }));
}

async function main() {
  console.log("Seeding NovaSunHub database…");

  // --- Admin + demo customer ---
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@novasunhub.com" },
    update: {},
    create: {
      name: "NovaSunHub Admin",
      email: "admin@novasunhub.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const customerPasswordHash = await bcrypt.hash("Customer@12345", 12);
  await prisma.user.upsert({
    where: { email: "demo@novasunhub.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "demo@novasunhub.com",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
    },
  });

  // --- Categories ---
  const categoryMap: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categoryMap[c.slug] = cat.id;
  }

  // --- Brands ---
  const brandMap: Record<string, string> = {};
  for (const name of BRANDS) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const brand = await prisma.brand.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    brandMap[name] = brand.id;
  }

  const img = (seed: string) =>
    `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

  const products = [
    {
      name: "NovaCell 550W Monocrystalline Panel",
      sku: "NSH-PNL-550M",
      category: "solar-panels",
      brand: "NovaCell",
      price: 185000,
      salePrice: 169000,
      stockQuantity: 42,
      shortDescription: "High-efficiency 550W monocrystalline panel for residential and commercial arrays.",
      description:
        "The NovaCell 550W panel delivers industry-leading efficiency with a 21.6% conversion rate, PERC cell technology, and a corrosion-resistant anodized aluminum frame built for tropical climates. Backed by a 25-year performance warranty.",
      specs: specs([
        ["Wattage", "550W"],
        ["Cell Type", "Monocrystalline PERC"],
        ["Efficiency", "21.6%"],
        ["Voltage (Voc)", "49.8V"],
        ["Dimensions", "2278 × 1134 × 35 mm"],
        ["Weight", "27.5 kg"],
        ["Warranty", "25 years performance / 12 years product"],
      ]),
      wattage: "550W",
      voltage: "49.8V",
      weightKg: 27.5,
      dimensions: "2278 × 1134 × 35 mm",
      warranty: "25-year performance warranty",
      isFeatured: true,
      images: [img("photo-1509391366360-2e959784a276"), img("photo-1508514177221-188b1cf16e9d")],
    },
    {
      name: "SunForge 8kW Hybrid Inverter",
      sku: "NSH-INV-8KH",
      category: "inverters",
      brand: "SunForge",
      price: 612000,
      stockQuantity: 18,
      shortDescription: "Pure sine-wave hybrid inverter with built-in MPPT and grid/generator support.",
      description:
        "An 8kW hybrid inverter engineered for unstable grids — seamless switching between solar, battery and grid/generator input, with a WiFi-enabled monitoring app and configurable charge priorities.",
      specs: specs([
        ["Rated Power", "8000W"],
        ["Output Waveform", "Pure Sine Wave"],
        ["MPPT Channels", "2"],
        ["Battery Voltage", "48V"],
        ["Efficiency", "97.6%"],
        ["Warranty", "5 years"],
      ]),
      wattage: "8000W",
      voltage: "48V",
      inverterCapacity: "8kW",
      warranty: "5-year warranty",
      isFeatured: true,
      images: [img("photo-1591964006776-90c9c33d6cc1"), img("photo-1584277261846-c6a1672a5aab")],
    },
    {
      name: "VoltArc 100Ah LiFePO4 Battery",
      sku: "NSH-BAT-100L",
      category: "solar-batteries",
      brand: "VoltArc",
      price: 398000,
      salePrice: 359000,
      stockQuantity: 30,
      shortDescription: "Deep-cycle lithium iron phosphate battery rated for 6000+ cycles.",
      description:
        "Built-in smart BMS with over-charge, over-discharge, short-circuit and thermal protection. Maintenance-free and safe for indoor stacking, with a 10-year design life at 80% depth of discharge.",
      specs: specs([
        ["Capacity", "100Ah / 1.28kWh"],
        ["Chemistry", "LiFePO4"],
        ["Voltage", "12.8V"],
        ["Cycle Life", "6000+ cycles @ 80% DoD"],
        ["BMS", "Integrated smart BMS"],
        ["Warranty", "10 years"],
      ]),
      batteryCapacity: "100Ah / 1.28kWh",
      voltage: "12.8V",
      warranty: "10-year warranty",
      isFeatured: true,
      images: [img("photo-1620714223084-8fcacc6dfd8d"), img("photo-1613665813446-82a78c468a1d")],
    },
    {
      name: "HelioMax 60A MPPT Charge Controller",
      sku: "NSH-CHG-60M",
      category: "charge-controllers",
      brand: "HelioMax",
      price: 96000,
      stockQuantity: 55,
      shortDescription: "High-efficiency MPPT controller with LCD display and Bluetooth monitoring.",
      description:
        "Tracks maximum power point with up to 99.5% efficiency across 12V/24V/36V/48V auto-sensing systems. Includes an LCD display, USB monitoring port and configurable load timer.",
      specs: specs([
        ["Rated Current", "60A"],
        ["Tracking Efficiency", "99.5%"],
        ["System Voltage", "12/24/36/48V auto"],
        ["Max PV Input", "150V"],
        ["Display", "Backlit LCD"],
        ["Warranty", "3 years"],
      ]),
      voltage: "12/24/36/48V",
      warranty: "3-year warranty",
      images: [img("photo-1497440001374-f26997328c1b")],
    },
    {
      name: "GridEase 60W All-in-One Solar Street Light",
      sku: "NSH-LGT-60S",
      category: "solar-lighting",
      brand: "GridEase",
      price: 74000,
      stockQuantity: 70,
      shortDescription: "Integrated panel, battery, LED and motion sensor in one weatherproof housing.",
      description:
        "A fully self-contained solar street light with automatic dusk-to-dawn operation, motion-activated brightness boost, and IP66 weatherproofing for outdoor estates, compounds and roads.",
      specs: specs([
        ["LED Power", "60W"],
        ["Battery", "Built-in LiFePO4 15Ah"],
        ["Sensor", "PIR motion, adjustable range"],
        ["Ingress Rating", "IP66"],
        ["Runtime", "Up to 3 nights on full charge"],
        ["Warranty", "2 years"],
      ]),
      wattage: "60W",
      warranty: "2-year warranty",
      images: [img("photo-1544829099-b9a0c07fad1a")],
    },
    {
      name: "NovaCell 1200Wh Portable Power Station",
      sku: "NSH-PWR-1200",
      category: "power-stations",
      brand: "NovaCell",
      price: 452000,
      salePrice: 419000,
      stockQuantity: 24,
      shortDescription: "1200Wh LiFePO4 power station with pure sine-wave AC, USB-C PD and solar input.",
      description:
        "A compact, silent backup for laptops, routers, fridges and medical devices. Recharge from solar in under 3 hours with the included 200W foldable panel input, or top up from mains overnight.",
      specs: specs([
        ["Capacity", "1200Wh"],
        ["AC Output", "1000W (2000W surge)"],
        ["Ports", "2× AC, 2× USB-C PD, 4× USB-A, DC"],
        ["Recharge Time (Solar)", "~3 hours with 200W input"],
        ["Weight", "13.2 kg"],
        ["Warranty", "3 years"],
      ]),
      batteryCapacity: "1200Wh",
      weightKg: 13.2,
      warranty: "3-year warranty",
      isFeatured: true,
      images: [img("photo-1624397640148-949b1732bb0a"), img("photo-1509391366360-2e959784a276")],
    },
    {
      name: "SunForge 5kW Complete Home Solar Kit",
      sku: "NSH-KIT-5KH",
      category: "solar-kits",
      brand: "SunForge",
      price: 2450000,
      salePrice: 2190000,
      stockQuantity: 9,
      shortDescription: "Panels, hybrid inverter, lithium battery bank and mounting — everything for a mid-size home.",
      description:
        "A complete plug-and-play system sized for a typical 3–4 bedroom home: 8× 550W panels, an 8kW hybrid inverter, 5.12kWh lithium battery bank, roof mounting rails and all DC cabling. Professional installation guidance included.",
      specs: specs([
        ["System Size", "4.4kWp array / 8kW inverter"],
        ["Battery Bank", "5.12kWh LiFePO4"],
        ["Includes", "8 panels, inverter, battery, mounting, cabling"],
        ["Estimated Daily Output", "18–22 kWh (avg. sun hours)"],
        ["Install", "Guided self-install or certified installer"],
        ["Warranty", "Up to 25 years on panels"],
      ]),
      installationInfo: "Includes step-by-step install guide; certified installer network available on request.",
      warranty: "Up to 25-year component warranties",
      isFeatured: true,
      images: [img("photo-1508514177221-188b1cf16e9d"), img("photo-1591964006776-90c9c33d6cc1")],
    },
    {
      name: "VoltArc 6mm² Solar DC Cable (100m)",
      sku: "NSH-ACC-CBL6",
      category: "accessories-cables",
      brand: "VoltArc",
      price: 38500,
      stockQuantity: 120,
      shortDescription: "UV-resistant double-insulated DC cable for panel-to-controller wiring.",
      description:
        "TUV-certified single-core PV cable rated for 25+ years of outdoor exposure, with tinned copper conductors for corrosion resistance in humid climates.",
      specs: specs([
        ["Cross Section", "6mm²"],
        ["Length", "100m"],
        ["Rated Voltage", "1.5kV DC"],
        ["Conductor", "Tinned copper"],
        ["UV Rating", "25+ years outdoor"],
      ]),
      images: [img("photo-1621905251189-08b45d6a269e")],
    },
  ];

  for (const p of products) {
    const { category, brand, specs: specList, images, ...rest } = p;
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        ...rest,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        status: "PUBLISHED",
        categoryId: categoryMap[category],
        brandId: brandMap[brand],
        images: {
          create: images.map((url, i) => ({ url, isPrimary: i === 0, position: i })),
        },
        specifications: { create: specList },
      },
    });
  }

  console.log(`Seed complete. Admin login: admin@novasunhub.com / Admin@12345`);
  console.log(`Demo customer login: demo@novasunhub.com / Customer@12345`);
  console.log(`These are demo/seed products, not yet connected to a live supplier API.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
