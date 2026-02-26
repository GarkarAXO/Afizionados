import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cp = searchParams.get('cp');

  console.log(`[Dipomex Proxy] Consultando CP: ${cp}`);

  if (!cp || cp.length !== 5) {
    return NextResponse.json({ error: true, message: 'CP debe tener 5 dígitos' }, { status: 400 });
  }

  const apiKey = process.env.DIPOMEX_APIKEY;

  if (!apiKey) {
    console.error('[Dipomex Proxy] ERROR: DIPOMEX_APIKEY no encontrada en variables de entorno');
    return NextResponse.json({ error: true, message: 'Error de configuración en servidor' }, { status: 500 });
  }

  try {
    const apiUrl = `https://api.tau.com.mx/dipomex/v1/codigo_postal?cp=${cp}`;
    console.log(`[Dipomex Proxy] Llamando a Tau API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: { 
        'APIKEY': apiKey,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const data = await response.json();
    console.log('[Dipomex Proxy] Respuesta de Tau API:', JSON.stringify(data));

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Dipomex Proxy] EXCEPTION:', error.message);
    return NextResponse.json({ error: true, message: 'Error de conexión con Dipomex' }, { status: 500 });
  }
}
