export default async function () {
  if (!process.env.OPENGATEWAY_API_SCOPES) {
    throw new Error("Invalid OPENGATEWAY_API_SCOPES environment variable");
  }

  if (!process.env.OPENXPAND_TOKEN_URL) {
    throw new Error("Invalid OPENXPAND_TOKEN_URL environment variable");
  }

  if (!process.env.OPENGATEWAY_CLIENT_ID) {
    throw new Error("Invalid OPENGATEWAY_CLIENT_ID environment variable");
  }

  if (!process.env.OPENGATEWAY_CLIENT_SECRET) {
    throw new Error("Invalid OPENGATEWAY_CLIENT_SECRET environment variable");
  }

  // El body debe estar en formato x-www-form-urlencoded
  const bodyParams = new URLSearchParams();
  bodyParams.append("grant_type", "client_credentials");
  bodyParams.append("scope", process.env.OPENGATEWAY_API_SCOPES as string);

  try {
    const response = await fetch(process.env.OPENXPAND_TOKEN_URL as string, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.OPENGATEWAY_CLIENT_ID}:${process.env.OPENGATEWAY_CLIENT_SECRET}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams,
    });

    if (!response.ok) {
      console.error("Error al obtener token:", await response.text());
      throw new Error("Fallo de autenticación con el proveedor de API");
    }

    const data = await response.json();
    return data?.access_token;
  } catch (error) {
    console.error("Error fatal en getAccessToken:", error);
    throw error;
  }
}
