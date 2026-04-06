import "../../worker-configuration.d.ts";

// GET /api/cpi?key=api/v2/data/NCR/2024.json
export const onRequest: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	if (request.method !== "GET") {
		return new Response("Method not allowed", { status: 405 });
	}

	const url = new URL(request.url);
	const key = url.searchParams.get("key");

	if (!key || !key.startsWith("api/v2/")) {
		return new Response("Missing or invalid 'key' parameter", { status: 400 });
	}

	const object = await env.CPI_DATA.get(key);

	if (!object) {
		return new Response("Not found", { status: 404 });
	}

	const headers = new Headers();
	headers.set("Content-Type", "application/json");
	headers.set("Access-Control-Allow-Origin", "*");

	// Use the cache-control set during upload, or fall back to defaults
	if (object.httpMetadata?.cacheControl) {
		headers.set("Cache-Control", object.httpMetadata.cacheControl);
	}

	headers.set("ETag", object.httpEtag);

	return new Response(object.body, { headers });
};
