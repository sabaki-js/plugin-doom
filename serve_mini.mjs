// serve_mini — navmodel4 ONNX servi depuis Node (onnxruntime-node + wordpiece sabaki).
// Usage: ONNX=/path/doom_nav.onnx VOCAB=/path/tokenizer.json node serve_mini.mjs [port]
import http from "http";
import fs from "fs";
import ort from "onnxruntime-node";
import { loadVocab, wordpieceEncode as encode } from "sabaki";

const ONNX = process.env.ONNX ?? "/kaggle/working/sabaki/models/navmodel4/doom_nav.onnx";
const VOCAB = process.env.VOCAB ?? "/kaggle/working/sabaki/tokenizer.json";
const CLASSES = JSON.parse(fs.readFileSync(new URL("./doom_nav.json", import.meta.url)));

const vocab = loadVocab(JSON.parse(fs.readFileSync(VOCAB, "utf8")));
const sess = await ort.InferenceSession.create(ONNX, { executionProviders: ["cpu"] });
console.log("mini chargé:", CLASSES.classes.join(","));

function decide(state) {
	const { ids, mask } = encode(state, vocab, 256);
	const tIds = new ort.Tensor("int64", BigInt64Array.from(ids.map(BigInt)), [1, ids.length]);
	const tMask = new ort.Tensor("int64", BigInt64Array.from(mask.map(BigInt)), [1, mask.length]);
	return sess.run({ input_ids: tIds, attention_mask: tMask }).then((out) => {
		const logits = Array.from(out.logits.data);
		const bi = logits.indexOf(Math.max(...logits));
		const max = Math.max(...logits);
		const exps = logits.map((s) => Math.exp(s - max));
		const sum = exps.reduce((a, b) => a + b, 0);
		return { decision: CLASSES.classes[bi], confidence: Math.round((exps[bi] / sum) * 1000) / 1000, domain: "doom" };
	});
}

const server = http.createServer((req, res) => {
	const json = (code, obj) => {
		res.writeHead(code, { "content-type": "application/json" });
		res.end(JSON.stringify(obj));
	};
	if (req.method === "GET" && req.url === "/health") return json(200, { status: "ok", domain: "doom", mode: "mini" });
	if (req.method === "POST" && req.url === "/v1/systemone") {
		let body = "";
		req.on("data", (c) => (body += c));
		req.on("end", async () => {
			try {
				const { state, questions } = JSON.parse(body);
				const answers = {};
				for (const [id, q] of Object.entries(questions ?? {})) {
					if (!q || (q.type !== "choice" && q.type !== "score" && q.type !== "noul"))
						return json(422, { error: `${id}: type invalide` });
					// Mini v0.3.0 : seule tête `command` (attack/exit/open_door).
					// target/weapon échoient command en attendant les têtes dédiées.
					const r = await decide(state);
					const probs = { [r.decision]: r.confidence };
					answers[id] =
						q.type === "noul"
							? { type: "noul", noul: r.decision === "attack" ? r.confidence : 1 - r.confidence }
							: { type: "choice", choice: r.decision, probabilities: probs, confidence: r.confidence };
				}
				return json(200, {
					model: "doom-mini-nav-v0.3.0",
					answers,
					usage: { input_tokens: String(state).length >> 2, output_tokens: 0 },
				});
			} catch (e) {
				json(400, { error: String(e?.message ?? e) });
			}
		});
		return;
	}
	if (req.method === "POST" && req.url === "/decide") {
		let body = "";
		req.on("data", (c) => (body += c));
		req.on("end", async () => {
			try {
				const { state } = JSON.parse(body);
				json(200, await decide(state));
			} catch (e) {
				json(400, { error: String(e?.message ?? e) });
			}
		});
		return;
	}
	json(404, { error: "usage: POST /decide {state}, GET /health" });
});

const port = Number(process.argv[2] ?? 8472);
server.listen(port, () => console.log(`serve_mini sur :${port}`));
