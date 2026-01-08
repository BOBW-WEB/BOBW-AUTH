// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, AlertCircle, Loader2 } from 'lucide-react';

interface Config {
  clientId: string;
  clientSecret: string;
  shop: string;
  scopes: string;
}

interface ShopifyTokenResponse {
  access_token: string;
  scope: string;
}

// Liste des scopes par défaut pour Shopify OAuth
const DEFAULT_SCOPES = [
  'read_all_orders', 'read_analytics', 'read_app_proxy', 'write_app_proxy', 'read_apps',
  'read_assigned_fulfillment_orders', 'write_assigned_fulfillment_orders', 'read_audit_events',
  'read_customer_events', 'read_cart_transforms', 'write_cart_transforms', 'read_all_cart_transforms',
  'read_validations', 'write_validations', 'read_cash_tracking', 'read_channels', 'write_channels',
  'read_checkout_branding_settings', 'write_checkout_branding_settings', 'write_checkouts', 'read_checkouts',
  'read_companies', 'write_companies', 'read_custom_fulfillment_services', 'write_custom_fulfillment_services',
  'read_custom_pixels', 'write_custom_pixels', 'read_customers', 'write_customers', 'read_customer_data_erasure',
  'write_customer_data_erasure', 'read_customer_payment_methods', 'read_customer_merge', 'write_customer_merge',
  'read_delivery_customizations', 'write_delivery_customizations', 'read_price_rules', 'write_price_rules',
  'read_discounts', 'write_discounts', 'read_discounts_allocator_functions', 'write_discounts_allocator_functions',
  'read_discovery', 'write_discovery', 'write_draft_orders', 'read_draft_orders', 'read_files', 'write_files',
  'read_fulfillment_constraint_rules', 'write_fulfillment_constraint_rules', 'read_fulfillments', 'write_fulfillments',
  'read_gift_card_transactions', 'write_gift_card_transactions', 'read_gift_cards', 'write_gift_cards',
  'write_inventory', 'read_inventory', 'write_inventory_shipments', 'read_inventory_shipments',
  'write_inventory_shipments_received_items', 'read_inventory_shipments_received_items', 'write_inventory_transfers',
  'read_inventory_transfers', 'read_legal_policies', 'write_legal_policies', 'read_delivery_option_generators',
  'write_delivery_option_generators', 'read_locales', 'write_locales', 'write_locations', 'read_locations',
  'read_marketing_integrated_campaigns', 'write_marketing_integrated_campaigns', 'write_marketing_events',
  'read_marketing_events', 'read_markets', 'write_markets', 'read_markets_home', 'write_markets_home',
  'read_merchant_managed_fulfillment_orders', 'write_merchant_managed_fulfillment_orders', 'read_metaobject_definitions',
  'write_metaobject_definitions', 'read_metaobjects', 'write_metaobjects', 'read_online_store_navigation',
  'write_online_store_navigation', 'read_online_store_pages', 'write_online_store_pages', 'write_order_edits',
  'read_order_edits', 'read_orders', 'write_orders', 'write_packing_slip_templates', 'read_packing_slip_templates',
  'write_payment_mandate', 'read_payment_mandate', 'read_payment_terms', 'write_payment_terms',
  'read_payment_customizations', 'write_payment_customizations', 'read_pixels', 'write_pixels',
  'read_privacy_settings', 'write_privacy_settings', 'read_product_feeds', 'write_product_feeds',
  'read_product_listings', 'write_product_listings', 'read_products', 'write_products', 'read_publications',
  'write_publications', 'read_purchase_options', 'write_purchase_options', 'write_reports', 'read_reports',
  'read_resource_feedbacks', 'write_resource_feedbacks', 'read_returns', 'write_returns', 'read_script_tags',
  'write_script_tags', 'read_shopify_payments_provider_accounts_sensitive', 'read_shipping', 'write_shipping',
  'read_shopify_payments_accounts', 'read_shopify_payments_payouts', 'read_shopify_payments_bank_accounts',
  'read_shopify_payments_disputes', 'write_shopify_payments_disputes', 'read_content', 'write_content',
  'read_store_credit_account_transactions', 'write_store_credit_account_transactions', 'read_store_credit_accounts',
  'write_own_subscription_contracts', 'read_own_subscription_contracts', 'write_theme_code', 'read_themes',
  'write_themes', 'read_third_party_fulfillment_orders', 'write_third_party_fulfillment_orders', 'read_translations',
  'write_translations', 'customer_read_companies', 'customer_write_companies', 'customer_write_customers',
  'customer_read_customers', 'customer_read_draft_orders', 'customer_read_markets', 'customer_read_metaobjects',
  'customer_read_orders', 'customer_write_orders', 'customer_read_quick_sale', 'customer_write_quick_sale',
  'customer_read_store_credit_account_transactions', 'customer_read_store_credit_accounts',
  'customer_write_own_subscription_contracts', 'customer_read_own_subscription_contracts',
  'unauthenticated_write_bulk_operations', 'unauthenticated_read_bulk_operations', 'unauthenticated_read_bundles',
  'unauthenticated_write_checkouts', 'unauthenticated_read_checkouts', 'unauthenticated_write_customers',
  'unauthenticated_read_customers', 'unauthenticated_read_customer_tags', 'unauthenticated_read_metaobjects',
  'unauthenticated_read_product_pickup_locations', 'unauthenticated_read_product_inventory',
  'unauthenticated_read_product_listings', 'unauthenticated_read_product_tags', 'unauthenticated_read_selling_plans',
  'unauthenticated_read_shop_pay_installments_pricing', 'unauthenticated_read_content'
].join(',');

