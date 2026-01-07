import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function ShopifyOAuthApp() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    shop: '',
    scopes: 'read_products,write_products,read_orders'
  });
  const [authCode, setAuthCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text: string , field: React.SetStateAction<string>) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const generateOAuthUrl = () => {
    if (!config.clientId || !config.shop) {
      setError('Client ID et Shop sont requis');
      return '';
    }
    
    const shopDomain = config.shop.includes('.myshopify.com') 
      ? config.shop 
      : `${config.shop}.myshopify.com`;
    
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    return `https://${shopDomain}/admin/oauth/authorize?client_id=${config.clientId}&scope=${config.scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const exchangeCodeForToken = async () => {
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

      const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
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
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAccessToken(data.access_token);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'échange du code');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const shop = urlParams.get('shop');
    
    if (code) {
      setAuthCode(code);
      if (shop) setConfig(prev => ({ ...prev, shop }));
      setStep(3);
    }
  };

  React.useEffect(() => {
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scopes
                </label>
                <input
                  type="text"
                  value={config.scopes}
                  onChange={(e) => setConfig({...config, scopes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="read_products,write_products"
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
                    scopes: 'read_products,write_products,read_orders'
                  });
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
            <p><strong>2.</strong> Configurez l'App URL et Redirect URL avec l'URL de cette page</p>
            <p><strong>3.</strong> Entrez vos identifiants (Client ID et Client Secret)</p>
            <p><strong>4.</strong> Cliquez sur "Autoriser sur Shopify"</p>
            <p><strong>5.</strong> Récupérez votre access token (shpat_...)</p>
          </div>
        </div>
      </div>
    </div>
  );
}