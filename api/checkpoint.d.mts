import { VercelRequest } from "@vercel/node";

//#region endpoints/api/checkpoint.d.ts
declare function handler(request: VercelRequest): Promise<Response | unknown>;
//#endregion
export { handler as default };