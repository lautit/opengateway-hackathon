//#region lib/callApi.ts
async function callApi_default(route, body, accessToken) {
	if (!process.env.OPENXPAND_API_BASE_URL) throw new Error("Invalid OPENXPAND_API_BASE_URL environment variable");
	const fullUrl = `${process.env.OPENXPAND_API_BASE_URL}${route}`;
	try {
		const response = await fetch(fullUrl, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body)
		});
		if (!response.ok) {
			const errorData = await response.json();
			console.warn(`API ${route} falló:`, errorData);
			if (response.status === 404) return {
				error: "UNKNOWN_NUMBER",
				status: 404
			};
			throw new Error(`API ${route} devolvió ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error(`Error fatal en callApi (${route}):`, error);
		throw error;
	}
}

//#endregion
//#region lib/mockedCallApi.ts
async function mockedCallApi_default(route, body, _accessToken) {
	const phoneNumberStr = body.phoneNumber.toString();
	const endsWith = (suffix) => phoneNumberStr.endsWith(suffix);
	if (route === "/sim-swap/v0/check") {
		if (endsWith("111")) return { swapped: true };
		return { swapped: false };
	}
	if (route === "/number-verification/v0/verify") {
		if (endsWith("222")) return { devicePhoneNumberVerified: false };
		return { devicePhoneNumberVerified: true };
	}
	if (route === "/device-status/v0/roaming") {
		if (endsWith("333")) return { roaming: true };
		return { roaming: false };
	}
}

//#endregion
//#region lib/getAccessToken.ts
async function getAccessToken_default() {
	if (!process.env.OPENGATEWAY_API_SCOPES) throw new Error("Invalid OPENGATEWAY_API_SCOPES environment variable");
	if (!process.env.OPENXPAND_TOKEN_URL) throw new Error("Invalid OPENXPAND_TOKEN_URL environment variable");
	if (!process.env.OPENGATEWAY_CLIENT_ID) throw new Error("Invalid OPENGATEWAY_CLIENT_ID environment variable");
	if (!process.env.OPENGATEWAY_CLIENT_SECRET) throw new Error("Invalid OPENGATEWAY_CLIENT_SECRET environment variable");
	const bodyParams = new URLSearchParams();
	bodyParams.append("grant_type", "client_credentials");
	bodyParams.append("scope", process.env.OPENGATEWAY_API_SCOPES);
	try {
		const response = await fetch(process.env.OPENXPAND_TOKEN_URL, {
			method: "POST",
			headers: {
				Authorization: `Basic ${Buffer.from(`${process.env.OPENGATEWAY_CLIENT_ID}:${process.env.OPENGATEWAY_CLIENT_SECRET}`).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: bodyParams
		});
		if (!response.ok) {
			console.error("Error al obtener token:", await response.text());
			throw new Error("Fallo de autenticación con el proveedor de API");
		}
		return (await response.json())?.access_token;
	} catch (error) {
		console.error("Error fatal en getAccessToken:", error);
		throw error;
	}
}

//#endregion
//#region endpoints/api/checkpoint.ts
async function handler(request, response) {
	const call = process.env.OPENXPAND_MOCKED_API ? mockedCallApi_default : callApi_default;
	try {
		const { numeroTelefono } = request.body;
		if (!numeroTelefono) return response.status(400).json({ message: "Falta numeroTelefono" });
		console.log(`[Orquestador] Iniciando chequeo para: ${numeroTelefono}`);
		const accessToken = await getAccessToken_default();
		if (!accessToken) return response.status(403).json({ message: "No se pudo obtener el Access Token." });
		const [simSwapResult, numVerifyResult, deviceStatusResult] = await Promise.all([
			call("/sim-swap/v0/check", {
				phoneNumber: numeroTelefono,
				maxAge: 1
			}, accessToken),
			call("/number-verification/v0/verify", { phoneNumber: numeroTelefono }, accessToken),
			call("/device-status/v0/roaming", { phoneNumber: numeroTelefono }, accessToken)
		]);
		let score = 0;
		let reasons = [];
		if (simSwapResult.swapped !== true) if (!!simSwapResult.error || simSwapResult.error !== "UNKNOWN_NUMBER") score += 10;
		else reasons.push("Riesgo: SIM desconocida.");
		else reasons.push("Fraude detectado: SIM Swap reciente.");
		if (numVerifyResult["devicePhone NumberVerified"] !== false) score += 60;
		else reasons.push("Riesgo: El número no coincide con el dispositivo.");
		if (deviceStatusResult.roaming !== true) score += 20;
		else reasons.push("Riesgo: Dispositivo en roaming.");
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
		return response.status(200).json({
			decision,
			score,
			message,
			type
		});
	} catch (error) {
		console.error("Error fatal en el handler:", error?.message);
		return response.status(500).json({
			decision: "ERROR",
			type: "danger",
			message: "Error interno del servidor. Revisa los logs de Vercel."
		});
	}
}

//#endregion
export { handler as default };