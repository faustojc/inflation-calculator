// Cloudflare Pages only: serves api/v3/* from the cpi-data R2 bucket, which
// psa-cpi-uploader writes. Functions take precedence over the static
// public/api copy, so the NAS build is unaffected.

interface R2Object {
	httpEtag: string;
	body?: ReadableStream;
}

interface Env {
	CPI_DATA: {
		get(key: string, options?: { onlyIf?: Headers }): Promise<R2Object | null>;
	};
	ASSETS: { fetch(request: Request): Promise<Response> };
}

interface Context {
	request: Request;
	env: Env;
	params: { path?: string[] };
}

export async function onRequestGet({ request, env, params }: Context): Promise<Response> {
	const key = `api/v3/${(params.path ?? []).join("/")}`;
	const obj = await env.CPI_DATA.get(key, { onlyIf: request.headers });
	// Not in R2 (e.g. commodities.json, which the uploader doesn't write):
	// serve the bundled public/api copy. _redirects makes a miss there 404.
	if (!obj) return env.ASSETS.fetch(request);

	// Filenames aren't versioned per publish, so keep the shared cache short;
	// the client versions its own cache by metadata.generated_at.
	const headers = new Headers({
		"content-type": "application/json",
		etag: obj.httpEtag,
		"cache-control": "public, max-age=300",
	});
	// No body means the If-None-Match precondition matched.
	return obj.body ? new Response(obj.body, { headers }) : new Response(null, { status: 304, headers });
}
