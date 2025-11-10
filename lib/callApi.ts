export type Body = {
  device?: object;
  phoneNumber?: number | string;
  maxAge?: number;
};

export default async function (route: string, body: Body, accessToken: string) {
  if (!process.env.OPENXPAND_API_BASE_URL) {
    throw new Error("Invalid OPENXPAND_API_BASE_URL environment variable");
  }

  const fullUrl = `${process.env.OPENXPAND_API_BASE_URL as string}${route}`;

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn(`API ${route} no devolvio OK:`, errorData);

      // Si el número no existe, lo tratamos como "indefinido"
      if (response.status === 404) {
        return { error: "UNKNOWN_NUMBER", status: 404 };
      }

      console.error(`API ${route} devolvió ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fatal en callApi (${route}):`, error);
    throw error;
  }
}
