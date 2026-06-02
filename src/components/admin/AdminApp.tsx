"use client";

import { useCallback, useEffect, useState } from "react";
import type { YadeaHome } from "@/lib/yadea-home";
import type { SiteSettings } from "@/lib/site-settings";

type CatalogSummary = {
  syncedAt: string;
  productCount: number;
  products: {
    slug: string;
    name: string;
    price: number | null;
    category: string;
    badge: "HOT" | "NEW" | null;
  }[];
};

type SyncStep = { script: string; ok: boolean; output: string };

const TABS = [
  { id: "sync", label: "Quét Yadea" },
  { id: "header", label: "Header & Menu" },
  { id: "footer", label: "Footer & Liên hệ" },
  { id: "home", label: "Trang chủ" },
  { id: "products", label: "Sản phẩm & Giá" },
  { id: "order", label: "Thứ tự & Nhóm" },
] as const;

type TabId = (typeof TABS)[number]["id"];

async function api<T>(
  url: string,
  init?: RequestInit,
): Promise<T & { ok?: boolean; error?: string }> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<TabId>("sync");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [home, setHome] = useState<YadeaHome | null>(null);
  const [catalog, setCatalog] = useState<CatalogSummary | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [syncLog, setSyncLog] = useState<SyncStep[]>([]);

  const load = useCallback(async () => {
    const data = await api<{
      settings: SiteSettings;
      home: YadeaHome;
      catalog: CatalogSummary;
    }>("/api/admin/data");
    setSettings(data.settings);
    setHome(data.home);
    setCatalog(data.catalog);
  }, []);

  useEffect(() => {
    api<{ authenticated: boolean }>("/api/admin/me")
      .then((d) => {
        setAuthed(d.authenticated);
        if (d.authenticated) return load();
      })
      .catch(() => setAuthed(false));
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setAuthed(true);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setSettings(null);
    setHome(null);
    setCatalog(null);
  }

  async function saveSettings() {
    if (!settings) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await api<{ settings: SiteSettings }>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ settings }),
      });
      setSettings(res.settings);
      setMessage("Đã lưu cài đặt site.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lỗi lưu");
    } finally {
      setBusy(false);
    }
  }

  async function saveHome() {
    if (!home) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await api<{ home: YadeaHome }>("/api/admin/home", {
        method: "PUT",
        body: JSON.stringify({ home }),
      });
      setHome(res.home);
      setMessage("Đã lưu trang chủ.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lỗi lưu");
    } finally {
      setBusy(false);
    }
  }

  async function runSync() {
    setBusy(true);
    setMessage("");
    setSyncLog([]);
    try {
      const res = await api<{ steps: SyncStep[] }>("/api/admin/sync", {
        method: "POST",
      });
      setSyncLog(res.steps);
      setMessage("Quét xong — đã cập nhật giá, ảnh, sản phẩm mới & trang chủ.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sync thất bại");
    } finally {
      setBusy(false);
    }
  }

  async function patchProduct(
    slug: string,
    patch: {
      price?: number | null;
      category?: string;
      name?: string;
      badge?: "HOT" | "NEW" | null;
      hidden?: boolean;
    },
  ) {
    setBusy(true);
    try {
      await api("/api/admin/product", {
        method: "PATCH",
        body: JSON.stringify({
          slug,
          catalog: {
            name: patch.name,
            price: patch.price,
            category: patch.category,
            badge: patch.badge,
          },
          override: patch.hidden !== undefined ? { hidden: patch.hidden } : undefined,
        }),
      });
      await load();
      setMessage(`Đã cập nhật ${slug}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setBusy(false);
    }
  }

  function moveSlug(
    listKey: "xe-may-dien" | "xe-gan-may-dien" | "all",
    slug: string,
    dir: -1 | 1,
  ) {
    if (!settings || !catalog) return;
    let list = [...settings.listingOrder[listKey]];
    if (!list.length) {
      list =
        listKey === "all"
          ? catalog.products.map((p) => p.slug)
          : catalog.products
              .filter((p) => p.category === listKey)
              .map((p) => p.slug);
    }
    const i = list.indexOf(slug);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setSettings({
      ...settings,
      listingOrder: { ...settings.listingOrder, [listKey]: list },
    });
  }

  function initOrderFromCatalog(listKey: "xe-may-dien" | "xe-gan-may-dien" | "all") {
    if (!catalog || !settings) return;
    const slugs =
      listKey === "all"
        ? catalog.products.map((p) => p.slug)
        : catalog.products
            .filter((p) => p.category === listKey)
            .map((p) => p.slug);
    setSettings({
      ...settings,
      listingOrder: { ...settings.listingOrder, [listKey]: slugs },
    });
  }

  function moveHomeSlug(
    section: "xeMay" | "xeGan",
    index: number,
    dir: -1 | 1,
  ) {
    if (!home) return;
    const list = [...(home[section] ?? [])];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    setHome({ ...home, [section]: list });
  }

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Đang kiểm tra phiên đăng nhập…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg"
        >
          <h1 className="text-xl font-bold text-gray-900">YADEA Admin</h1>
          <p className="mt-2 text-sm text-gray-500">
            Quản lý header, footer, sản phẩm, giá và đồng bộ từ yadea.com.vn
          </p>
          <Field label="Mật khẩu admin">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
              required
            />
          </Field>
          {message && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded bg-brand py-3 text-sm font-bold uppercase text-white hover:bg-[#e85f00] disabled:opacity-60"
          >
            {busy ? "Đang vào…" : "Đăng nhập"}
          </button>
        </form>
      </div>
    );
  }

  if (!settings || !home || !catalog) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Đang tải dữ liệu…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">YADEA Admin</h1>
          <p className="text-sm text-gray-500">
            {catalog.productCount} sản phẩm · catalog {catalog.syncedAt.slice(0, 10)}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Xem website
          </a>
          <button
            type="button"
            onClick={logout}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {message && (
        <p
          className="mb-4 rounded bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          {message}
        </p>
      )}

      <nav className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-brand text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        {tab === "sync" && (
          <div className="space-y-6">
            <div className="rounded-lg border-2 border-brand/30 bg-[#fff8f3] p-6">
              <h2 className="text-lg font-bold text-brand">
                Quét & cập nhật tự động từ yadea.com.vn
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Chạy lần lượt: catalog → trang chủ → configurator → tải & nén
                ảnh WebP vào <code className="text-xs">public/media</code>.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={runSync}
                className="mt-4 rounded bg-brand px-6 py-3 text-sm font-bold uppercase text-white shadow hover:bg-[#e85f00] disabled:opacity-60"
              >
                {busy ? "Đang quét… (1–3 phút)" : "Bắt đầu quét toàn bộ"}
              </button>
            </div>
            {syncLog.length > 0 && (
              <div className="space-y-3">
                {syncLog.map((s) => (
                  <div
                    key={s.script}
                    className={`rounded border p-3 text-sm ${
                      s.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <p className="font-semibold">
                      {s.ok ? "✓" : "✗"} {s.script}
                    </p>
                    <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-gray-600">
                      {s.output || "(không có log)"}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "header" && (
          <div className="space-y-6">
            <Field label="Logo header (URL)">
              <input
                className={inputClass}
                value={settings.header.logoUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    header: { ...settings.header, logoUrl: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Hotline top bar">
              <input
                className={inputClass}
                value={settings.header.topBarHotline}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    header: { ...settings.header, topBarHotline: e.target.value },
                  })
                }
              />
            </Field>
            <h3 className="font-bold">Menu chính</h3>
            {settings.header.mainNav.map((item, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder="Nhãn"
                  value={item.label}
                  onChange={(e) => {
                    const mainNav = [...settings.header.mainNav];
                    mainNav[i] = { ...mainNav[i], label: e.target.value };
                    setSettings({ ...settings, header: { ...settings.header, mainNav } });
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="/duong-dan"
                  value={item.href}
                  onChange={(e) => {
                    const mainNav = [...settings.header.mainNav];
                    mainNav[i] = { ...mainNav[i], href: e.target.value };
                    setSettings({ ...settings, header: { ...settings.header, mainNav } });
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-brand"
              onClick={() =>
                setSettings({
                  ...settings,
                  header: {
                    ...settings.header,
                    mainNav: [
                      ...settings.header.mainNav,
                      { label: "Mục mới", href: "/" },
                    ],
                  },
                })
              }
            >
              + Thêm menu
            </button>
            <h3 className="font-bold">Top bar</h3>
            {settings.header.topBar.map((item, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <input
                  className={inputClass}
                  value={item.label}
                  onChange={(e) => {
                    const topBar = [...settings.header.topBar];
                    topBar[i] = { ...topBar[i], label: e.target.value };
                    setSettings({ ...settings, header: { ...settings.header, topBar } });
                  }}
                />
                <input
                  className={inputClass}
                  value={item.href}
                  onChange={(e) => {
                    const topBar = [...settings.header.topBar];
                    topBar[i] = { ...topBar[i], href: e.target.value };
                    setSettings({ ...settings, header: { ...settings.header, topBar } });
                  }}
                />
              </div>
            ))}
            <button type="button" onClick={saveSettings} disabled={busy} className="rounded bg-brand px-6 py-2.5 text-sm font-bold text-white">
              Lưu header
            </button>
          </div>
        )}

        {tab === "footer" && (
          <div className="space-y-4">
            <Field label="Logo footer">
              <input
                className={inputClass}
                value={settings.footer.logoUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    footer: { ...settings.footer, logoUrl: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Tên công ty">
              <input
                className={inputClass}
                value={settings.footer.companyName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    footer: { ...settings.footer, companyName: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Địa chỉ (mỗi dòng một input)">
              {settings.footer.addressLines.map((line, i) => (
                <input
                  key={i}
                  className={`${inputClass} mt-1`}
                  value={line}
                  onChange={(e) => {
                    const addressLines = [...settings.footer.addressLines];
                    addressLines[i] = e.target.value;
                    setSettings({
                      ...settings,
                      footer: { ...settings.footer, addressLines },
                    });
                  }}
                />
              ))}
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Hotline">
                <input
                  className={inputClass}
                  value={settings.footer.hotline}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footer: { ...settings.footer, hotline: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="CSKH">
                <input
                  className={inputClass}
                  value={settings.footer.cskh}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footer: { ...settings.footer, cskh: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Email">
                <input
                  className={inputClass}
                  value={settings.footer.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footer: { ...settings.footer, email: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Copyright">
              <input
                className={inputClass}
                value={settings.footer.copyright}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    footer: { ...settings.footer, copyright: e.target.value },
                  })
                }
              />
            </Field>
            <button type="button" onClick={saveSettings} disabled={busy} className="rounded bg-brand px-6 py-2.5 text-sm font-bold text-white">
              Lưu footer
            </button>
          </div>
        )}

        {tab === "home" && (
          <div className="space-y-6">
            <Field label="Hero — tiêu đề">
              <input
                className={inputClass}
                value={home.hero.title}
                onChange={(e) =>
                  setHome({ ...home, hero: { ...home.hero, title: e.target.value } })
                }
              />
            </Field>
            <Field label="Hero — phụ đề">
              <input
                className={inputClass}
                value={home.hero.subtitle}
                onChange={(e) =>
                  setHome({ ...home, hero: { ...home.hero, subtitle: e.target.value } })
                }
              />
            </Field>
            {home.hero.slides[0] && (
              <>
                <Field label="Banner desktop (URL)">
                  <input
                    className={inputClass}
                    value={home.hero.slides[0].desktop}
                    onChange={(e) => {
                      const slides = [...home.hero.slides];
                      slides[0] = { ...slides[0], desktop: e.target.value };
                      setHome({ ...home, hero: { ...home.hero, slides } });
                    }}
                  />
                </Field>
                <Field label="Banner mobile (URL)">
                  <input
                    className={inputClass}
                    value={home.hero.slides[0].mobile ?? ""}
                    onChange={(e) => {
                      const slides = [...home.hero.slides];
                      slides[0] = { ...slides[0], mobile: e.target.value };
                      setHome({ ...home, hero: { ...home.hero, slides } });
                    }}
                  />
                </Field>
              </>
            )}
            <h3 className="font-bold">Thứ tự XE MÁY ĐIỆN (trang chủ)</h3>
            <ul className="space-y-1 text-sm">
              {(home.xeMay ?? []).map((item, i) => (
                <li
                  key={`${item.slug}-${i}`}
                  className="flex items-center justify-between rounded border px-3 py-2"
                >
                  <span>{item.name || item.slug}</span>
                  <span className="flex gap-1">
                    <button type="button" className="px-2" onClick={() => moveHomeSlug("xeMay", i, -1)}>↑</button>
                    <button type="button" className="px-2" onClick={() => moveHomeSlug("xeMay", i, 1)}>↓</button>
                  </span>
                </li>
              ))}
            </ul>
            <h3 className="font-bold">Thứ tự XE GẮN MÁY ĐIỆN</h3>
            <ul className="space-y-1 text-sm">
              {(home.xeGan ?? []).map((item, i) => (
                <li
                  key={`${item.slug}-${i}`}
                  className="flex items-center justify-between rounded border px-3 py-2"
                >
                  <span>{item.name || item.slug}</span>
                  <span className="flex gap-1">
                    <button type="button" className="px-2" onClick={() => moveHomeSlug("xeGan", i, -1)}>↑</button>
                    <button type="button" className="px-2" onClick={() => moveHomeSlug("xeGan", i, 1)}>↓</button>
                  </span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={saveHome} disabled={busy} className="rounded bg-brand px-6 py-2.5 text-sm font-bold text-white">
              Lưu trang chủ
            </button>
          </div>
        )}

        {tab === "products" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="py-2 pr-2">Slug</th>
                  <th className="py-2 pr-2">Tên</th>
                  <th className="py-2 pr-2">Giá (VND)</th>
                  <th className="py-2 pr-2">Nhóm</th>
                  <th className="py-2 pr-2">Ẩn</th>
                  <th className="py-2">Lưu</th>
                </tr>
              </thead>
              <tbody>
                {catalog.products.map((p) => (
                  <ProductRow
                    key={p.slug}
                    product={p}
                    hidden={!!settings.productOverrides[p.slug]?.hidden}
                    categories={settings.categories}
                    onSave={patchProduct}
                    disabled={busy}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "order" && (
          <div className="space-y-8">
            <div>
              <h3 className="font-bold">Nhóm hàng (phân loại)</h3>
              {settings.categories.map((cat, i) => (
                <div key={cat.id} className="mt-3 grid gap-2 sm:grid-cols-3">
                  <input className={inputClass} value={cat.id} disabled />
                  <input
                    className={inputClass}
                    value={cat.label}
                    onChange={(e) => {
                      const categories = [...settings.categories];
                      categories[i] = { ...categories[i], label: e.target.value };
                      setSettings({ ...settings, categories });
                    }}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={cat.enabled}
                      onChange={(e) => {
                        const categories = [...settings.categories];
                        categories[i] = { ...categories[i], enabled: e.target.checked };
                        setSettings({ ...settings, categories });
                      }}
                    />
                    Hiển thị
                  </label>
                </div>
              ))}
            </div>
            {(["xe-may-dien", "xe-gan-may-dien", "all"] as const).map((key) => (
              <OrderBlock
                key={key}
                title={
                  key === "all"
                    ? "Tất cả sản phẩm (/san-pham)"
                    : settings.categories.find((c) => c.id === key)?.label ?? key
                }
                slugs={
                  settings.listingOrder[key].length
                    ? settings.listingOrder[key]
                    : catalog.products
                        .filter((p) => key === "all" || p.category === key)
                        .map((p) => p.slug)
                }
                onInit={() => initOrderFromCatalog(key)}
                onMove={(slug, dir) => moveSlug(key, slug, dir)}
              />
            ))}
            <button type="button" onClick={saveSettings} disabled={busy} className="rounded bg-brand px-6 py-2.5 text-sm font-bold text-white">
              Lưu thứ tự & nhóm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductRow({
  product,
  hidden,
  categories,
  onSave,
  disabled,
}: {
  product: CatalogSummary["products"][0];
  hidden: boolean;
  categories: SiteSettings["categories"];
  onSave: (
    slug: string,
    patch: {
      price?: number | null;
      category?: string;
      name?: string;
      hidden?: boolean;
    },
  ) => void;
  disabled: boolean;
}) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(
    product.price != null ? String(product.price) : "",
  );
  const [category, setCategory] = useState(product.category);
  const [isHidden, setIsHidden] = useState(hidden);

  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-2 font-mono text-xs">{product.slug}</td>
      <td className="py-2 pr-2">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </td>
      <td className="py-2 pr-2">
        <input
          className={inputClass}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="38990000"
        />
      </td>
      <td className="py-2 pr-2">
        <select
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-2">
        <input
          type="checkbox"
          checked={isHidden}
          onChange={(e) => setIsHidden(e.target.checked)}
        />
      </td>
      <td className="py-2">
        <button
          type="button"
          disabled={disabled}
          className="rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
          onClick={() =>
            onSave(product.slug, {
              name,
              price: price.trim() === "" ? null : Number(price),
              category,
              hidden: isHidden,
            })
          }
        >
          Lưu
        </button>
      </td>
    </tr>
  );
}

function OrderBlock({
  title,
  slugs,
  onInit,
  onMove,
}: {
  title: string;
  slugs: string[];
  onInit: () => void;
  onMove: (slug: string, dir: -1 | 1) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-bold">{title}</h3>
        <button type="button" onClick={onInit} className="text-xs text-brand">
          Lấy thứ tự mặc định từ catalog
        </button>
      </div>
      <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
        {slugs.map((slug, i) => (
          <li
            key={slug}
            className="flex items-center justify-between rounded border px-3 py-1.5 font-mono text-xs"
          >
            {slug}
            <span>
              <button type="button" className="px-2" onClick={() => onMove(slug, -1)} disabled={i === 0}>↑</button>
              <button type="button" className="px-2" onClick={() => onMove(slug, 1)} disabled={i === slugs.length - 1}>↓</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
