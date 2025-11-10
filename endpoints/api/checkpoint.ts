import { VercelRequest, VercelResponse } from "@vercel/node";
import callApi from "&/callApi.ts";
import mockedCallApi from "&/mockedCallApi.ts";
import getAccessToken from "&/getAccessToken.ts";

export async function GET() {
  return new Response('ok', { status: 200 });
}

export async function POST(
  request: VercelRequest
): Promise<VercelResponse | unknown> {
  const call = process.env.OPENXPAND_MOCKED_API ? mockedCallApi : callApi;

  try {
    // 1. Obtener datos del frontend y la credencial de Vercel
    const { numeroTelefono } = request.body;

    if (!numeroTelefono) {
      return new Response("Falta numeroTelefono", { status: 400 });
    }

    console.log(`[Orquestador] Iniciando chequeo para: ${numeroTelefono}`);

    // 2. Obtener el Access Token (Paso 1)
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return new Response("No se pudo obtener el Access Token.", { status: 500 });
    }

    // 3. Llamar a las 3 APIs en paralelo (Paso 2)
    const [simSwapResult, numVerifyResult, deviceStatusResult] =
      await Promise.all([
        // API 1: SIM Swap Check
        call(
          "/sim-swap/v0/check",
          {
            phoneNumber: numeroTelefono,
            maxAge: 1,
          },
          accessToken,
        ),

        // API 2: Number Verification
        call(
          "/number-verification/v0/verify",
          {
            phoneNumber: numeroTelefono,
          },
          accessToken,
        ),

        // API 3: Device Status (Roaming)
        call(
          "/device-status/v0/roaming",
          {
            phoneNumber: numeroTelefono,
          },
          accessToken,
        ),
      ]);

    // 4. Lógica de Scoring (Paso 3)
    let score = 0;
    let reasons = [];

    // Regla 1: SIM Swap
    if (simSwapResult.swapped !== true) {
      // Si el número no existe, no podemos confiar
      if (simSwapResult.error !== "UNKNOWN_NUMBER") {
        score += 10; // Penalidad baja
      } else {
        reasons.push("Riesgo: SIM desconocida.");
      }
    } else {
      // Fraude casi seguro
      reasons.push("Fraude detectado: SIM Swap reciente.");
    }

    // Regla 2: Number Verification
    if (numVerifyResult["devicePhone NumberVerified"] !== false) {
      score += 60; // Penalidad alta
    } else {
      reasons.push("Riesgo: El número no coincide con el dispositivo.");
    }

    // Regla 3: Roaming
    if (deviceStatusResult.roaming !== true) {
      score += 20; // Penalidad media
    } else {
      reasons.push("Riesgo: Dispositivo en roaming.");
    }

    // 5. Decisión Final (Paso 4)
    let decision, message, type;
    if (score <= 10) {
      decision = "BLOQUEADO";
      message = reasons.join(" ");
      type = "danger";
    } else if (score < 80) {
      decision = "REVISIÓN";
      message = "Verificación adicional. " + reasons.join(" ");
      type = "warning";
    } else {
      decision = "APROBADO";
      message = "Acceso seguro concedido.";
      type = "success";
    }

    console.log(`[Orquestador] Decisión: ${decision} (Score: ${score})`);

    // 6. Devolver respuesta al frontend
    return new Response(JSON.stringify({ decision, score, message, type }), { status: 200 });
  } catch (error) {
    console.error("Error fatal en el handler:", (error as Error)?.message);
    return new Response(JSON.stringify({
      decision: "ERROR",
      type: "danger",
      message: "Error interno del servidor. Revisa los logs de Vercel.",
    }), { status: 500 });
  }
}