// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOGO_URL =
  "https://pub-4c8ccc42d7c14cf3b70f4886e1f2208b.r2.dev/images/bobw_animated_grey.gif";

const STEPS = [
  { n: 1, label: "Configuration" },
  { n: 2, label: "Autorisation" },
  { n: 3, label: "Échange" },
  { n: 4, label: "Terminé" },
];

interface Config {
  clientId: string;
  clientSecret: string;
  shop: string;
  scopes: string;
  artist: string;
  recordCompany: string;
  label: string;
}

interface ShopifyTokenResponse {
  access_token: string;
  scope: string;
}

// Liste des scopes par défaut pour Shopify OAuth
const DEFAULT_SCOPES = [
  "read_all_orders",
  "read_analytics",
  "read_app_proxy",
  "write_app_proxy",
  "read_apps",
  "read_assigned_fulfillment_orders",
  "write_assigned_fulfillment_orders",
  "read_audit_events",
  "read_customer_events",
  "read_cart_transforms",
  "write_cart_transforms",
  "read_all_cart_transforms",
  "read_validations",
  "write_validations",
  "read_cash_tracking",
  "read_channels",
  "write_channels",
  "read_checkout_branding_settings",
  "write_checkout_branding_settings",
  "write_checkouts",
  "read_checkouts",
  "read_companies",
  "write_companies",
  "read_custom_fulfillment_services",
  "write_custom_fulfillment_services",
  "read_custom_pixels",
  "write_custom_pixels",
  "read_customers",
  "write_customers",
  "read_customer_data_erasure",
  "write_customer_data_erasure",
  "read_customer_payment_methods",
  "read_customer_merge",
  "write_customer_merge",
  "read_delivery_customizations",
  "write_delivery_customizations",
  "read_price_rules",
  "write_price_rules",
  "read_discounts",
  "write_discounts",
  "read_discounts_allocator_functions",
  "write_discounts_allocator_functions",
  "read_discovery",
  "write_discovery",
  "write_draft_orders",
  "read_draft_orders",
  "read_files",
  "write_files",
  "read_fulfillment_constraint_rules",
  "write_fulfillment_constraint_rules",
  "read_fulfillments",
  "write_fulfillments",
  "read_gift_card_transactions",
  "write_gift_card_transactions",
  "read_gift_cards",
  "write_gift_cards",
  "write_inventory",
  "read_inventory",
  "write_inventory_shipments",
  "read_inventory_shipments",
  "write_inventory_shipments_received_items",
  "read_inventory_shipments_received_items",
  "write_inventory_transfers",
  "read_inventory_transfers",
  "read_legal_policies",
  "write_legal_policies",
  "read_delivery_option_generators",
  "write_delivery_option_generators",
  "read_locales",
  "write_locales",
  "write_locations",
  "read_locations",
  "read_marketing_integrated_campaigns",
  "write_marketing_integrated_campaigns",
  "write_marketing_events",
  "read_marketing_events",
  "read_markets",
  "write_markets",
  "read_markets_home",
  "write_markets_home",
  "read_merchant_managed_fulfillment_orders",
  "write_merchant_managed_fulfillment_orders",
  "read_metaobject_definitions",
  "write_metaobject_definitions",
  "read_metaobjects",
  "write_metaobjects",
  "read_online_store_navigation",
  "write_online_store_navigation",
  "read_online_store_pages",
  "write_online_store_pages",
  "write_order_edits",
  "read_order_edits",
  "read_orders",
  "write_orders",
  "write_packing_slip_templates",
  "read_packing_slip_templates",
  "write_payment_mandate",
  "read_payment_mandate",
  "read_payment_terms",
  "write_payment_terms",
  "read_payment_customizations",
  "write_payment_customizations",
  "read_pixels",
  "write_pixels",
  "read_privacy_settings",
  "write_privacy_settings",
  "read_product_feeds",
  "write_product_feeds",
  "read_product_listings",
  "write_product_listings",
  "read_products",
  "write_products",
  "read_publications",
  "write_publications",
  "read_purchase_options",
  "write_purchase_options",
  "write_reports",
  "read_reports",
  "read_resource_feedbacks",
  "write_resource_feedbacks",
  "read_returns",
  "write_returns",
  "read_script_tags",
  "write_script_tags",
  "read_shopify_payments_provider_accounts_sensitive",
  "read_shipping",
  "write_shipping",
  "read_shopify_payments_accounts",
  "read_shopify_payments_payouts",
  "read_shopify_payments_bank_accounts",
  "read_shopify_payments_disputes",
  "write_shopify_payments_disputes",
  "read_content",
  "write_content",
  "read_store_credit_account_transactions",
  "write_store_credit_account_transactions",
  "read_store_credit_accounts",
  "write_own_subscription_contracts",
  "read_own_subscription_contracts",
  "write_theme_code",
  "read_themes",
  "write_themes",
  "read_third_party_fulfillment_orders",
  "write_third_party_fulfillment_orders",
  "read_translations",
  "write_translations",
  "customer_read_companies",
  "customer_write_companies",
  "customer_write_customers",
  "customer_read_customers",
  "customer_read_draft_orders",
  "customer_read_markets",
  "customer_read_metaobjects",
  "customer_read_orders",
  "customer_write_orders",
  "customer_read_quick_sale",
  "customer_write_quick_sale",
  "customer_read_store_credit_account_transactions",
  "customer_read_store_credit_accounts",
  "customer_write_own_subscription_contracts",
  "customer_read_own_subscription_contracts",
  "unauthenticated_write_bulk_operations",
  "unauthenticated_read_bulk_operations",
  "unauthenticated_read_bundles",
  "unauthenticated_write_checkouts",
  "unauthenticated_read_checkouts",
  "unauthenticated_write_customers",
  "unauthenticated_read_customers",
  "unauthenticated_read_customer_tags",
  "unauthenticated_read_metaobjects",
  "unauthenticated_read_product_pickup_locations",
  "unauthenticated_read_product_inventory",
  "unauthenticated_read_product_listings",
  "unauthenticated_read_product_tags",
  "unauthenticated_read_selling_plans",
  "unauthenticated_read_shop_pay_installments_pricing",
  "unauthenticated_read_content",
].join(",");

