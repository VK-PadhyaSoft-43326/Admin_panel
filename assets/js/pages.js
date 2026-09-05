/* Fernwood Admin — configuration for every submodule.
   One entry per entity. `columns` drives the grid, `form` drives the create/edit page.
   Add a key here (plus a matching pair of HTML files) to add a new submodule. */

window.PAGES = (function () {

  var M = { type: "money" }, N = { type: "num" }, D = { type: "date" }, T = { type: "tag" };

  function col(key, label, extra) {
    return $.extend({ key: key, label: label }, extra || {});
  }

  return {

    /* ================================================================= CATALOG */

    categories: {
      title: "Categories", singular: "category", group: "Catalog",
      lede: "The shelves your catalogue sits on. Nest a category by giving it a parent.",
      source: "categories", noun: "categories", idKey: "id",
      sort: "name", search: ["name", "slug", "parent"], pills: "status",
      columns: [
        col("name", "Category", { type: "main", sub: "slug" }),
        col("parent", "Parent"), col("products", "Products", N),
        col("status", "Status", T), col("updated", "Updated", D)
      ],
      filters: [{ key: "parent", label: "Any parent" }],
      form: [
        { key: "name", label: "Category name", type: "text", required: true },
        { key: "slug", label: "Web address", type: "text", required: true },
        { key: "parent", label: "Parent category", type: "select", from: "parent" },
        { key: "products", label: "Products in this category", type: "number" },
        { key: "status", label: "Status", type: "select", options: ["Active", "Hidden"] }
      ]
    },

    products: {
      title: "Products", singular: "product", group: "Catalog",
      lede: "Everything you sell, with stock counts kept live.",
      source: "products", noun: "products", idKey: "id",
      sort: "name", search: ["name", "sku", "category"],
      columns: [
        col("name", "Product", { type: "main", sub: "sku" }),
        col("category", "Category"), col("price", "Price", M),
        col("stock", "Stock", { type: "stock" }), col("sold", "Sold", N),
        col("active", "Live", T)
      ],
      filters: [{ key: "category", label: "Any category" }],
      form: [
        { key: "name", label: "Product name", type: "text", required: true },
        { key: "sku", label: "SKU", type: "text", required: true },
        { key: "category", label: "Category", type: "select", from: "category" },
        { key: "price", label: "Price (\u20B9)", type: "number", required: true },
        { key: "stock", label: "Units in stock", type: "number", required: true },
        { key: "sold", label: "Units sold to date", type: "number" },
        { key: "description", label: "Description", type: "textarea", wide: true },
        { key: "active", label: "Show in storefront", type: "toggle" }
      ]
    },

    attributes: {
      title: "Attributes", singular: "attribute", group: "Catalog",
      lede: "Options shoppers choose from, and the fields you filter your catalogue by.",
      source: "attributes", noun: "attributes", idKey: "id",
      sort: "name", search: ["name", "type", "values"], pills: "status",
      columns: [
        col("name", "Attribute", { type: "main", sub: "type" }),
        col("values", "Values", { type: "note" }), col("products", "Used by", N),
        col("status", "Status", T), col("updated", "Updated", D)
      ],
      filters: [{ key: "type", label: "Any input type" }],
      form: [
        { key: "name", label: "Attribute name", type: "text", required: true },
        { key: "type", label: "Input type", type: "select", options: ["Dropdown", "Swatch", "Text", "Toggle"] },
        { key: "values", label: "Values, separated by commas", type: "textarea", wide: true },
        { key: "products", label: "Used by this many products", type: "number" },
        { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] }
      ]
    },

    brands: {
      idPrefix: "BRD",
      title: "Brands", singular: "brand", group: "Catalog",
      lede: "Who made it. Partner and consignment brands settle on different terms.",
      source: "brands", noun: "brands", idKey: "id",
      sort: "name", search: ["name", "kind"], pills: "status",
      columns: [
        col("name", "Brand", { type: "main", sub: "kind" }),
        col("products", "Products", N), col("status", "Status", T), col("updated", "Updated", D)
      ],
      filters: [{ key: "kind", label: "Any relationship" }],
      form: [
        { key: "name", label: "Brand name", type: "text", required: true },
        { key: "kind", label: "Relationship", type: "select", options: ["In house", "Partner", "Consignment"] },
        { key: "products", label: "Products from this brand", type: "number" },
        { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] }
      ]
    },

    collections: {
      title: "Collections", singular: "collection", group: "Catalog",
      lede: "Groupings you merchandise with. Automatic collections fill themselves from a rule.",
      source: "collections", noun: "collections", idKey: "id",
      sort: "name", search: ["name", "rule"], pills: "status",
      columns: [
        col("name", "Collection", { type: "main", sub: "rule" }),
        col("products", "Products", N), col("status", "Status", T), col("updated", "Updated", D)
      ],
      filters: [{ key: "rule", label: "Any type" }],
      form: [
        { key: "name", label: "Collection name", type: "text", required: true },
        { key: "rule", label: "How it fills", type: "select", options: ["Manual", "Automatic"] },
        { key: "products", label: "Products in this collection", type: "number" },
        { key: "status", label: "Status", type: "select", options: ["Active", "Draft", "Hidden"] }
      ]
    },

    uoms: {
      title: "Units of measure", singular: "unit", group: "Catalog",
      lede: "How each product is counted, weighed or measured at checkout and in stock.",
      source: "uoms", noun: "units", idKey: "id",
      sort: "name", search: ["name", "code", "kind"],
      columns: [
        col("name", "Unit", { type: "main", sub: "code" }),
        col("kind", "Measures"), col("factor", "Base factor", N),
        col("status", "Status", T), col("updated", "Updated", D)
      ],
      filters: [{ key: "kind", label: "Any measure" }],
      form: [
        { key: "name", label: "Unit name", type: "text", required: true },
        { key: "code", label: "Short code", type: "text", required: true },
        { key: "kind", label: "Measures", type: "select", options: ["Count", "Weight", "Volume", "Length"] },
        { key: "factor", label: "Base factor", type: "number", required: true },
        { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] }
      ]
    },

    /* ================================================================= INVENTORY */

    stock: {
      idPrefix: "STK",
      title: "Stock", singular: "stock line", group: "Inventory",
      lede: "What is on the shelf right now, minus anything already promised to an order.",
      source: "stock", noun: "lines", idKey: "id",
      sort: "available", dir: "asc", search: ["product", "sku", "warehouse"], pills: "status",
      columns: [
        col("product", "Product", { type: "main", sub: "sku" }),
        col("warehouse", "Warehouse"), col("onHand", "On hand", N),
        col("reserved", "Reserved", N), col("available", "Available", N),
        col("status", "Status", T), col("updated", "Counted", D)
      ],
      filters: [{ key: "warehouse", label: "Any warehouse" }],
      form: [
        { key: "product", label: "Product", type: "select", from: "product", required: true },
        { key: "sku", label: "SKU", type: "text", required: true },
        { key: "warehouse", label: "Warehouse", type: "select", from: "warehouse" },
        { key: "onHand", label: "Units on hand", type: "number", required: true },
        { key: "reserved", label: "Units reserved", type: "number" }
      ]
    },

    "stock-history": {
      idPrefix: "MOV",
      title: "Stock history", singular: "movement", group: "Inventory",
      lede: "Every movement in and out, with the document that caused it.",
      source: "stockHistory", noun: "movements", idKey: "id",
      sort: "at", dir: "desc", search: ["product", "sku", "reference", "user"], pills: "move",
      columns: [
        col("product", "Product", { type: "main", sub: "sku" }),
        col("move", "Movement", T), col("qty", "Change", { type: "delta" }),
        col("balance", "Balance", N), col("reference", "Reference", { type: "note" }),
        col("user", "By"), col("at", "When", { type: "note" })
      ],
      filters: [{ key: "user", label: "Anyone" }],
      form: [
        { key: "product", label: "Product", type: "select", from: "product", required: true },
        { key: "sku", label: "SKU", type: "text", required: true },
        { key: "move", label: "Movement type", type: "select", options: ["Purchase", "Sale", "Return", "Adjustment", "Damage"] },
        { key: "qty", label: "Quantity change", type: "number", required: true },
        { key: "reference", label: "Reference document", type: "text" },
        { key: "user", label: "Logged by", type: "text" }
      ]
    },

    /* ================================================================= CUSTOMERS */

    customers: {
      title: "Customers", singular: "customer", group: "Customers",
      lede: "Who is buying, how often, and how much they spend.",
      source: "customers", noun: "customers", idKey: "id",
      sort: "spent", dir: "desc", search: ["name", "email", "city"], pills: "tier",
      columns: [
        col("name", "Customer", { type: "main", sub: "email" }),
        col("city", "City"), col("orders", "Orders", N), col("spent", "Spent", M),
        col("tier", "Tier", T), col("joined", "Joined", D)
      ],
      filters: [],
      form: [
        { key: "name", label: "Full name", type: "text", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "city", label: "City", type: "text" },
        { key: "orders", label: "Orders placed", type: "number" },
        { key: "spent", label: "Total spent (\u20B9)", type: "number" },
        { key: "tier", label: "Tier", type: "select", options: ["Regular", "Silver", "Gold"] }
      ]
    },

    /* ================================================================= PROMOTIONS */

    offers: {
      title: "Offers", singular: "offer", group: "Promotions",
      lede: "Discounts that apply on their own, without the shopper typing anything.",
      source: "offers", noun: "offers", idKey: "id",
      sort: "status", search: ["name", "detail", "applies"], pills: "status",
      columns: [
        col("name", "Offer", { type: "main", sub: "detail" }),
        col("kind", "Type"), col("applies", "Applies to"), col("used", "Redeemed", N),
        col("status", "Status", T), col("ends", "Ends", D)
      ],
      filters: [{ key: "kind", label: "Any type" }],
      form: [
        { key: "name", label: "Offer name", type: "text", required: true },
        { key: "kind", label: "Discount type", type: "select", options: ["Percentage", "Fixed", "Bundle", "Shipping"] },
        { key: "detail", label: "What the shopper gets", type: "text", required: true },
        { key: "applies", label: "Applies to", type: "select", from: "applies" },
        { key: "starts", label: "Starts", type: "date" },
        { key: "ends", label: "Ends", type: "date" },
        { key: "status", label: "Status", type: "select", options: ["Draft", "Scheduled", "Active", "Expired"] }
      ]
    },

    coupons: {
      idPrefix: "CPN",
      title: "Coupons", singular: "coupon", group: "Promotions",
      lede: "Codes a shopper types at checkout. Caps stop a code running away from you.",
      source: "coupons", noun: "coupons", idKey: "id",
      sort: "code", search: ["code", "value"], pills: "status",
      columns: [
        col("code", "Code", { type: "main", sub: "value" }),
        col("used", "Used", N), col("cap", "Cap", N), col("perCustomer", "Per customer", N),
        col("status", "Status", T), col("expires", "Expires", D)
      ],
      filters: [],
      form: [
        { key: "code", label: "Coupon code", type: "text", required: true },
        { key: "value", label: "Discount", type: "text", required: true },
        { key: "cap", label: "Total uses allowed", type: "number", required: true },
        { key: "perCustomer", label: "Uses per customer", type: "number", required: true },
        { key: "expires", label: "Expires", type: "date" },
        { key: "status", label: "Status", type: "select", options: ["Draft", "Scheduled", "Active", "Expired"] }
      ]
    },

    /* ================================================================= ORDERS */

    orders: {
      idPrefix: "FW",
      title: "Orders", singular: "order", group: "Orders",
      lede: "Every order placed, and what it is waiting on.",
      source: "orders", noun: "orders", idKey: "id",
      sort: "date", dir: "desc", search: ["id", "customer", "email", "city"], pills: "status",
      columns: [
        col("id", "Order", { type: "main", sub: "customer" }),
        col("city", "City"), col("items", "Items", N), col("total", "Total", M),
        col("payment", "Payment"), col("status", "Status", T), col("date", "Placed", D)
      ],
      filters: [{ key: "payment", label: "Any payment method" }],
      form: [
        { key: "customer", label: "Customer name", type: "text", required: true },
        { key: "email", label: "Customer email", type: "email" },
        { key: "city", label: "Delivery city", type: "text" },
        { key: "items", label: "Item count", type: "number", required: true },
        { key: "total", label: "Order total (\u20B9)", type: "number", required: true },
        { key: "payment", label: "Payment method", type: "select", options: ["UPI", "Card", "Net banking", "Cash on delivery"] },
        { key: "status", label: "Status", type: "select", options: ["Paid", "Packed", "Shipped", "Delivered", "Refunded", "Cancelled"] },
        { key: "date", label: "Placed on", type: "date" }
      ]
    },

    /* ================================================================= BILLING */

    invoices: {
      title: "Invoices", singular: "invoice", group: "Billing",
      lede: "One invoice per order, with tax split out for your filings.",
      source: "invoices", noun: "invoices", idKey: "id",
      sort: "issued", dir: "desc", search: ["id", "order", "customer"], pills: "status",
      columns: [
        col("id", "Invoice", { type: "main", sub: "order" }),
        col("customer", "Customer"), col("amount", "Amount", M), col("tax", "Tax", M),
        col("status", "Status", T), col("issued", "Issued", D)
      ],
      filters: [],
      form: [
        { key: "order", label: "Order reference", type: "text", required: true },
        { key: "customer", label: "Customer name", type: "text", required: true },
        { key: "amount", label: "Amount (\u20B9)", type: "number", required: true },
        { key: "tax", label: "Tax (\u20B9)", type: "number" },
        { key: "status", label: "Status", type: "select", options: ["Unpaid", "Paid", "Credited", "Cancelled"] },
        { key: "issued", label: "Issued on", type: "date" }
      ]
    },

    /* ================================================================= PAYMENTS */

    transactions: {
      idPrefix: "TXN",
      title: "Transactions", singular: "transaction", group: "Payments",
      lede: "Money that actually moved, and what the gateway kept.",
      source: "payments", noun: "transactions", idKey: "id",
      sort: "at", dir: "desc", search: ["id", "order", "customer", "gateway"], pills: "status",
      columns: [
        col("id", "Transaction", { type: "main", sub: "order" }),
        col("customer", "Customer"), col("method", "Method"), col("gateway", "Gateway"),
        col("amount", "Amount", M), col("fee", "Fee", M), col("status", "Status", T)
      ],
      filters: [{ key: "method", label: "Any method" }, { key: "gateway", label: "Any gateway" }],
      form: [
        { key: "order", label: "Order reference", type: "text", required: true },
        { key: "customer", label: "Customer name", type: "text", required: true },
        { key: "method", label: "Payment method", type: "select", options: ["UPI", "Card", "Net banking", "Cash on delivery"] },
        { key: "gateway", label: "Gateway", type: "select", options: ["Razorpay", "Stripe", "PhonePe", "Cash"] },
        { key: "amount", label: "Amount (\u20B9)", type: "number", required: true },
        { key: "fee", label: "Gateway fee (\u20B9)", type: "number" },
        { key: "status", label: "Status", type: "select", options: ["Captured", "Refunded", "Failed"] }
      ]
    },

    /* ================================================================= SHIPPING */

    shipments: {
      idPrefix: "SHP",
      title: "Shipments", singular: "shipment", group: "Shipping",
      lede: "Parcels on their way, with the tracking number your customer will ask for.",
      source: "shipments", noun: "shipments", idKey: "id",
      sort: "shipped", dir: "desc", search: ["id", "order", "customer", "awb", "city"], pills: "status",
      columns: [
        col("id", "Shipment", { type: "main", sub: "order" }),
        col("customer", "Customer"), col("city", "Going to"), col("carrier", "Carrier"),
        col("awb", "Tracking", { type: "note" }), col("weight", "Weight"), col("status", "Status", T)
      ],
      filters: [{ key: "carrier", label: "Any carrier" }],
      form: [
        { key: "order", label: "Order reference", type: "text", required: true },
        { key: "customer", label: "Customer name", type: "text", required: true },
        { key: "city", label: "Going to", type: "text" },
        { key: "carrier", label: "Carrier", type: "select", options: ["Delhivery", "Blue Dart", "India Post", "Porter"] },
        { key: "awb", label: "Tracking number", type: "text" },
        { key: "weight", label: "Parcel weight", type: "text" },
        { key: "status", label: "Status", type: "select", options: ["Awaiting pickup", "Ready to hand over", "In transit", "Delivered", "Cancelled"] }
      ]
    },

    /* ================================================================= RETURNS */

    returns: {
      title: "Returns", singular: "return", group: "Returns",
      lede: "Requests to send something back. Approve one and a refund becomes available.",
      source: "returns", noun: "returns", idKey: "id",
      sort: "raised", dir: "desc", search: ["id", "order", "customer", "product", "reason"], pills: "status",
      columns: [
        col("id", "Return", { type: "main", sub: "order" }),
        col("customer", "Customer"), col("product", "Product"),
        col("reason", "Reason", { type: "note" }), col("qty", "Qty", N),
        col("amount", "Value", M), col("status", "Status", T)
      ],
      filters: [{ key: "reason", label: "Any reason" }],
      form: [
        { key: "order", label: "Order reference", type: "text", required: true },
        { key: "customer", label: "Customer name", type: "text", required: true },
        { key: "product", label: "Product", type: "select", from: "product" },
        { key: "reason", label: "Reason", type: "select", options: ["Damaged in transit", "Wrong item sent", "Changed mind", "Size not right", "Late delivery"] },
        { key: "qty", label: "Quantity", type: "number", required: true },
        { key: "amount", label: "Value (\u20B9)", type: "number", required: true },
        { key: "status", label: "Status", type: "select", options: ["Requested", "Approved", "Picked up", "Completed", "Rejected"] }
      ]
    },

    refunds: {
      idPrefix: "RFD",
      title: "Refunds", singular: "refund", group: "Returns",
      lede: "Money sent back, and where it landed.",
      source: "refunds", noun: "refunds", idKey: "id",
      sort: "issued", dir: "desc", search: ["id", "ret", "order", "customer"], pills: "status",
      columns: [
        col("id", "Refund", { type: "main", sub: "ret" }),
        col("order", "Order"), col("customer", "Customer"), col("amount", "Amount", M),
        col("method", "Sent to"), col("status", "Status", T), col("issued", "Issued", D)
      ],
      filters: [{ key: "method", label: "Any destination" }],
      form: [
        { key: "ret", label: "Return reference", type: "text", required: true },
        { key: "order", label: "Order reference", type: "text", required: true },
        { key: "customer", label: "Customer name", type: "text", required: true },
        { key: "amount", label: "Amount (\u20B9)", type: "number", required: true },
        { key: "method", label: "Sent to", type: "select", options: ["UPI", "Card", "Store credit", "Bank transfer"] },
        { key: "status", label: "Status", type: "select", options: ["Processing", "Completed", "Failed"] },
        { key: "issued", label: "Issued on", type: "date" }
      ]
    },

    /* ================================================================= REVIEWS */

    reviews: {
      title: "Reviews", singular: "review", group: "Reviews",
      lede: "Publish, hold or hide what shoppers write about your products.",
      source: "reviews", noun: "reviews", idKey: "id",
      sort: "at", dir: "desc", search: ["product", "customer", "body"], pills: "status",
      columns: [
        col("product", "Product", { type: "main", sub: "customer" }),
        col("rating", "Rating", { type: "stars" }), col("title", "Review", { type: "note" }),
        col("status", "Status", T), col("at", "Left", D)
      ],
      filters: [{ key: "rating", label: "Any rating" }],
      form: [
        { key: "product", label: "Product", type: "select", from: "product", required: true },
        { key: "customer", label: "Customer name", type: "text", required: true },
        { key: "rating", label: "Rating", type: "select", options: ["1", "2", "3", "4", "5"] },
        { key: "title", label: "Headline", type: "text" },
        { key: "body", label: "Review text", type: "textarea", wide: true },
        { key: "status", label: "Status", type: "select", options: ["Pending", "Published", "Hidden"] }
      ]
    },

    /* ================================================================= ENQUIRIES */

    enquiries: {
      title: "Enquiries", singular: "enquiry", group: "Enquiries",
      lede: "Questions from the contact form. Assign one to yourself before replying.",
      source: "enquiries", noun: "enquiries", idKey: "id",
      sort: "at", dir: "desc", search: ["name", "email", "topic", "message"], pills: "status",
      columns: [
        col("name", "From", { type: "main", sub: "email" }),
        col("topic", "Topic"), col("message", "Message", { type: "note" }),
        col("owner", "Owner"), col("status", "Status", T), col("at", "Received", { type: "note" })
      ],
      filters: [{ key: "topic", label: "Any topic" }, { key: "owner", label: "Anyone" }],
      form: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "phone", label: "Phone", type: "tel" },
        { key: "topic", label: "Topic", type: "select", options: ["Bulk order", "Product question", "Delivery delay", "Wholesale", "Custom engraving", "Gift wrapping"] },
        { key: "message", label: "Message", type: "textarea", wide: true },
        { key: "owner", label: "Owner", type: "select", options: ["Unassigned", "Rhea Menon", "Dev Patel"] },
        { key: "status", label: "Status", type: "select", options: ["New", "Open", "Answered", "Closed"] }
      ]
    },

    /* ================================================================= ADMINISTRATION */

    users: {
      idPrefix: "USR",
      title: "Users", singular: "user", group: "Administration",
      lede: "People who can sign in here. A role decides what each of them can reach.",
      source: "users", noun: "users", idKey: "id",
      sort: "name", search: ["name", "email", "role"], pills: "status",
      columns: [
        col("name", "User", { type: "main", sub: "email" }),
        col("role", "Role"), col("status", "Status", T),
        col("lastSeen", "Last seen", { type: "note" }), col("added", "Added", D)
      ],
      filters: [{ key: "role", label: "Any role" }],
      form: [
        { key: "name", label: "Full name", type: "text", required: true },
        { key: "email", label: "Work email", type: "email", required: true },
        { key: "role", label: "Role", type: "select", from: "role" },
        { key: "status", label: "Status", type: "select", options: ["Invited", "Active", "Suspended"] }
      ]
    },

    roles: {
      title: "Roles", singular: "role", group: "Administration",
      lede: "Bundles of permissions. Change a role and everyone holding it changes with it.",
      source: "roles", noun: "roles", idKey: "id",
      sort: "name", search: ["name", "scope"], pills: "status",
      columns: [
        col("name", "Role", { type: "main", sub: "scope" }),
        col("users", "Users", N), col("permissions", "Permissions", N),
        col("status", "Status", T), col("updated", "Updated", D)
      ],
      filters: [],
      form: [
        { key: "name", label: "Role name", type: "text", required: true },
        { key: "scope", label: "What it covers", type: "text", required: true },
        { key: "users", label: "Users holding this role", type: "number" },
        { key: "permissions", label: "Permissions attached", type: "number" },
        { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] }
      ]
    },

    permissions: {
      idPrefix: "PRM",
      title: "Permissions", singular: "permission", group: "Administration",
      lede: "The smallest units of access. Attach them to roles rather than to people.",
      source: "permissions", noun: "permissions", idKey: "id",
      sort: "group", search: ["name", "key", "group"], pills: "group",
      columns: [
        col("name", "Permission", { type: "main", sub: "key" }),
        col("group", "Area"), col("roles", "Held by roles", N), col("status", "Status", T)
      ],
      filters: [],
      form: [
        { key: "name", label: "Permission name", type: "text", required: true },
        { key: "key", label: "Key", type: "text", required: true },
        { key: "group", label: "Area", type: "select", options: ["Catalog", "Inventory", "Orders", "Money", "Admin"] },
        { key: "roles", label: "Held by this many roles", type: "number" },
        { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] }
      ]
    },

    "login-history": {
      title: "Login history", singular: "sign-in", group: "Administration",
      lede: "Every sign-in attempt. A run of failures from one address is worth a look.",
      source: "loginHistory", noun: "attempts", idKey: "id",
      sort: "at", dir: "desc", search: ["user", "email", "ip", "city"], pills: "status",
      columns: [
        col("user", "User", { type: "main", sub: "email" }),
        col("ip", "IP address", { type: "note" }), col("device", "Device"),
        col("city", "City"), col("status", "Result", T), col("at", "When", { type: "note" })
      ],
      filters: [{ key: "device", label: "Any device" }],
      form: [
        { key: "user", label: "User", type: "select", from: "user", required: true },
        { key: "email", label: "Email", type: "email" },
        { key: "ip", label: "IP address", type: "text" },
        { key: "device", label: "Device", type: "select", options: ["Chrome on Windows", "Safari on iPhone", "Chrome on Android", "Firefox on Linux"] },
        { key: "city", label: "City", type: "text" },
        { key: "status", label: "Result", type: "select", options: ["Success", "Failed"] }
      ]
    },

    /* ================================================================= LOGS */

    "info-logs": {
      title: "Info logs", singular: "log entry", group: "Logs",
      lede: "Who changed what. Kept for twelve months, then rolled off.",
      source: "auditLogs", noun: "entries", idKey: "id",
      sort: "at", dir: "desc", search: ["user", "action", "entity", "record", "detail"], pills: "action",
      columns: [
        col("user", "Who", { type: "main", sub: "ip" }),
        col("action", "Action", T), col("entity", "Type"),
        col("record", "Record", { type: "note" }), col("at", "When", { type: "note" })
      ],
      filters: [{ key: "entity", label: "Any record type" }],
      form: [
        { key: "user", label: "User", type: "text", required: true },
        { key: "action", label: "Action", type: "select", options: ["Created", "Updated", "Deleted", "Exported", "Signed in"] },
        { key: "entity", label: "Record type", type: "select", options: ["Product", "Order", "Coupon", "User", "Category", "Refund"] },
        { key: "record", label: "Record reference", type: "text" },
        { key: "detail", label: "Detail", type: "textarea", wide: true },
        { key: "ip", label: "IP address", type: "text" }
      ]
    },

    "error-logs": {
      title: "Error logs", singular: "error", group: "Logs",
      lede: "What broke, how often, and which part of the store it came from.",
      source: "errorLogs", noun: "errors", idKey: "id",
      sort: "at", dir: "desc", search: ["title", "detail", "source"], pills: "level",
      columns: [
        col("title", "Error", { type: "main", sub: "detail" }),
        col("source", "Area"), col("level", "Level", T),
        col("count", "Times", N), col("at", "Last seen", { type: "note" })
      ],
      filters: [{ key: "source", label: "Any area" }],
      form: [
        { key: "title", label: "Error title", type: "text", required: true },
        { key: "detail", label: "Detail", type: "textarea", wide: true },
        { key: "source", label: "Area", type: "select", options: ["Checkout", "Catalogue", "Inventory", "Billing", "Email"] },
        { key: "level", label: "Level", type: "select", options: ["Notice", "Warning", "Critical"] },
        { key: "count", label: "Times seen", type: "number" }
      ]
    }
  };
})();
