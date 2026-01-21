const server = Bun.serve({
	port: 3000,
	async fetch(req) {
		const url = new URL(req.url);
		const path = `public${url.pathname}`;
		const file = Bun.file(path);

		if (await file.exists()) {
			return new Response(file);
		}
		return new Response("Not Found", { status: 404 });
	},
});

console.log(`API running at ${server.url}`);