export default function ShopifyOAuthApp() {
  const [step, setStep] = useState<number>(1);
  const [config, setConfig] = useState<Config>({
    clientId: "",
    clientSecret: "",
    shop: "",
    scopes: DEFAULT_SCOPES,
    artist: "",
    recordCompany: "",
    label: "",
  });
  const [authCode, setAuthCode] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<string>("");

  const copyToClipboard = (text: string, field: string): void => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
  };

  const generateOAuthUrl = (): string => {
    if (!config.clientId || !config.shop) {
      setError("Client ID et Shop sont requis");
      return "";
    }

    const shopDomain = config.shop.includes(".myshopify.com")
      ? config.shop
      : `${config.shop}.myshopify.com`;

    const redirectUri = window.location.origin + window.location.pathname;

    return `https://${shopDomain}/admin/oauth/authorize?client_id=${config.clientId}&scope=${config.scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const exchangeCodeForToken = async (): Promise<void> => {
    if (
      !authCode ||
      !config.clientId ||
      !config.clientSecret ||
      !config.shop ||
      !config.artist
    ) {
      setError("Tous les champs requis doivent être remplis");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Appel à notre API route Next.js (côté serveur)
      const response = await fetch("/api/shopify/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: authCode,
          shop: config.shop,
          artist: config.artist,
          recordCompany: config.recordCompany,
          label: config.label,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const data: ShopifyTokenResponse = await response.json();

      if (data.access_token) {
        setAccessToken(data.access_token);
        setStep(4);
      } else {
        throw new Error("Token non reçu dans la réponse");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(
        errorMessage ||
          "Erreur lors de l'échange du code. Vérifiez vos identifiants.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = (): void => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const shop = urlParams.get("shop");

    if (code) {
      // Récupérer les données sauvegardées
      const savedConfig = localStorage.getItem("shopify_oauth_config");
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      }

      setAuthCode(code);
      if (shop) setConfig((prev) => ({ ...prev, shop }));
      setStep(3);
    }
  };

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Brand chrome — the three-stop gradient ribbon, at large scale, used once. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
        <div className="brand-ribbon absolute -top-56 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-[0.18] blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl p-6 md:p-10">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <img
            src={LOGO_URL}
            alt="BOBW"
            className="size-14 shrink-0 object-contain"
          />
          <div>
            <p className="text-mono-caps-eyebrow text-muted-foreground">BOBW</p>
            <h1 className="text-display-md text-foreground">
              Shopify OAuth Token Generator
            </h1>
          </div>
        </div>

        <div className="animate-in-fade rounded-md border border-border bg-card p-6 md:p-8">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-between">
            {STEPS.map(({ n: s, label }) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex size-7 items-center justify-center rounded-md text-mono-caps-label transition-colors ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground opacity-60"
                    }`}
                  >
                    {step > s ? <Check size={13} /> : s}
                  </div>
                  <span
                    className={`text-mono-caps-label whitespace-nowrap ${
                      step >= s
                        ? "text-foreground"
                        : "text-muted-foreground opacity-60"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {s < 4 && (
                  <div
                    className={`mx-2 mb-5 h-px flex-1 transition-colors ${
                      step > s ? "bg-foreground/50" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-md border border-destructive/30 p-4">
              <AlertCircle
                className="mt-0.5 shrink-0 text-destructive"
                size={18}
              />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Step 1: Configuration */}
          {step === 1 && (
            <div className="animate-in-fade space-y-5">
              <h2 className="text-mono-caps-eyebrow text-muted-foreground">
                Étape 1 — Configuration initiale
              </h2>

              <Field>
                <FieldLabel htmlFor="client-id">Client ID *</FieldLabel>
                <Input
                  id="client-id"
                  type="text"
                  value={config.clientId}
                  onChange={(e) =>
                    setConfig({ ...config, clientId: e.target.value })
                  }
                  placeholder="Votre Client ID Shopify"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="client-secret">Client Secret *</FieldLabel>
                <Input
                  id="client-secret"
                  type="password"
                  value={config.clientSecret}
                  onChange={(e) =>
                    setConfig({ ...config, clientSecret: e.target.value })
                  }
                  placeholder="Votre Client Secret"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="shop">Nom de la boutique *</FieldLabel>
                <Input
                  id="shop"
                  type="text"
                  value={config.shop}
                  onChange={(e) =>
                    setConfig({ ...config, shop: e.target.value })
                  }
                  placeholder="myshop (ou myshop.myshopify.com)"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="artist">Artiste *</FieldLabel>
                <Input
                  id="artist"
                  type="text"
                  value={config.artist}
                  onChange={(e) =>
                    setConfig({ ...config, artist: e.target.value })
                  }
                  placeholder="Nom de l'artiste"
                />
              </Field>
              <div className="flex flex-row gap-4">
                <Field>
                  <FieldLabel htmlFor="record-company">
                    Maison de disques (optionnel)
                  </FieldLabel>
                  <Select
                    value={config.recordCompany}
                    onValueChange={(value) =>
                      setConfig({ ...config, recordCompany: value })
                    }
                  >
                    <SelectTrigger id="record-company" className="w-full">
                      <SelectValue placeholder="Sélectionnez une maison de disques" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SONY">Sony</SelectItem>
                      <SelectItem value="WARNER">Warner</SelectItem>
                      <SelectItem value="WAGRAM">Wagram</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="label">Label (optionnel)</FieldLabel>
                  <Input
                    id="label"
                    type="text"
                    value={config.label}
                    onChange={(e) =>
                      setConfig({ ...config, label: e.target.value })
                    }
                    placeholder="Nom du label"
                  />
                </Field>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!config.clientId || !config.shop || !config.artist}
                className="text-mono-caps-button w-full rounded-md bg-primary py-3 text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Continuer
              </button>
            </div>
          )}

          {/* Step 2: Generate OAuth URL */}
          {step === 2 && (
            <div className="animate-in-fade space-y-6">
              <h2 className="text-mono-caps-eyebrow text-muted-foreground">
                Étape 2 — Autorisation OAuth
              </h2>

              <div className="rounded-md border border-border p-4">
                <p className="mb-4 text-sm text-muted-foreground">
                  Cliquez sur le bouton ci-dessous pour vous connecter à Shopify
                  et autoriser l'application. Vous serez redirigé vers cette
                  page avec un code d'autorisation.
                </p>

                <div className="mb-4 rounded-md border border-border bg-secondary/40 p-3">
                  <p className="text-mono-caps-label mb-1 text-muted-foreground">
                    URL d'autorisation
                  </p>
                  <p className="text-mono-caption break-all text-foreground">
                    {generateOAuthUrl()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const url = generateOAuthUrl();
                      copyToClipboard(url, "oauth");
                    }}
                    className="text-mono-caps-button flex items-center gap-2 rounded-md bg-secondary px-4 py-2.5 text-secondary-foreground transition hover:opacity-90"
                  >
                    {copied === "oauth" ? (
                      <Check size={15} />
                    ) : (
                      <Copy size={15} />
                    )}
                    Copier l'URL
                  </button>

                  <a
                    href={generateOAuthUrl()}
                    onClick={() => {
                      // Sauvegarder la config avant la redirection
                      localStorage.setItem(
                        "shopify_oauth_config",
                        JSON.stringify(config),
                      );
                    }}
                    className="text-mono-caps-button flex flex-1 items-center justify-center rounded-md bg-primary py-2.5 text-center text-primary-foreground transition hover:opacity-90"
                  >
                    Autoriser sur Shopify
                  </a>
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="text-mono-caps-button flex w-full items-center justify-center gap-2 rounded-md bg-secondary py-3 text-secondary-foreground transition hover:opacity-90"
              >
                <ArrowLeft size={15} />
                Retour
              </button>
            </div>
          )}

          {/* Step 3: Exchange Code */}
          {step === 3 && (
            <div className="animate-in-fade space-y-6">
              <h2 className="text-mono-caps-eyebrow text-muted-foreground">
                Étape 3 — Échange du code
              </h2>

              {authCode ? (
                <div className="rounded-md border border-border p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-sm text-foreground">
                    <Check size={15} className="text-emerald-400" /> Code reçu
                    automatiquement
                  </p>
                  <p className="text-mono-caption break-all text-muted-foreground">
                    {authCode}
                  </p>
                </div>
              ) : (
                <Field>
                  <FieldLabel htmlFor="auth-code">
                    Code d'autorisation (reçu après autorisation)
                  </FieldLabel>
                  <Input
                    id="auth-code"
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="Collez le code reçu"
                  />
                </Field>
              )}

              <button
                onClick={exchangeCodeForToken}
                disabled={loading || !authCode}
                className="text-mono-caps-button flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {loading && <Loader2 className="animate-spin" size={16} />}
                {loading ? "Échange en cours..." : "Obtenir le token"}
              </button>

              <button
                onClick={() => setStep(2)}
                className="text-mono-caps-button flex w-full items-center justify-center gap-2 rounded-md bg-secondary py-3 text-secondary-foreground transition hover:opacity-90"
              >
                <ArrowLeft size={15} />
                Retour
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && accessToken && (
            <div className="animate-in-fade space-y-6">
              <h2 className="flex items-center gap-1.5 text-mono-caps-eyebrow text-emerald-400">
                <ShieldCheck size={14} />
                Token généré avec succès
              </h2>

              <div className="rounded-md border border-border p-5">
                <p className="mb-3 text-sm font-medium text-foreground">
                  Votre Access Token :
                </p>
                <div className="mb-4 rounded-md border border-border bg-secondary/40 p-4">
                  <p className="text-mono-caption break-all text-foreground">
                    {accessToken}
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(accessToken, "token")}
                  className="text-mono-caps-button flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-primary-foreground transition hover:opacity-90"
                >
                  {copied === "token" ? (
                    <Check size={15} />
                  ) : (
                    <Copy size={15} />
                  )}
                  {copied === "token" ? "Copié !" : "Copier le token"}
                </button>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-amber-500/30 p-4">
                <AlertCircle
                  className="mt-0.5 shrink-0 text-amber-400"
                  size={16}
                />
                <p className="text-sm text-amber-400">
                  Conservez ce token en sécurité. Ne le partagez jamais
                  publiquement.
                </p>
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  setAuthCode("");
                  setAccessToken("");
                  setConfig({
                    clientId: "",
                    clientSecret: "",
                    shop: "",
                    scopes: DEFAULT_SCOPES,
                    artist: "",
                    recordCompany: "",
                    label: "",
                  });
                  // Nettoyer le localStorage
                  localStorage.removeItem("shopify_oauth_config");
                }}
                className="text-mono-caps-button w-full rounded-md bg-secondary py-3 text-secondary-foreground transition hover:opacity-90"
              >
                Générer un nouveau token
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-md border border-border p-6">
          <h3 className="text-mono-caps-eyebrow mb-4 text-muted-foreground">
            Instructions
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="text-mono-caps-label text-foreground">01</span>{" "}
              Créez une app dans votre Shopify Partners Dashboard
            </p>
            <p>
              <span className="text-mono-caps-label text-foreground">02</span>{" "}
              Configurez l'App URL et Redirect URL avec :{" "}
              <code className="text-mono-caption rounded-md bg-secondary px-1.5 py-0.5 text-foreground">
                https://auth.bobw.app
              </code>
            </p>
            <p>
              <span className="text-mono-caps-label text-foreground">03</span>{" "}
              Entrez vos identifiants (Client ID et Client Secret)
            </p>
            <p>
              <span className="text-mono-caps-label text-foreground">04</span>{" "}
              Cliquez sur "Autoriser sur Shopify"
            </p>
            <p>
              <span className="text-mono-caps-label text-foreground">05</span>{" "}
              Récupérez votre access token (shpat_...)
            </p>
          </div>
        </div>

        {/* Signature sign-off — faint wordmark stencil, per DESIGN.md's
            footer-wordmark-banner. */}
        <p
          aria-hidden="true"
          className="mt-10 select-none text-center text-5xl font-medium tracking-[-0.03em] text-secondary md:text-6xl"
        >
          bobw
        </p>
      </div>
    </div>
  );
}
