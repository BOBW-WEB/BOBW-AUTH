// app/api/shopify/token/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ShopifyTokenRequest {
  client_id: string;
  client_secret: string;
  code: string;
  shop: string;
}

interface ShopifyTokenResponse {
  access_token: string;
  scope: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ShopifyTokenRequest = await request.json();
    const { client_id, client_secret, code, shop } = body;

    // Validation des paramètres requis
    if (!client_id || !client_secret || !code || !shop) {
      return NextResponse.json(
        { error: 'Paramètres manquants : client_id, client_secret, code et shop sont requis' },
        { status: 400 }
      );
    }

    // Normaliser le nom du shop
    const shopDomain = shop.includes('.myshopify.com') 
      ? shop 
      : `${shop}.myshopify.com`;

    // Appel direct à Shopify depuis le serveur (pas de proxy CORS nécessaire)
    const shopifyUrl = `https://${shopDomain}/admin/oauth/access_token`;

    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code
      })
    });

    // Gestion des erreurs de Shopify
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Shopify:', errorText);
      
      return NextResponse.json(
        { 
          error: `Erreur Shopify (${response.status})`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data: ShopifyTokenResponse = await response.json();

    // Vérification que le token a bien été reçu
    if (!data.access_token) {
      return NextResponse.json(
        { error: 'Token non reçu dans la réponse de Shopify' },
        { status: 500 }
      );
    }

    // Retourner le token au frontend
    return NextResponse.json({
      access_token: data.access_token,
      scope: data.scope
    });

  } catch (error) {
    console.error('Erreur lors de l\'échange du token:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors de l\'échange du code',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
