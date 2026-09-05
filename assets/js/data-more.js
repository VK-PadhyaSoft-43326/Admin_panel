/* Fernwood Admin — demo data for the secondary modules.
   Same idea as data.js: swap each array for your API response. */

(function () {
  var P = window.DB.products;
  var C = window.DB.customers;
  var O = window.DB.orders;

  function pick(arr, i) { return arr[i % arr.length]; }
  function day(i) { return "2026-0" + (6 + (i % 3)) + "-" + String((i % 27) + 1).padStart(2, "0"); }
  function stamp(i) {
    return day(i) + " " + String(8 + (i % 11)).padStart(2, "0") + ":" + String((i * 7) % 60).padStart(2, "0");
  }

  var cats = ["Kitchen", "Bath", "Bedding", "Garden", "Home", "Stationery"];

  /* ---------------------------------------------------------- catalog */

  var categories = [];
  cats.forEach(function (c, i) {
    categories.push({
      id: "CAT-" + (10 + i), name: c, slug: c.toLowerCase(), parent: "—",
      products: P.filter(function (p) { return p.category === c; }).length,
      status: i === 5 ? "Hidden" : "Active", updated: day(i * 3)
    });
  });
  [
    ["Cookware", "Kitchen"], ["Tableware", "Kitchen"], ["Towels", "Bath"],
    ["Soaps", "Bath"], ["Quilts", "Bedding"], ["Planters", "Garden"],
    ["Tools", "Garden"], ["Candles", "Home"], ["Storage", "Home"], ["Notebooks", "Stationery"]
  ].forEach(function (pair, i) {
    categories.push({
      id: "CAT-" + (20 + i), name: pair[0], slug: pair[0].toLowerCase(), parent: pair[1],
      products: 2 + (i % 5), status: "Active", updated: day(i * 2 + 4)
    });
  });

  var attributes = [
    ["Colour", "Swatch", "Natural, Indigo, Charcoal, Terracotta", 18],
    ["Size", "Dropdown", "Small, Medium, Large", 24],
    ["Material", "Dropdown", "Cotton, Linen, Brass, Cedar, Stoneware", 31],
    ["Weave", "Dropdown", "Waffle, Percale, Muslin", 9],
    ["Capacity", "Text", "250 ml, 500 ml, 1 L", 6],
    ["Finish", "Dropdown", "Matte, Glazed, Raw", 14],
    ["Gift wrap", "Toggle", "Yes, No", 40]
  ].map(function (a, i) {
    return {
      id: "ATT-" + (100 + i), name: a[0], type: a[1], values: a[2], products: a[3],
      status: i === 6 ? "Inactive" : "Active", updated: day(i * 4)
    };
  });

  var brands = [
    ["Fernwood Own", "In house", 14], ["Kaner Studio", "Partner", 6],
    ["Vaya Ceramics", "Partner", 5], ["Anaj Textiles", "Partner", 8],
    ["Copperleaf", "Partner", 3], ["Third Sparrow", "Consignment", 4]
  ].map(function (b, i) {
    return {
      id: "BRD-" + (200 + i), name: b[0], kind: b[1], products: b[2],
      status: i === 5 ? "Inactive" : "Active", updated: day(i * 5)
    };
  });

  var collections = [
    ["Monsoon kitchen", "Manual", 12, "Active"], ["Under two thousand", "Automatic", 31, "Active"],
    ["New this month", "Automatic", 8, "Active"], ["Wedding gifting", "Manual", 16, "Active"],
    ["Clearance", "Automatic", 5, "Hidden"], ["Festive lights", "Manual", 9, "Draft"]
  ].map(function (c, i) {
    return {
      id: "COL-" + (300 + i), name: c[0], rule: c[1], products: c[2],
      status: c[3], updated: day(i * 6)
    };
  });

  var uoms = [
    ["Piece", "pc", "Count", 1], ["Pair", "pr", "Count", 2],
    ["Set of three", "set3", "Count", 3], ["Metre", "m", "Length", 1],
    ["Gram", "g", "Weight", 1], ["Kilogram", "kg", "Weight", 1000],
    ["Millilitre", "ml", "Volume", 1], ["Litre", "l", "Volume", 1000]
  ].map(function (u, i) {
    return {
      id: "UOM-" + (400 + i), name: u[0], code: u[1], kind: u[2], factor: u[3],
      status: "Active", updated: day(i * 2)
    };
  });

  /* ---------------------------------------------------------- inventory */

  var stock = P.map(function (p, i) {
    var reserved = p.stock ? (i % 4) : 0;
    return {
      id: "STK-" + p.id, product: p.name, sku: p.sku, warehouse: i % 3 === 0 ? "Bodakdev" : (i % 3 === 1 ? "Rajkot" : "Pune"),
      onHand: p.stock, reserved: reserved, available: Math.max(0, p.stock - reserved),
      status: p.stock === 0 ? "Sold out" : (p.stock <= 5 ? "Low" : "Healthy"),
      updated: day(i)
    };
  });

  var moves = ["Purchase", "Sale", "Return", "Adjustment", "Damage"];
  var stockHistory = [];
  for (var s = 0; s < 40; s++) {
    var pr = pick(P, s * 3);
    var move = pick(moves, s);
    var qty = move === "Purchase" || move === "Return" ? (s % 12) + 4 : -((s % 5) + 1);
    stockHistory.push({
      id: "MOV-" + (5000 + s), product: pr.name, sku: pr.sku, move: move, qty: qty,
      balance: pr.stock + (s % 9), reference: move === "Sale" ? pick(O, s).id : "PO-" + (900 + s),
      user: pick(["Rhea Menon", "Dev Patel", "Anita Rao"], s), at: stamp(s)
    });
  }

  /* ---------------------------------------------------------- promotions */

  var offers = [
    ["Monsoon 15", "Percentage", "15% off kitchen", "Kitchen", 214, "Active"],
    ["Buy 2 soaps", "Bundle", "Third soap free", "Bath", 96, "Active"],
    ["Free delivery", "Shipping", "Orders above ₹1,499", "All products", 613, "Active"],
    ["Bedding bundle", "Percentage", "20% on quilt plus sheets", "Bedding", 48, "Scheduled"],
    ["Diwali gifting", "Fixed", "₹300 off above ₹2,500", "All products", 0, "Draft"],
    ["Clearance garden", "Percentage", "30% off planters", "Garden", 187, "Expired"]
  ].map(function (o, i) {
    return {
      id: "OFF-" + (600 + i), name: o[0], kind: o[1], detail: o[2], applies: o[3],
      used: o[4], status: o[5], starts: day(i), ends: day(i + 12)
    };
  });

  var coupons = [
    ["FERN10", "10%", 500, 318, "Active"], ["WELCOME200", "₹200", 1000, 742, "Active"],
    ["MONSOON25", "25%", 200, 200, "Used up"], ["FREESHIP", "Delivery", 400, 156, "Active"],
    ["STAFF50", "50%", 50, 12, "Active"], ["EARLYBIRD", "15%", 300, 300, "Expired"],
    ["GIFT500", "₹500", 150, 41, "Scheduled"], ["TRYFERN", "5%", 999, 604, "Active"]
  ].map(function (c, i) {
    return {
      id: "CPN-" + (700 + i), code: c[0], value: c[1], cap: c[2], used: c[3],
      status: c[4], perCustomer: (i % 2) + 1, expires: day(i + 8)
    };
  });

  /* ---------------------------------------------------------- money */

  var invoices = O.slice(0, 34).map(function (o, i) {
    var paid = ["Delivered", "Shipped", "Packed", "Paid"].indexOf(o.status) > -1;
    return {
      id: "INV-" + (3100 + i), order: o.id, customer: o.customer,
      amount: o.total, tax: Math.round(o.total * 0.18),
      status: o.status === "Cancelled" ? "Cancelled" : (o.status === "Refunded" ? "Credited" : (paid ? "Paid" : "Unpaid")),
      issued: o.date, due: o.date
    };
  });

  var gateways = ["Razorpay", "Stripe", "PhonePe", "Cash"];
  var payments = O.slice(0, 38).map(function (o, i) {
    return {
      id: "TXN-" + (81000 + i * 7), order: o.id, customer: o.customer,
      method: o.payment, gateway: pick(gateways, i), amount: o.total,
      fee: Math.round(o.total * 0.02),
      status: o.status === "Refunded" ? "Refunded" : (o.status === "Cancelled" ? "Failed" : "Captured"),
      at: stamp(i)
    };
  });

  /* ---------------------------------------------------------- logistics */

  var carriers = ["Delhivery", "Blue Dart", "India Post", "Porter"];
  var shipments = O.slice(0, 32).map(function (o, i) {
    var st = o.status === "Delivered" ? "Delivered"
      : o.status === "Shipped" ? "In transit"
      : o.status === "Packed" ? "Ready to hand over"
      : o.status === "Cancelled" ? "Cancelled" : "Awaiting pickup";
    return {
      id: "SHP-" + (4200 + i), order: o.id, customer: o.customer, city: o.city,
      carrier: pick(carriers, i), awb: "AWB" + (77000000 + i * 313),
      weight: (0.4 + (i % 7) * 0.35).toFixed(2) + " kg",
      status: st, shipped: o.date
    };
  });

  var reasons = ["Damaged in transit", "Wrong item sent", "Changed mind", "Size not right", "Late delivery"];
  var returns = [];
  for (var r = 0; r < 18; r++) {
    var ord = pick(O, r * 5);
    returns.push({
      id: "RET-" + (5100 + r), order: ord.id, customer: ord.customer,
      product: pick(P, r * 3).name, reason: pick(reasons, r), qty: (r % 2) + 1,
      status: pick(["Requested", "Approved", "Picked up", "Completed", "Rejected"], r),
      amount: pick(P, r * 3).price, raised: day(r)
    });
  }

  var refunds = returns.filter(function (x, i) { return i % 2 === 0; }).map(function (x, i) {
    return {
      id: "RFD-" + (5600 + i), ret: x.id, order: x.order, customer: x.customer,
      amount: x.amount, method: pick(["UPI", "Card", "Store credit", "Bank transfer"], i),
      status: pick(["Processing", "Completed", "Failed"], i), issued: x.raised
    };
  });

  /* ---------------------------------------------------------- voice */

  var reviewText = [
    "The grain on this board is beautiful and it has not warped once.",
    "Arrived two days early. Packaging was plastic free, which I appreciated.",
    "Colour is deeper than the photos. Not a complaint, just a heads up.",
    "Handle came loose after a month. Support sent a replacement quickly.",
    "Bought three as gifts. All three got asked about.",
    "Good weight, sits flat, cleans easily. Nothing to fault."
  ];
  var reviews = [];
  for (var v = 0; v < 26; v++) {
    reviews.push({
      id: "REV-" + (6100 + v), product: pick(P, v * 3).name, customer: pick(C, v).name,
      rating: [5, 4, 5, 3, 5, 4, 2, 5][v % 8], title: pick(reviewText, v).slice(0, 44) + "…",
      body: pick(reviewText, v),
      status: pick(["Published", "Pending", "Published", "Hidden"], v), at: day(v)
    });
  }

  var topics = ["Bulk order", "Product question", "Delivery delay", "Wholesale", "Custom engraving", "Gift wrapping"];
  var enquiries = [];
  for (var e = 0; e < 22; e++) {
    var cu = pick(C, e * 2);
    enquiries.push({
      id: "ENQ-" + (7100 + e), name: cu.name, email: cu.email, phone: "+91 9" + (800000000 + e * 137),
      topic: pick(topics, e), message: "Asking about " + pick(topics, e).toLowerCase() + " for an order of " + ((e % 9) + 2) + " units.",
      status: pick(["New", "Open", "Answered", "Closed"], e), owner: pick(["Rhea Menon", "Dev Patel", "Unassigned"], e),
      at: stamp(e)
    });
  }

  /* ---------------------------------------------------------- admin */

  var users = [
    ["Rhea Menon", "rhea@fernwoodgoods.in", "Owner", "Active"],
    ["Dev Patel", "dev@fernwoodgoods.in", "Manager", "Active"],
    ["Anita Rao", "anita@fernwoodgoods.in", "Warehouse", "Active"],
    ["Sameer Joshi", "sameer@fernwoodgoods.in", "Support", "Active"],
    ["Fatima Ali", "fatima@fernwoodgoods.in", "Marketing", "Active"],
    ["Nikhil Gowda", "nikhil@fernwoodgoods.in", "Accounts", "Suspended"],
    ["Pooja Sen", "pooja@fernwoodgoods.in", "Support", "Invited"]
  ].map(function (u, i) {
    return {
      id: "USR-" + (900 + i), name: u[0], email: u[1], role: u[2], status: u[3],
      lastSeen: stamp(i), added: day(i * 3)
    };
  });

  var roles = [
    ["Owner", "Everything, including billing and staff", 1, 24],
    ["Manager", "Catalogue, orders, promotions, reports", 1, 18],
    ["Warehouse", "Stock, shipments, returns", 1, 8],
    ["Support", "Orders, enquiries, reviews, refunds", 2, 11],
    ["Marketing", "Promotions, collections, reviews", 1, 7],
    ["Accounts", "Invoices, payments, refunds", 1, 9]
  ].map(function (r, i) {
    return {
      id: "ROL-" + (950 + i), name: r[0], scope: r[1], users: r[2], permissions: r[3],
      status: "Active", updated: day(i * 4)
    };
  });

  var permissions = [];
  [
    ["Catalog", ["View products", "Edit products", "Delete products", "Manage categories", "Manage brands"]],
    ["Inventory", ["View stock", "Adjust stock", "View stock history"]],
    ["Orders", ["View orders", "Change status", "Cancel orders"]],
    ["Money", ["View invoices", "Issue refunds", "View payouts"]],
    ["Admin", ["Manage users", "Manage roles", "View audit logs"]]
  ].forEach(function (grp, gi) {
    grp[1].forEach(function (name, ni) {
      permissions.push({
        id: "PRM-" + (gi * 10 + ni + 1), name: name, group: grp[0],
        key: grp[0].toLowerCase() + "." + name.toLowerCase().replace(/ /g, "_"),
        roles: ((gi + ni) % 5) + 1, status: "Active"
      });
    });
  });

  var loginHistory = [];
  for (var l = 0; l < 30; l++) {
    var us = pick(users, l);
    loginHistory.push({
      id: "LOG-" + (8100 + l), user: us.name, email: us.email,
      ip: "103.21." + (l % 200) + "." + ((l * 13) % 250),
      device: pick(["Chrome on Windows", "Safari on iPhone", "Chrome on Android", "Firefox on Linux"], l),
      city: pick(["Ahmedabad", "Pune", "Bengaluru", "Surat"], l),
      status: l % 9 === 0 ? "Failed" : "Success", at: stamp(l)
    });
  }

  var actions = ["Created", "Updated", "Deleted", "Exported", "Signed in"];
  var entities = ["Product", "Order", "Coupon", "User", "Category", "Refund"];
  var auditLogs = [];
  for (var a = 0; a < 44; a++) {
    auditLogs.push({
      id: "AUD-" + (91000 + a), user: pick(users, a).name, action: pick(actions, a),
      entity: pick(entities, a), record: pick(entities, a).toUpperCase().slice(0, 3) + "-" + (100 + a),
      detail: pick(actions, a) + " " + pick(entities, a).toLowerCase() + " record",
      ip: "103.21." + (a % 200) + ".14", at: stamp(a)
    });
  }

  var errorLogs = [];
  var errs = [
    ["Payment webhook timed out", "Gateway did not respond within 30 seconds", "Critical"],
    ["Image upload failed", "File larger than 5 MB was rejected", "Warning"],
    ["Stock sync mismatch", "Warehouse count differs from store count", "Warning"],
    ["Invoice PDF generation failed", "Template missing for this tax profile", "Critical"],
    ["Search index stale", "Reindex job did not run last night", "Notice"],
    ["Email bounced", "Customer address rejected the message", "Notice"]
  ];
  for (var x2 = 0; x2 < 24; x2++) {
    var er = pick(errs, x2);
    errorLogs.push({
      id: "ERR-" + (92000 + x2), title: er[0], detail: er[1], level: er[2],
      source: pick(["Checkout", "Catalogue", "Inventory", "Billing", "Email"], x2),
      count: (x2 % 7) + 1, at: stamp(x2)
    });
  }

  $.extend(window.DB, {
    categories: categories, attributes: attributes, brands: brands,
    collections: collections, uoms: uoms, stock: stock, stockHistory: stockHistory,
    offers: offers, coupons: coupons, invoices: invoices, payments: payments,
    shipments: shipments, returns: returns, refunds: refunds, reviews: reviews,
    enquiries: enquiries, users: users, roles: roles, permissions: permissions,
    loginHistory: loginHistory, auditLogs: auditLogs, errorLogs: errorLogs
  });
})();
