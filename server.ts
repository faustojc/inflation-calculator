import { Database } from "bun:sqlite";

const db = new Database("./cpi-database.db");

db.query("PRAGMA journal_mode = WAL;").run();
db.query("PRAGMA synchronous = NORMAL;").run();

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
			const regions = db.query("SELECT code, name FROM regions ORDER BY code").all();
			const provinces = db
				.query(
					`
					SELECT l.name as name, r.code as region_code
					FROM locations l
					JOIN regions r ON l.region_id = r.id
					ORDER BY l.name
				`
				)
				.all();
			const yearRange = db.query(`SELECT MIN(year) as min_year, MAX(year) as max_year FROM cpi_values`).get();

			return Response.json({ regions, provinces, yearRange }, { headers: corsHeaders });
		}

		if (url.pathname === "/api/commodities" && req.method === "GET") {
			const commodities = db.query("SELECT code, name, parent_code FROM commodity_defs ORDER BY code ASC").all();
			return Response.json(commodities, { headers: corsHeaders });
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

				const params = [
					provinceName || regionCode,
					...codesToFetch,
					dates.startYear,
					dates.startMonth,
					dates.endYear,
					dates.endMonth,
					regionCode,
					provinceName,
				];

				const results = db.query(query).all(...params);
				return Response.json(results, { headers: corsHeaders });
			} catch (e) {
				console.error(e);
				return new Response("Server Error", { status: 500, headers: corsHeaders });
			}
		}

		return new Response("Not Found", { status: 404, headers: corsHeaders });
	},
});

console.log(`API running at ${server.url}`);