export default function ShopifyOAuthApp() {
  const [step, setStep] = useState<number>(1);
  const [config, setConfig] = useState<Config>({
    clientId: '',
    clientSecret: '',
    shop: '',
    scopes: DEFAULT_SCOPES
  });
  const [authCode, setAuthCode] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<string>('');

  const copyToClipboard = (text: string, field: string): void => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const generateOAuthUrl = (): string => {
    if (!config.clientId || !config.shop) {
      setError('Client ID et Shop sont requis');
      return '';
    }
    
    const shopDomain = config.shop.includes('.myshopify.com') 
      ? config.shop 
      : `${config.shop}.myshopify.com`;
    
    const redirectUri = window.location.origin + window.location.pathname;
    
    return `https://${shopDomain}/admin/oauth/authorize?client_id=${config.clientId}&scope=${config.scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const exchangeCodeForToken = async (): Promise<void> => {
    if (!authCode || !config.clientId || !config.clientSecret || !config.shop) {
      setError('Tous les champs sont requis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const shopDomain = config.shop.includes('.myshopify.com') 
        ? config.shop 
        : `${config.shop}.myshopify.com`;

      const corsProxy = 'https://corsproxy.io/?';
      const targetUrl = `https://${shopDomain}/admin/oauth/access_token`;

      const response = await fetch(corsProxy + encodeURIComponent(targetUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: authCode
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data: ShopifyTokenResponse = await response.json();
      
      if (data.access_token) {
        setAccessToken(data.access_token);
        setStep(4);
      } else {
        throw new Error('Token non reçu dans la réponse');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage || 'Erreur lors de l\'échange du code. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = (): void => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const shop = urlParams.get('shop');
    
    if (code) {
      // Récupérer les données sauvegardées
      const savedConfig = localStorage.getItem('shopify_oauth_config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      }
      
      setAuthCode(code);
      if (shop) setConfig(prev => ({ ...prev, shop }));
      setStep(3);
    }
  };

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Shopify OAuth Token Generator
          </h1>
          <p className="text-gray-600 mb-8">
            Générez votre token d'accès Shopify en quelques étapes simples
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle className="text-red-500 mr-3 mt-0.5" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Configuration */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Étape 1 : Configuration initiale
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID *
                </label>
                <input
                  type="text"
                  value={config.clientId}
                  onChange={(e) => setConfig({...config, clientId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Votre Client ID Shopify"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret *
                </label>
                <input
                  type="password"
                  value={config.clientSecret}
                  onChange={(e) => setConfig({...config, clientSecret: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Votre Client Secret"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop *
                </label>
                <input
                  type="text"
                  value={config.shop}
                  onChange={(e) => setConfig({...config, shop: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="myshop (ou myshop.myshopify.com)"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!config.clientId || !config.shop}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Continuer
              </button>
            </div>
          )}

          {/* Step 2: Generate OAuth URL */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Étape 2 : Autorisation OAuth
              </h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-4">
                  Cliquez sur le bouton ci-dessous pour vous connecter à Shopify et autoriser l'application.
                  Vous serez redirigé vers cette page avec un code d'autorisation.
                </p>
                
                <div className="bg-white rounded p-3 mb-4">
                  <p className="text-xs text-gray-600 mb-1">URL d'autorisation :</p>
                  <p className="text-sm font-mono break-all text-gray-800">
                    {generateOAuthUrl()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const url = generateOAuthUrl();
                      copyToClipboard(url, 'oauth');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    {copied === 'oauth' ? <Check size={18} /> : <Copy size={18} />}
                    Copier l'URL
                  </button>
                  
                  <a
                    href={generateOAuthUrl()}
                    onClick={() => {
                      // Sauvegarder la config avant la redirection
                      localStorage.setItem('shopify_oauth_config', JSON.stringify(config));
                    }}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold text-center hover:bg-green-600 transition"
                  >
                    Autoriser sur Shopify
                  </a>
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Retour
              </button>
            </div>
          )}

          {/* Step 3: Exchange Code */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Étape 3 : Échange du code
              </h2>
              
              {authCode ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2">✓ Code reçu automatiquement</p>
                  <p className="text-xs font-mono text-gray-700 break-all">{authCode}</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code d'autorisation (reçu après autorisation)
                  </label>
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Collez le code reçu"
                  />
                </div>
              )}

              <button
                onClick={exchangeCodeForToken}
                disabled={loading || !authCode}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={20} />}
                {loading ? 'Échange en cours...' : 'Obtenir le token'}
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Retour
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && accessToken && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                ✓ Token généré avec succès !
              </h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Votre Access Token :
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="font-mono text-sm break-all text-gray-800">
                    {accessToken}
                  </p>
                </div>
                
                <button
                  onClick={() => copyToClipboard(accessToken, 'token')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  {copied === 'token' ? <Check size={18} /> : <Copy size={18} />}
                  {copied === 'token' ? 'Copié !' : 'Copier le token'}
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Conservez ce token en sécurité. Ne le partagez jamais publiquement.
                </p>
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  setAuthCode('');
                  setAccessToken('');
                  setConfig({
                    clientId: '',
                    clientSecret: '',
                    shop: '',
                    scopes: DEFAULT_SCOPES
                  });
                  // Nettoyer le localStorage
                  localStorage.removeItem('shopify_oauth_config');
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Générer un nouveau token
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Instructions
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>1.</strong> Créez une app dans votre Shopify Partners Dashboard</p>
            <p><strong>2.</strong> Configurez l'App URL et Redirect URL avec : <code className="bg-gray-100 px-2 py-1 rounded">https://bobw-auth.vercel.app</code></p>
            <p><strong>3.</strong> Entrez vos identifiants (Client ID et Client Secret)</p>
            <p><strong>4.</strong> Cliquez sur "Autoriser sur Shopify"</p>
            <p><strong>5.</strong> Récupérez votre access token (shpat_...)</p>
          </div>
        </div>
      </div>
    </div>
  );
}