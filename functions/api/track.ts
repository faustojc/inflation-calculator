/// <reference path="../../worker-configuration.d.ts" />

export const onRequest: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	const country = request.cf?.country || "Unknown";
	const region = request.cf?.region || "Unknown";
	const city = request.cf?.city || "Unknown";

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
