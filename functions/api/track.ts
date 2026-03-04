import "../../worker-configuration.d.ts";

export const onRequest: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	let country = (request.cf?.country as string) || "Unknown";
	let region = (request.cf?.region as string) || "Unknown";
	let city = (request.cf?.city as string) || "Unknown";

	const contentType = request.headers.get("content-type");
	if (contentType?.includes("application/json")) {
		request
			.clone()
			.json<{ country?: string; region?: string; city?: string }>()
			.then((body) => {
				if (body?.country) country = body.country;
				if (body?.region) region = body.region;
				if (body?.city) city = body.city;
			});
	}

	context.waitUntil(
		(async () => {
			try {
				await env.DB.prepare(`INSERT INTO visitor_logs (country, region, city) VALUES (?, ?, ?)`)
					.bind(country, region, city)
					.run();
			} catch (err) {
				console.error("Failed to log visit:", err);
			}
		})(),
	);

	return new Response(JSON.stringify({ success: true }), {
		headers: { "Content-Type": "application/json" },
	});
};
