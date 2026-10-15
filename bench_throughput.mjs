// Débit décisions/s (nano et/ou mini) - CPU, 1 thread.
// Usage: node bench_throughput.mjs [nano|mini|all] [iters]
import fs from "fs";

const sabaki = await import("sabaki");
const mode = process.argv[2] ?? "all";
const iters = Number(process.argv[3] ?? 200);
const STATE = "t=40.0s HP 82 armor 0 weapon 2 ammo 30 kills 5\ncurrent tactic: exit, held 0.0s\nenemies: Imp 120.0m bearing +10\nitems: none\nwalls: ahead 8.1m left 5.0m right 4.2m\ndoor: none visible\nleast explored: right\nrecent tactics: exit\nexit: 620.0m bearing -40";

if (mode === "nano" || mode === "all") {
	const plugin = (await import("~/sabaki-js/plugin-doom/dist/index.js").catch(() => null))
		?? (await import("/kaggle/working/doom_serve/dist/index.js").catch(() => null));
	const P = plugin.default ?? plugin;
	P.classify({ state: STATE }); // chauffe
	const t0 = performance.now();
	for (let i = 0; i < iters; i++) P.classify({ state: STATE });
	const dt = (performance.now() - t0) / 1000;
	console.log(`nano: ${iters} décisions en ${dt.toFixed(2)}s = ${(iters / dt).toFixed(0)} req/s (${(dt / iters * 1000).toFixed(2)} ms/req)`);
}

if (mode === "mini" || mode === "all") {
	const ort = (await import("onnxruntime-node").catch(() => null));
	if (!ort) {
		console.log("mini: onnxruntime-node absent");
	} else {
		const onnx = process.env.ONNX ?? "/tmp/sabaki_local/doom_nav.onnx";
		const vocabP = process.env.VOCAB ?? "/tmp/sabaki_local/tokenizer.json";
		const classes = JSON.parse(fs.readFileSync(new URL("./doom_nav.json", import.meta.url))).classes;
		const vocab = sabaki.loadVocab(JSON.parse(fs.readFileSync(vocabP, "utf8")));
		const sess = await ort.default.InferenceSession.create(onnx, { executionProviders: ["cpu"] });
		const run = async () => {
			const { ids, mask } = sabaki.wordpieceEncode(STATE, vocab, 256);
			const out = await sess.run({
				input_ids: new ort.default.Tensor("int64", BigInt64Array.from(ids.map(BigInt)), [1, ids.length]),
				attention_mask: new ort.default.Tensor("int64", BigInt64Array.from(mask.map(BigInt)), [1, mask.length]),
			});
			return classes[out.logits.data.indexOf(Math.max(...out.logits.data))];
		};
		await run(); // chauffe
		const t0 = performance.now();
		for (let i = 0; i < iters; i++) await run();
		const dt = (performance.now() - t0) / 1000;
		console.log(`mini: ${iters} décisions en ${dt.toFixed(2)}s = ${(iters / dt).toFixed(1)} req/s (${(dt / iters * 1000).toFixed(1)} ms/req)`);
	}
}
