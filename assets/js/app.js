/* Fernwood Admin — application script (jQuery + Bootstrap 5 + Chart.js) */

window.Store = (function ($) {
  "use strict";

  /* ------------------------------------------------------------ helpers */

  var safe = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  };

  function money(n) { return "\u20B9" + Number(n || 0).toLocaleString("en-IN"); }

  function shortDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) { return iso; }
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  function initials(name) {
    return String(name).split(" ").filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  function esc(s) {
    return String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function qs(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  }

  function stockTag(stock) {
    var n = Number(stock);
    if (n === 0) { return '<span class="tag tag-red">Sold out</span>'; }
    if (n <= 5) { return '<span class="tag tag-amber">' + n + ' left</span>'; }
    return '<span class="tag tag-green">' + n + ' in stock</span>';
  }

  var STATUS_TAG = {
    "Paid": "tag-blue", "Packed": "tag-amber", "Shipped": "tag-amber",
    "Delivered": "tag-green", "Refunded": "tag-red", "Cancelled": "tag-grey"
  };

  function statusTag(s) { return '<span class="tag ' + (STATUS_TAG[s] || "tag-grey") + '">' + esc(s) + "</span>"; }

  function notify(message, tone) {
    var icon = tone === "warn" ? "bi-exclamation-triangle" : "bi-check-circle";
    var $t = $(
      '<div class="toast align-items-center border" role="alert" aria-live="polite" aria-atomic="true">' +
      '<div class="d-flex"><div class="toast-body"><i class="bi ' + icon + ' me-2"></i>' + esc(message) + "</div>" +
      '<button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>'
    );
    $("#toastArea").append($t);
    var t = new bootstrap.Toast($t[0], { delay: 3200 });
    $t.on("hidden.bs.toast", function () { $t.remove(); });
    t.show();
  }

  function confirmDialog(title, body, onYes) {
    var $m = $("#confirmModal");
    if (!$m.length) { if (onYes) { onYes(); } return; }
    $m.find("#confirmTitle").text(title);
    $m.find("#confirmBody").text(body);
    var modal = bootstrap.Modal.getOrCreateInstance($m[0]);
    $m.find("#confirmYes").off("click").on("click", function () {
      modal.hide();
      if (onYes) { onYes(); }
    });
    modal.show();
  }

  /* ------------------------------------------------------------ persistence
     Mock data ships in data.js / data-more.js. The first edit on any entity
     copies its array into localStorage; after that, reads and writes go
     through here, so create / edit / delete survive a page reload or a
     click through to another screen. "Reset demo data" (in Settings) clears
     the cache and reverts every module to the original mock data. */

  var LS_PREFIX = "fw.records.";

  function records(sourceKey) {
    var raw = safe.get(LS_PREFIX + sourceKey, null);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* fall through to seed data */ }
    }
    return (window.DB[sourceKey] || []).slice();
  }

  function saveRecords(sourceKey, arr) {
    return safe.set(LS_PREFIX + sourceKey, JSON.stringify(arr));
  }

  function removeRecord(sourceKey, idKey, id) {
    var arr = records(sourceKey).filter(function (r) { return String(r[idKey]) !== String(id); });
    saveRecords(sourceKey, arr);
    return arr;
  }

  function nextId(cfg, arr) {
    var prefix = cfg.idPrefix || cfg.source.slice(0, 3).toUpperCase();
    var idKey = cfg.idKey || "id";
    var max = 0;
    arr.forEach(function (r) {
      var m = String(r[idKey]).match(/(\d+)\s*$/);
      if (m) { max = Math.max(max, parseInt(m[1], 10)); }
    });
    return prefix + "-" + (max + 1);
  }

  function resetAllData() {
    var toRemove = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(LS_PREFIX) === 0) { toRemove.push(k); }
    }
    toRemove.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
  }

  /* ------------------------------------------------------------ shell */

  function initShell() {
    var theme = safe.get("fw.theme", "light");
    applyTheme(theme);

    $("#themeToggle").on("click", function () {
      var next = $("html").attr("data-bs-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      safe.set("fw.theme", next);
      redrawCharts();
    });

    if (safe.get("fw.nav", "open") === "closed" && window.innerWidth > 991) {
      $("body").addClass("nav-collapsed");
    }

    $("#sidebarToggle").on("click", function () {
      if (window.innerWidth <= 991) {
        $("body").toggleClass("nav-open");
        $("#sidebarScrim").prop("hidden", !$("body").hasClass("nav-open"));
      } else {
        $("body").toggleClass("nav-collapsed");
        safe.set("fw.nav", $("body").hasClass("nav-collapsed") ? "closed" : "open");
      }
    });

    $("#sidebarScrim").on("click", function () {
      $("body").removeClass("nav-open");
      $(this).prop("hidden", true);
    });

    $(document).on("keydown", function (e) {
      if (e.key === "/" && !$(e.target).is("input, textarea, select")) {
        e.preventDefault();
        $("#globalSearch").trigger("focus");
      }
    });

    $("#globalSearch").on("input", function () {
      var q = $(this).val();
      var target = $("#listSearch").first();
      if (target.length) { target.val(q).trigger("input"); }
    });
  }

  function applyTheme(t) {
    $("html").attr("data-bs-theme", t);
    $("#themeToggle i").attr("class", t === "dark" ? "bi bi-sun" : "bi bi-moon-stars");
  }

  function ink() {
    return $("html").attr("data-bs-theme") === "dark"
      ? { grid: "#263330", text: "#93A5A0", brand: "#4CA98F", amber: "#E3B462", surface: "#151F1C" }
      : { grid: "#E3E7E5", text: "#6B7A76", brand: "#1F6F5C", amber: "#D9A441", surface: "#FFFFFF" };
  }

  var charts = [];
  function redrawCharts() {
    charts.forEach(function (c) { c.destroy(); });
    charts = [];
    if ($("#revenueChart").length) { buildDashboardCharts(); }
  }

  /* ------------------------------------------------------------ sparklines */

  function initSparks() {
    $("[data-spark]").each(function () {
      var vals = $(this).data("spark").toString().split(",").map(Number);
      var max = Math.max.apply(null, vals);
      var html = vals.map(function (v) {
        return '<span style="height:' + Math.max(8, Math.round((v / max) * 100)) + '%"></span>';
      }).join("");
      $(this).html(html);
    });
  }

  /* ------------------------------------------------------------ data grid
     Reusable table engine: search, sort, categorical filters, pagination
     and page size. Every list page (25 of them) builds one of these. */

  function DataGrid(cfg) {
    var self = this;
    this.cfg = cfg;
    this.data = cfg.data || [];
    this.page = 1;
    this.per = cfg.perPage || 10;
    this.sort = cfg.sort || null;
    this.dir = cfg.dir || "asc";
    this.query = "";
    this.filters = {};

    this.$table = $(cfg.table);
    this.$body = this.$table.find("tbody");
    this.$pager = $(cfg.pager);
    this.$count = $(cfg.count);

    this.$table.find("thead th[data-sort]").on("click", function () {
      var key = $(this).data("sort");
      if (self.sort === key) { self.dir = self.dir === "asc" ? "desc" : "asc"; }
      else { self.sort = key; self.dir = "asc"; }
      self.page = 1;
      self.render();
    });

    this.$pager.on("click", "a[data-page]", function (e) {
      e.preventDefault();
      self.page = Number($(this).data("page"));
      self.render();
      $("html, body").animate({ scrollTop: self.$table.offset().top - 90 }, 180);
    });
  }

  DataGrid.prototype.rows = function () {
    var self = this;
    var out = this.data.filter(function (row) {
      var ok = true;
      Object.keys(self.filters).forEach(function (k) {
        var f = self.filters[k];
        if (f !== null && f !== undefined && f !== "") { ok = ok && self.cfg.filterFns[k](row, f); }
      });
      if (!ok) { return false; }
      if (!self.query) { return true; }
      var q = self.query.toLowerCase();
      return (self.cfg.searchKeys || []).some(function (k) {
        return String(row[k] || "").toLowerCase().indexOf(q) > -1;
      });
    });

    if (this.sort) {
      var key = this.sort, dir = this.dir === "asc" ? 1 : -1;
      out.sort(function (a, b) {
        var x = a[key], y = b[key];
        if (typeof x === "number" && typeof y === "number") { return (x - y) * dir; }
        return String(x).localeCompare(String(y), undefined, { numeric: true }) * dir;
      });
    }
    return out;
  };

  DataGrid.prototype.render = function () {
    var rows = this.rows();
    var pages = Math.max(1, Math.ceil(rows.length / this.per));
    if (this.page > pages) { this.page = pages; }
    var start = (this.page - 1) * this.per;
    var slice = rows.slice(start, start + this.per);
    var cols = this.cfg.columns;
    var idKey = this.cfg.idKey || "id";

    if (!slice.length) {
      this.$body.html(
        '<tr><td colspan="' + cols.length + '"><div class="empty"><i class="bi bi-inbox"></i>' +
        "<strong>" + esc(this.cfg.emptyTitle || "Nothing here yet") + "</strong>" +
        esc(this.cfg.emptyNote || "Change the filters or search for something else.") + "</div></td></tr>"
      );
    } else {
      this.$body.html(slice.map(function (row) {
        return '<tr data-id="' + esc(row[idKey]) + '">' +
          cols.map(function (c) {
            return "<td" + (c.cls ? ' class="' + c.cls + '"' : "") + ">" + c.render(row) + "</td>";
          }).join("") + "</tr>";
      }).join(""));
    }

    this.$table.find("thead th[data-sort]").removeClass("asc desc")
      .filter('[data-sort="' + this.sort + '"]').addClass(this.dir);

    if (this.$count.length) {
      this.$count.text(rows.length
        ? "Showing " + (start + 1) + "\u2013" + Math.min(start + this.per, rows.length) + " of " + rows.length + " " + (this.cfg.noun || "rows")
        : "No " + (this.cfg.noun || "rows") + " match your filters");
    }
    this.renderPager(pages);
  };

  DataGrid.prototype.renderPager = function (pages) {
    if (!this.$pager.length) { return; }
    if (pages < 2) { this.$pager.empty(); return; }
    var p = this.page, html = "";
    html += '<li class="page-item' + (p === 1 ? " disabled" : "") + '"><a class="page-link" href="#" data-page="' + (p - 1) + '" aria-label="Previous page"><i class="bi bi-chevron-left"></i></a></li>';
    var from = Math.max(1, p - 2), to = Math.min(pages, from + 4);
    from = Math.max(1, to - 4);
    if (from > 1) { html += '<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>'; }
    if (from > 2) { html += '<li class="page-item disabled"><span class="page-link">&hellip;</span></li>'; }
    for (var i = from; i <= to; i++) {
      html += '<li class="page-item' + (i === p ? " active" : "") + '"><a class="page-link" href="#" data-page="' + i + '">' + i + "</a></li>";
    }
    if (to < pages - 1) { html += '<li class="page-item disabled"><span class="page-link">&hellip;</span></li>'; }
    if (to < pages) { html += '<li class="page-item"><a class="page-link" href="#" data-page="' + pages + '">' + pages + "</a></li>"; }
    html += '<li class="page-item' + (p === pages ? " disabled" : "") + '"><a class="page-link" href="#" data-page="' + (p + 1) + '" aria-label="Next page"><i class="bi bi-chevron-right"></i></a></li>';
    this.$pager.html(html);
  };

  DataGrid.prototype.setQuery = function (q) { this.query = q; this.page = 1; this.render(); };
  DataGrid.prototype.setFilter = function (k, v) { this.filters[k] = v; this.page = 1; this.render(); };
  DataGrid.prototype.setPer = function (n) { this.per = Number(n); this.page = 1; this.render(); };
  DataGrid.prototype.setData = function (d) { this.data = d; this.render(); };

  /* ------------------------------------------------------------ dashboard */

  function renderLatestOrders(sel, limit) {
    var rows = records("orders").slice()
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; })
      .slice(0, limit)
      .map(function (o) {
        return "<tr>" +
          '<td><span class="cell-name">' + esc(o.id) + "</span></td>" +
          '<td><div class="cell-main"><span class="thumb">' + initials(o.customer) + "</span>" +
          '<div><div class="cell-name">' + esc(o.customer) + '</div><div class="cell-note">' + esc(o.city) + "</div></div></div></td>" +
          '<td class="num">' + money(o.total) + "</td>" +
          "<td>" + statusTag(o.status) + "</td>" +
          '<td class="cell-note">' + shortDate(o.date) + "</td>" +
          "</tr>";
      }).join("");
    $(sel).html(rows || '<tr><td colspan="5"><div class="empty"><i class="bi bi-inbox"></i><strong>No orders yet</strong>Create one from the Orders module.</div></td></tr>');
  }

  function renderStorePerformance(sel) {
    var orders = records("orders");
    var customers = records("customers");
    var delivered = orders.filter(function (o) { return o.status === "Delivered"; }).length;
    var refunded = orders.filter(function (o) { return o.status === "Refunded"; }).length;
    var aov = orders.length ? Math.round(orders.reduce(function (s, o) { return s + Number(o.total || 0); }, 0) / orders.length) : 0;
    var repeat = customers.filter(function (c) { return Number(c.orders) > 1; }).length;
    var repeatRate = customers.length ? Math.round((repeat / customers.length) * 100) : 0;
    var refundRate = orders.length ? Math.round((refunded / orders.length) * 100) : 0;

    var rows = [
      { label: "Average order value", value: money(aov), note: "across " + orders.length + " orders" },
      { label: "Repeat customer rate", value: repeatRate + "%", note: "ordered more than once" },
      { label: "Orders delivered", value: delivered + " of " + orders.length, note: "fulfilled so far" },
      { label: "Refund rate", value: refundRate + "%", note: "of all orders placed" }
    ];
    $(sel).html(rows.map(function (r) {
      return '<li><span class="grow"><span class="name d-block">' + esc(r.label) + '</span><span class="sku">' + esc(r.note) + "</span></span>" +
        '<span class="perf-value">' + esc(r.value) + "</span></li>";
    }).join(""));
  }

  function buildDashboardCharts() {
    if (typeof Chart === "undefined") { return; }
    var c = ink();
    Chart.defaults.font.family = "Inter, system-ui, sans-serif";
    Chart.defaults.color = c.text;

    var rev = document.getElementById("revenueChart");
    if (rev) {
      charts.push(new Chart(rev, {
        data: {
          labels: DB.series.days,
          datasets: [
            {
              type: "line", label: "Revenue", data: DB.series.revenue,
              borderColor: c.brand, backgroundColor: "rgba(31,111,92,.10)",
              borderWidth: 2, fill: true, tension: .35, pointRadius: 0, pointHoverRadius: 4, yAxisID: "y"
            },
            {
              type: "bar", label: "Orders", data: DB.series.orders,
              backgroundColor: c.amber, borderRadius: 3, barThickness: 6, yAxisID: "y1"
            }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: c.surface, titleColor: c.text, bodyColor: c.text,
              borderColor: c.grid, borderWidth: 1, padding: 10, displayColors: true,
              callbacks: {
                label: function (ctx) {
                  return ctx.dataset.label === "Revenue"
                    ? "Revenue " + money(ctx.parsed.y)
                    : "Orders " + ctx.parsed.y;
                }
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
            y: { border: { display: false }, grid: { color: c.grid }, ticks: { callback: function (v) { return "\u20B9" + v / 1000 + "k"; } } },
            y1: { position: "right", border: { display: false }, grid: { display: false }, ticks: { maxTicksLimit: 5 } }
          }
        }
      }));
    }

    var os = document.getElementById("statusChart");
    if (os) {
      var orders = records("orders");
      var counts = {};
      orders.forEach(function (o) { counts[o.status] = (counts[o.status] || 0) + 1; });
      var labels = Object.keys(counts);
      var palette = { Paid: "#35688F", Packed: c.amber, Shipped: c.amber, Delivered: c.brand, Refunded: "#B4453A", Cancelled: "#8A97A0" };
      charts.push(new Chart(os, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [{
            data: labels.map(function (l) { return counts[l]; }),
            backgroundColor: labels.map(function (l) { return palette[l] || c.brand; }),
            borderColor: c.surface, borderWidth: 3, hoverOffset: 6
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "62%",
          plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", padding: 16, boxWidth: 8 } },
            tooltip: {
              backgroundColor: c.surface, titleColor: c.text, bodyColor: c.text,
              borderColor: c.grid, borderWidth: 1, padding: 10,
              callbacks: { label: function (ctx) { return ctx.label + " \u2014 " + ctx.parsed + " orders"; } }
            }
          }
        }
      }));
    }
  }

  /* ------------------------------------------------------------ shared cell rendering */

  var TONE = {
    green: ["Active", "Published", "Paid", "Captured", "Delivered", "Completed", "Healthy", "Success", "Approved", "Answered", "Purchase", "Created", "Yes"],
    amber: ["Pending", "Draft", "Scheduled", "Low", "Processing", "In transit", "Ready to hand over", "Awaiting pickup", "Packed", "Shipped", "Open", "Requested", "Picked up", "Invited", "Warning", "Adjustment", "Unpaid", "Return"],
    red: ["Failed", "Error", "Critical", "Sold out", "Rejected", "Cancelled", "Suspended", "Refunded", "Damage", "Deleted", "No"],
    blue: ["New", "Info", "Notice", "Credited", "Sale", "Updated"],
    grey: ["Hidden", "Inactive", "Closed", "Expired", "Used up", "Exported", "Signed in"]
  };

  function tagFor(v) {
    var s = String(v), tone = "grey";
    Object.keys(TONE).forEach(function (k) { if (TONE[k].indexOf(s) > -1) { tone = k; } });
    return '<span class="tag tag-' + tone + '">' + esc(s) + "</span>";
  }

  function stars(n) {
    var out = "";
    for (var i = 1; i <= 5; i++) {
      out += '<i class="bi bi-star' + (i <= n ? "-fill" : "") + '" style="color:' + (i <= n ? "var(--amber)" : "var(--line)") + '"></i>';
    }
    return '<span style="letter-spacing:1px">' + out + "</span>";
  }

  function cellFor(c, row) {
    var v = row[c.key];
    switch (c.type) {
      case "main":
        return '<div class="cell-main"><span class="thumb">' + initials(String(v)) + "</span><div>" +
          '<div class="cell-name">' + esc(v) + "</div>" +
          (c.sub ? '<div class="cell-note">' + esc(row[c.sub]) + "</div>" : "") + "</div></div>";
      case "money": return money(v);
      case "num": return Number(v || 0).toLocaleString("en-IN");
      case "date": return '<span class="cell-note">' + shortDate(v) + "</span>";
      case "note": return '<span class="cell-note">' + esc(String(v == null ? "" : v).slice(0, 52)) + "</span>";
      case "tag": return tagFor(typeof v === "boolean" ? (v ? "Yes" : "No") : v);
      case "stock": return stockTag(v);
      case "stars": return stars(v);
      case "delta":
        return '<span style="color:' + (v >= 0 ? "var(--pos)" : "var(--neg)") + '">' + (v >= 0 ? "+" : "") + v + "</span>";
      default: return esc(v === undefined ? "\u2014" : v);
    }
  }

  function alignFor(c) {
    return ["num", "money", "delta"].indexOf(c.type) > -1 ? "text-end num" : "";
  }

  function distinct(data, key) {
    return data.map(function (r) { return r[key]; })
      .filter(function (v, i, a) { return v !== undefined && v !== "" && a.indexOf(v) === i; })
      .sort();
  }

  /* ------------------------------------------------------------ generic list page
     Drives every "<entity>.html" grid: search, sort, status filtering,
     pagination, page size, record count, Create button, Edit action and
     Delete action with confirmation. Configuration lives in pages.js. */

  function initList(key) {
    var cfg = window.PAGES[key];
    if (!cfg) { return; }
    var idKey = cfg.idKey || "id";
    var data = records(cfg.source);

    document.title = cfg.title + " \u00B7 Fernwood Admin";
    $("#pageModule").text(cfg.group);
    $("#pageTitle").text(cfg.title);
    $("#pageLede").text(cfg.lede);
    $("#newBtn").attr("href", key + "-form.html?id=0")
      .html('<i class="bi bi-plus-lg me-1"></i>New ' + esc(cfg.singular));

    $("#listTable thead tr").html(
      cfg.columns.map(function (c) {
        return '<th data-sort="' + c.key + '" class="' + alignFor(c) + '">' + esc(c.label) + "</th>";
      }).join("") + '<th class="text-end">Actions</th>'
    );

    var filterFns = {};
    (cfg.filters || []).forEach(function (f) {
      filterFns[f.key] = function (r, v) { return String(r[f.key]) === v; };
    });
    if (cfg.pills) { filterFns.__pill = function (r, v) { return String(r[cfg.pills]) === v; }; }

    var gridColumns = cfg.columns.map(function (c) {
      return { cls: alignFor(c), render: function (row) { return cellFor(c, row); } };
    });
    gridColumns.push({
      cls: "text-end actions-cell",
      render: function (row) {
        var id = esc(row[idKey]);
        return '<a class="btn btn-sm btn-outline-secondary" href="' + key + '-form.html?id=' + encodeURIComponent(row[idKey]) +
          '" aria-label="Edit this ' + esc(cfg.singular) + '"><i class="bi bi-pencil"></i></a> ' +
          '<button class="btn btn-sm btn-outline-secondary text-danger" type="button" data-delete="' + id +
          '" aria-label="Delete this ' + esc(cfg.singular) + '"><i class="bi bi-trash3"></i></button>';
      }
    });

    var grid = new DataGrid({
      table: "#listTable", pager: "#listPager", count: "#listCount",
      data: data, perPage: 12, sort: cfg.sort, dir: cfg.dir || "asc", noun: cfg.noun,
      idKey: idKey,
      searchKeys: cfg.search || [],
      emptyTitle: "Nothing matches",
      emptyNote: "Clear the search or choose different filters.",
      filterFns: filterFns,
      columns: gridColumns
    });
    grid.render();

    $("#filterSlots").html((cfg.filters || []).map(function (f) {
      return '<select class="form-select" data-filter="' + f.key + '" aria-label="' + esc(f.label) + '">' +
        '<option value="">' + esc(f.label) + "</option>" +
        distinct(data, f.key).map(function (v) { return "<option>" + esc(v) + "</option>"; }).join("") +
        "</select>";
    }).join(""));
    $("#filterSlots").on("change", "select", function () {
      grid.setFilter($(this).data("filter"), $(this).val());
    });

    if (cfg.pills) {
      var values = distinct(data, cfg.pills);
      $("#statusPills").html(
        '<button type="button" class="pill active" data-value="">All<b>' + data.length + "</b></button>" +
        values.map(function (v) {
          var n = data.filter(function (r) { return r[cfg.pills] === v; }).length;
          return '<button type="button" class="pill" data-value="' + esc(v) + '">' + esc(v) + "<b>" + n + "</b></button>";
        }).join("")
      ).on("click", ".pill", function () {
        $("#statusPills .pill").removeClass("active");
        $(this).addClass("active");
        grid.setFilter("__pill", $(this).data("value"));
      });
    }

    $("#listSearch").on("input", function () { grid.setQuery($(this).val()); });
    $("#listPer").on("change", function () { grid.setPer($(this).val()); });

    $("#listTable").on("click", "[data-delete]", function () {
      var id = $(this).data("delete");
      confirmDialog(
        "Delete this " + cfg.singular + "?",
        "This removes it from your mock data. It cannot be undone.",
        function () {
          data = removeRecord(cfg.source, idKey, id);
          grid.setData(data);
          notify(cfg.singular.charAt(0).toUpperCase() + cfg.singular.slice(1) + " deleted.");
        }
      );
    });

    $("#exportBtn").on("click", function () {
      var head = cfg.columns.map(function (c) { return c.label; });
      var rows = [head].concat(grid.rows().map(function (r) {
        return cfg.columns.map(function (c) { return r[c.key]; });
      }));
      var csv = rows.map(function (r) {
        return r.map(function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }).join(",");
      }).join("\n");
      var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      var a = document.createElement("a");
      a.href = url; a.download = "fernwood-" + key + ".csv"; a.click();
      URL.revokeObjectURL(url);
      notify("Exported " + (rows.length - 1) + " " + cfg.noun + ".");
    });
  }

  /* ------------------------------------------------------------ generic create / edit form
     Drives every "<entity>-form.html". Id 0 (or missing) creates a new
     record; any other Id loads and edits that record. Field list comes
     from pages.js so one template covers all 25 modules. */

  function fieldHtml(f, row, sourceRows) {
    var val = row ? row[f.key] : (f.default !== undefined ? f.default : "");
    if (val === undefined || val === null) { val = ""; }
    var req = f.required ? " required" : "";

    if (f.type === "toggle") {
      var checked = row ? !!val : true;
      return '<div class="col-md-6"><div class="toggle-field"><div class="form-check form-switch">' +
        '<input class="form-check-input" type="checkbox" role="switch" id="f_' + f.key + '"' + (checked ? " checked" : "") + ">" +
        '<label class="form-check-label" for="f_' + f.key + '">' + esc(f.label) + "</label></div></div></div>";
    }

    var wide = (f.wide || f.type === "textarea") ? "col-12" : "col-md-6";
    var input;
    if (f.type === "select") {
      var opts = f.options || distinct(sourceRows, f.from || f.key);
      input = '<select class="form-select" id="f_' + f.key + '"' + req + ">" +
        opts.map(function (o) {
          return "<option" + (String(o) === String(val) ? " selected" : "") + ">" + esc(o) + "</option>";
        }).join("") + "</select>";
    } else if (f.type === "textarea") {
      input = '<textarea class="form-control" id="f_' + f.key + '" rows="4"' + req + ">" + esc(val) + "</textarea>";
    } else {
      input = '<input type="' + f.type + '" class="form-control" id="f_' + f.key + '" value="' + esc(val) + '"' + req + ">";
    }
    return '<div class="' + wide + '"><label class="form-label" for="f_' + f.key + '">' + esc(f.label) + "</label>" +
      input + '<div class="invalid-feedback">Fill this in before saving.</div></div>';
  }

  function initForm(key) {
    var cfg = window.PAGES[key];
    if (!cfg || !cfg.form) { return; }
    var idKey = cfg.idKey || "id";
    var data = records(cfg.source);
    var idParam = qs("id");
    var isNew = !idParam || idParam === "0";
    var row = isNew ? null : data.filter(function (r) { return String(r[idKey]) === String(idParam); })[0];
    var notFound = !isNew && !row;

    document.title = (isNew ? "New " : "Edit ") + cfg.title.replace(/s$/, "") + " \u00B7 Fernwood Admin";
    $("#formModule").text(cfg.group);
    $("#listLink").attr("href", key + ".html").text(cfg.title);
    $("#formTitle").text(isNew ? "New " + cfg.singular : "Edit " + cfg.singular);
    $("#formLede").text(isNew
      ? "This adds a new record to your mock data, stored in this browser."
      : "Changes save to this browser's storage, not to a live server.");

    if (notFound) {
      $("#recordBadge").addClass("d-none");
      $("#formActions").addClass("d-none");
      $("#recordFields").html(
        '<div class="col-12"><div class="empty"><i class="bi bi-search"></i><strong>No ' + esc(cfg.singular) + " found</strong>" +
        "It may already have been deleted. <a href=\"" + key + '.html">Back to ' + esc(cfg.title.toLowerCase()) + "</a></div></div>"
      );
      return;
    }

    $("#recordBadge").toggleClass("d-none", isNew).text(row ? "ID " + row[idKey] : "");
    $("#deleteBtn").toggleClass("d-none", isNew);
    $("#recordFields").html(cfg.form.map(function (f) { return fieldHtml(f, row, data); }).join(""));

    $("#recordForm").on("submit", function (e) {
      e.preventDefault();
      if (!this.checkValidity()) { this.classList.add("was-validated"); return; }

      var payload = {};
      cfg.form.forEach(function (f) {
        if (f.type === "toggle") { payload[f.key] = $("#f_" + f.key).is(":checked"); return; }
        var v = $("#f_" + f.key).val();
        payload[f.key] = f.type === "number" ? Number(v) : v;
      });
      cfg.columns.forEach(function (c) {
        if (c.type === "date" && !(c.key in payload)) { payload[c.key] = todayISO(); }
      });

      if (isNew) {
        payload[idKey] = nextId(cfg, data);
        data.unshift(payload);
        notify("New " + cfg.singular + " created.");
      } else {
        $.extend(row, payload);
        notify(cfg.singular.charAt(0).toUpperCase() + cfg.singular.slice(1) + " updated.");
      }
      saveRecords(cfg.source, data);
      $(this).find('button[type="submit"]').prop("disabled", true);
      setTimeout(function () { window.location.href = key + ".html"; }, 500);
    });

    $("#deleteBtn").on("click", function () {
      confirmDialog(
        "Delete this " + cfg.singular + "?",
        "This removes it from your mock data. It cannot be undone.",
        function () {
          removeRecord(cfg.source, idKey, row[idKey]);
          notify(cfg.singular.charAt(0).toUpperCase() + cfg.singular.slice(1) + " deleted.");
          setTimeout(function () { window.location.href = key + ".html"; }, 400);
        }
      );
    });
  }

  /* ------------------------------------------------------------ profile */

  function initProfile() {
    initSettings();
    var sessions = [
      { device: "Chrome on Windows", where: "Ahmedabad", when: "Active now", current: true },
      { device: "Safari on iPhone", where: "Ahmedabad", when: "Yesterday, 9:14 pm", current: false },
      { device: "Chrome on Android", where: "Rajkot", when: "28 August, 11:02 am", current: false }
    ];
    $("#sessions").html(sessions.map(function (s) {
      return '<li><span class="thumb"><i class="bi bi-laptop"></i></span>' +
        '<span class="grow"><span class="name d-block">' + esc(s.device) + "</span>" +
        '<span class="sku">' + esc(s.where) + " &middot; " + esc(s.when) + "</span></span>" +
        (s.current ? '<span class="tag tag-green">This device</span>'
                   : '<button class="btn btn-sm btn-outline-secondary" type="button" data-end>End</button>') + "</li>";
    }).join(""));

    $("#sessions").on("click", "[data-end]", function () {
      $(this).closest("li").remove();
      notify("Session ended.");
    });
    $("#changePhoto").on("click", function () { notify("Photo upload goes here."); });
  }

  /* ------------------------------------------------------------ sign in */

  function initSignIn() {
    $("#peek").on("click", function () {
      var f = $("#inPass"), hidden = f.attr("type") === "password";
      f.attr("type", hidden ? "text" : "password");
      $(this).find("i").attr("class", hidden ? "bi bi-eye-slash" : "bi bi-eye");
      $(this).attr("aria-label", hidden ? "Hide password" : "Show password");
    });

    $("#signInForm").on("submit", function (e) {
      e.preventDefault();
      if (!this.checkValidity()) { this.classList.add("was-validated"); return; }
      $(this).find("button[type=submit]").prop("disabled", true).text("Signing in\u2026");
      setTimeout(function () { window.location.href = "index.html"; }, 600);
    });
  }

  function initReset() {
    $("#resetForm").on("submit", function (e) {
      e.preventDefault();
      if (!this.checkValidity()) { this.classList.add("was-validated"); return; }
      $(this).addClass("d-none");
      $("#sent").removeClass("d-none").attr("tabindex", "-1").trigger("focus");
    });
  }

  /* ------------------------------------------------------------ settings */

  function initSettings() {
    $("[data-settings-form]").on("submit", function (e) {
      e.preventDefault();
      if (!this.checkValidity()) { this.classList.add("was-validated"); return; }
      notify("Changes saved.");
    });
    $("#resetDataBtn").on("click", function () {
      confirmDialog(
        "Reset all demo data?",
        "Every create, edit and delete you have made in this browser will be discarded and every module reverts to the original mock data.",
        function () { resetAllData(); notify("Demo data reset."); setTimeout(function () { window.location.href = "index.html"; }, 500); }
      );
    });
  }

  /* ------------------------------------------------------------ boot */

  var ROUTES = {
    dashboard: function () {
      renderLatestOrders("#latestOrders tbody", 6);
      renderStorePerformance("#storePerf");
      buildDashboardCharts();
    },
    settings: initSettings,
    profile: initProfile,
    signin: initSignIn,
    reset: initReset,
    none: function () {}
  };

  function boot() {
    initShell();
    initSparks();
    var route = document.body.getAttribute("data-init") || "none";
    try {
      if (route.indexOf("list:") === 0) { initList(route.slice(5)); }
      else if (route.indexOf("form:") === 0) { initForm(route.slice(5)); }
      else if (ROUTES[route]) { ROUTES[route](); }
    } catch (err) {
      if (window.console && console.error) { console.error("Page failed to start:", err); }
      $("#main").prepend(
        '<div class="alert alert-warning" role="alert">This page could not load its data. ' +
        "Reload to try again, and tell your developer if it keeps happening.</div>"
      );
    }
  }

  $(boot);

  return {
    notify: notify,
    money: money,
    confirmDialog: confirmDialog,
    DataGrid: DataGrid,
    records: records,
    saveRecords: saveRecords,
    initList: initList,
    initForm: initForm,
    initSettings: initSettings,
    initProfile: initProfile,
    initSignIn: initSignIn,
    initReset: initReset
  };
})(jQuery);
