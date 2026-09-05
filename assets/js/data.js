/* Fernwood Admin — demo data.
   Replace these arrays with your API response and the rest of the app keeps working. */

window.DB = (function () {

  const products = [
    { id: 1,  name: "Cedar chopping board",        sku: "FW-KIT-011", category: "Kitchen",  price: 1890, stock: 3,   sold: 412, active: true },
    { id: 2,  name: "Stoneware dinner plate",      sku: "FW-KIT-024", category: "Kitchen",  price: 640,  stock: 128, sold: 903, active: true },
    { id: 3,  name: "Brass measuring spoons",      sku: "FW-KIT-031", category: "Kitchen",  price: 1240, stock: 46,  sold: 271, active: true },
    { id: 4,  name: "Linen apron, natural",        sku: "FW-KIT-044", category: "Kitchen",  price: 1560, stock: 0,   sold: 188, active: false },
    { id: 5,  name: "Cast iron skillet, 10 inch",  sku: "FW-KIT-052", category: "Kitchen",  price: 3450, stock: 22,  sold: 356, active: true },
    { id: 6,  name: "Waffle cotton bath towel",    sku: "FW-BTH-007", category: "Bath",     price: 1180, stock: 74,  sold: 528, active: true },
    { id: 7,  name: "Neem wood soap dish",         sku: "FW-BTH-013", category: "Bath",     price: 420,  stock: 4,   sold: 340, active: true },
    { id: 8,  name: "Cold pressed coconut soap",   sku: "FW-BTH-019", category: "Bath",     price: 260,  stock: 210, sold: 1642, active: true },
    { id: 9,  name: "Sisal body brush",            sku: "FW-BTH-025", category: "Bath",     price: 690,  stock: 38,  sold: 199, active: true },
    { id: 10, name: "Indigo block print quilt",    sku: "FW-BED-002", category: "Bedding",  price: 5900, stock: 11,  sold: 87,  active: true },
    { id: 11, name: "Cotton percale sheet set",    sku: "FW-BED-008", category: "Bedding",  price: 4200, stock: 29,  sold: 143, active: true },
    { id: 12, name: "Kapok bolster pillow",        sku: "FW-BED-014", category: "Bedding",  price: 1750, stock: 0,   sold: 96,  active: false },
    { id: 13, name: "Terracotta planter, medium",  sku: "FW-GRD-005", category: "Garden",   price: 880,  stock: 64,  sold: 471, active: true },
    { id: 14, name: "Copper watering can",         sku: "FW-GRD-011", category: "Garden",   price: 2650, stock: 17,  sold: 122, active: true },
    { id: 15, name: "Jute plant hanger",           sku: "FW-GRD-016", category: "Garden",   price: 540,  stock: 92,  sold: 388, active: true },
    { id: 16, name: "Hand trowel, ash handle",     sku: "FW-GRD-022", category: "Garden",   price: 760,  stock: 2,   sold: 214, active: true },
    { id: 17, name: "Beeswax candle, set of three",sku: "FW-HOM-003", category: "Home",     price: 1320, stock: 55,  sold: 762, active: true },
    { id: 18, name: "Wool throw, charcoal",        sku: "FW-HOM-009", category: "Home",     price: 4800, stock: 8,   sold: 105, active: true },
    { id: 19, name: "Rattan storage basket",       sku: "FW-HOM-017", category: "Home",     price: 1980, stock: 31,  sold: 260, active: true },
    { id: 20, name: "Ceramic incense holder",      sku: "FW-HOM-021", category: "Home",     price: 480,  stock: 118, sold: 594, active: true },
    { id: 21, name: "Leather journal, A5",         sku: "FW-STA-004", category: "Stationery", price: 1450, stock: 43, sold: 317, active: true },
    { id: 22, name: "Fountain pen, matte black",   sku: "FW-STA-010", category: "Stationery", price: 2290, stock: 19, sold: 141, active: true },
    { id: 23, name: "Handmade paper notecards",    sku: "FW-STA-018", category: "Stationery", price: 590,  stock: 87, sold: 402, active: true },
    { id: 24, name: "Brass letter opener",         sku: "FW-STA-026", category: "Stationery", price: 980,  stock: 5,  sold: 78,  active: true }
  ];

  const customerNames = [
    ["Aditi Rane", "aditi.rane@gmail.com", "Pune"],
    ["Vikram Shah", "vikram@shahandco.in", "Ahmedabad"],
    ["Nisha Kurien", "nisha.kurien@outlook.com", "Kochi"],
    ["Rohan Bhatt", "rohan.bhatt@gmail.com", "Surat"],
    ["Meera Iyer", "meera.iyer@zoho.com", "Chennai"],
    ["Kabir Sethi", "kabir.sethi@gmail.com", "Delhi"],
    ["Tanvi Deshmukh", "tanvi.d@gmail.com", "Nagpur"],
    ["Arjun Menon", "arjun.menon@proton.me", "Bengaluru"],
    ["Sana Qureshi", "sana.q@gmail.com", "Hyderabad"],
    ["Devan Pillai", "devan.pillai@gmail.com", "Thrissur"],
    ["Ira Chatterjee", "ira.chat@gmail.com", "Kolkata"],
    ["Yash Solanki", "yash.solanki@gmail.com", "Rajkot"],
    ["Priya Nambiar", "priya.n@outlook.com", "Mumbai"],
    ["Harsh Vora", "harsh.vora@gmail.com", "Vadodara"],
    ["Leela Krishnan", "leela.k@gmail.com", "Coimbatore"],
    ["Imran Shaikh", "imran.shaikh@gmail.com", "Bhopal"]
  ];

  const customers = customerNames.map(function (c, i) {
    const orders = [14, 11, 9, 8, 7, 7, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1][i];
    const spent = orders * (1800 + ((i * 617) % 2400));
    return {
      id: 100 + i,
      name: c[0],
      email: c[1],
      city: c[2],
      orders: orders,
      spent: spent,
      tier: orders >= 8 ? "Gold" : orders >= 4 ? "Silver" : "Regular",
      joined: "20" + (22 + (i % 4)) + "-" + String((i % 12) + 1).padStart(2, "0") + "-" + String((i * 3 % 27) + 1).padStart(2, "0")
    };
  });

  const statuses = ["Paid", "Packed", "Shipped", "Delivered", "Refunded", "Cancelled"];
  const payments = ["UPI", "Card", "Net banking", "Cash on delivery"];

  const orders = [];
  for (let i = 0; i < 46; i++) {
    const cust = customers[i % customers.length];
    const itemCount = (i % 3) + 1;
    const lines = [];
    for (let j = 0; j < itemCount; j++) {
      const p = products[(i * 5 + j * 7) % products.length];
      const qty = ((i + j) % 3) + 1;
      lines.push({ name: p.name, sku: p.sku, qty: qty, price: p.price });
    }
    const subtotal = lines.reduce(function (s, l) { return s + l.qty * l.price; }, 0);
    const shipping = subtotal >= 1499 ? 0 : 79;
    const day = 28 - (i % 28);
    orders.push({
      id: "FW-" + (2087 - i),
      customer: cust.name,
      email: cust.email,
      city: cust.city,
      items: lines.reduce(function (s, l) { return s + l.qty; }, 0),
      lines: lines,
      subtotal: subtotal,
      shipping: shipping,
      total: subtotal + shipping,
      payment: payments[i % payments.length],
      status: i < 4 ? "Paid" : statuses[(i * 3) % statuses.length],
      date: "2026-08-" + String(day).padStart(2, "0")
    });
  }

  const days = [];
  const revenue = [];
  const orderCounts = [];
  for (let d = 1; d <= 30; d++) {
    days.push("Aug " + d);
    const base = 32000 + Math.round(Math.sin(d / 2.4) * 9000) + (d % 7 === 0 ? 14000 : 0) + d * 420;
    revenue.push(base);
    orderCounts.push(Math.round(base / 2600));
  }

  const channels = {
    labels: ["Own website", "Instagram shop", "Marketplace", "Retail pop-up"],
    values: [46, 24, 21, 9]
  };

  return {
    products: products,
    orders: orders,
    customers: customers,
    statuses: statuses,
    channels: channels,
    series: { days: days, revenue: revenue, orders: orderCounts }
  };
})();
