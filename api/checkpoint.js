// Este es el archivo /api/checkpoint.js (tu backend en Vercel)
// ¡Importante! Necesitás 'node-fetch' v2 para este entorno
// Corré: npm install node-fetch@2

import fetch from 'node-fetch'; // Usamos la importación moderna

// Función helper (la misma de antes)
async function fetchOpenGateway(apiUrl, number, apiKey) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ phoneNumber: number })
    });
    if (!response.ok) throw new Error(`API call failed: ${apiUrl}`);
    return response.json();
}

// ---- El Handler Principal de tu API ----
// Vercel automáticamente convierte esto en un endpoint
export default async function handler(request, response) {
    
    // 1. Validar que sea un POST
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Solo se permite POST' });
    }

    // 2. Obtener datos y la API Key secreta (desde Vercel)
    const { numeroTelefono } = request.body;
    const API_KEY = process.env.OPEN_GATEWAY_KEY;

    // URLs de tus mocks (o las reales)
    const SIM_SWAP_URL = "https://TU_MOCK_URL.com/sim-swap/v1/check"; // <-- REEMPLAZAR
    const NUM_VERIFY_URL = "https://TU_MOCK_URL.com/number-verification/v1/check"; // <-- REEMPLAZAR
    const DEVICE_STATUS_URL = "https://TU_MOCK_URL.com/device-status/v1/check-roaming"; // <-- REEMPLAZAR

    try {
        // 3. Llamar a las APIs (la misma lógica de scoring)
        const [simSwapResult, numVerifyResult, deviceStatusResult] = await Promise.all([
            fetchOpenGateway(SIM_SWAP_URL, numeroTelefono, API_KEY),
            fetchOpenGateway(NUM_VERIFY_URL, numeroTelefono, API_KEY),
            fetchOpenGateway(DEVICE_STATUS_URL, numeroTelefono, API_KEY)
        ]);

        // 4. Lógica de Scoring (la misma de antes)
        let score = 100;
        let reasons = [];
        // (Aquí va tu lógica de if/else para 'simSwapResult', 'numVerifyResult', etc.)
        if (simSwapResult.changed === true) { score = 0; reasons.push('SIM Swap'); }
        if (numVerifyResult.match === false) { score -= 60; reasons.push('No Match'); }
        if (deviceStatusResult.roaming === true) { score -= 20; reasons.push('Roaming'); }

        // 5. Decisión Final (la misma de antes)
        let decision, message, type;
        if (score <= 10) {
            decision = 'BLOQUEADO'; message = 'Fraude detectado: ' + reasons.join(', '); type = 'danger';
        } else if (score < 80) {
            decision = 'REVISIÓN'; message = 'Verificación adicional. ' + reasons.join(', '); type = 'warning';
        } else {
            decision = 'APROBADO'; message = 'Acceso seguro concedido.'; type = 'success';
        }

        // 6. Devolver respuesta al frontend
        response.status(200).json({ decision, score, message, type });

    } catch (error) {
        console.error('Error en el orquestador:', error.message);
        response.status(500).json({ 
            decision: 'ERROR', 
            type: 'danger', 
            message: 'Error interno del servidor.' 
        });
    }
}