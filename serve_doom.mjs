// serve_doom — le plugin @sabaki-js/doom décide en JS (HTTP), le client Python joue.
// Usage: node serve_doom.mjs [port]  (POST /decide {"state": "..."} -> {"decision", "confidence"})
import http from "http";

const plugin = (await import("./src/index.ts").catch(() => null))
	?? (await import("./dist/index.js"));
const P = plugin.default ?? plugin;

const server = http.createServer((req, res) => {
	const json = (code, obj) => {
		res.writeHead(code, { "content-type": "application/json" });
		res.end(JSON.stringify(obj));
	};
	if (req.method === "GET" && req.url === "/health") return json(200, { status: "ok", domain: "doom" });
	if (req.method === "POST" && req.url === "/decide") {
		let body = "";
		req.on("data", (c) => (body += c));
		req.on("end", () => {
			try {
				const { state } = JSON.parse(body);
				const r = P.classify({ state });
				json(200, { decision: r.decision, confidence: r.confidence, domain: r.domain });
			} catch (e) {
				json(400, { error: String(e?.message ?? e) });
			}
		});
		return;
	}
	json(404, { error: "usage: POST /decide {state}, GET /health" });
});

const port = Number(process.argv[2] ?? 8471);
server.listen(port, () => console.log(`serve_doom sur :${port}`));
