import { VercelRequest, VercelResponse } from "@vercel/node";

//#region endpoints/api/checkpoint.d.ts
declare function handler(request: VercelRequest, response: VercelResponse): Promise<Response | unknown>;
//#endregion
export { handler as default };