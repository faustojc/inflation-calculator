import { createClient } from "@libsql/client";

const turso = createClient({
	url: "file:cpi-database.db",
	// syncUrl: Bun.env.TURSO_DB_URL,
	// authToken: Bun.env.TURSO_AUTH_TOKEN,
	// syncInterval: 60,
});

await turso.executeMultiple(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
`);

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

const server = Bun.serve({
	port: 3000,
	async fetch(req) {
		const url = new URL(req.url);

		if (req.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		if (url.pathname === "/api/metadata" && req.method === "GET") {
			try {
				const results = await turso.batch(
					[
						"SELECT code, name FROM regions ORDER BY code", // 1. Regions
						`SELECT l.name as name, r.code as region_code
						FROM locations l
						JOIN regions r ON l.region_id = r.id
						ORDER BY l.name`, // 2. Provinces
						"SELECT MIN(year) as min_year, MAX(year) as max_year FROM cpi_values", // 3. Years
					],
					"read"
				);

				const regions = results[0].rows;
				const provinces = results[1].rows;
				const yearRange = results[2].rows[0];

				return Response.json({ regions, provinces, yearRange }, { headers: corsHeaders });
			} catch (e) {
				return new Response(String(e), { status: 500, headers: corsHeaders });
			}
		}

		if (url.pathname === "/api/commodities" && req.method === "GET") {
			try {
				const result = await turso.execute("SELECT code, name, parent_code FROM commodity_defs ORDER BY code ASC");
				return Response.json(result.rows, { headers: corsHeaders });
			} catch (e) {
				return new Response(String(e), { status: 500, headers: corsHeaders });
			}
		}

		if (url.pathname === "/api/cpi-batch" && req.method === "POST") {
			try {
				const body = await req.json();
				const { regionCode, provinceName, dates, codes } = body;

				if (!regionCode || !dates || !codes || !Array.isArray(codes)) {
					return new Response("Invalid Payload", { status: 400, headers: corsHeaders });
				}

				const codesToFetch = [...new Set([...codes, "01"])];
				const placeholders = codesToFetch.map(() => "?").join(",");

				// Filter by requested Codes
				// Filter by Start OR End Date
				// Filter by (Specific Region OR National 'PH') -> For fallback logic
				// Filter by (Specific Province OR No Location) -> For fallback logic

				const query = `
					SELECT
						val.year as y, val.month as m,
						CASE WHEN l.name IS NOT NULL THEN ? ELSE r.code END as r,
						c.code as c,
						val.cpi_value as v
					FROM cpi_values val
					JOIN regions r ON val.region_id = r.id
					LEFT JOIN locations l ON val.location_id = l.id
					JOIN commodity_defs c ON val.commodity_code = c.code
					WHERE
						c.code IN (${placeholders})
						AND (
						(val.year = ? AND val.month = ?) OR
						(val.year = ? AND val.month = ?)
						)
						AND ((r.code = ? AND (l.name = ? OR val.location_id IS NULL)) OR r.code = 'PH')
				`;

				const args = [
					provinceName || regionCode,
					...codesToFetch, //  Codes
					dates.startYear,
					dates.startMonth,
					dates.endYear,
					dates.endMonth,
					regionCode,
					provinceName,
				];

				const results = await turso.execute({ sql: query, args });

				return Response.json(results.rows, { headers: corsHeaders });
			} catch (e) {
				console.error(e);
				return new Response("Server Error", { status: 500, headers: corsHeaders });
			}
		}

		// MANUAL SYNC
		if (url.pathname === "/api/sync" && req.method === "POST") {
			try {
				console.log("Starting Sync...");
				await turso.sync();
				console.log("Sync Complete");
				return Response.json({ status: "synced" }, { headers: corsHeaders });
			} catch (e) {
				console.error("Sync Failed", e);
				return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
			}
		}

		return new Response("Not Found", { status: 404, headers: corsHeaders });
	},
});

console.log(`API running at ${server.url}`);
