// Template de plugin sabaki — 3 façons de créer un plugin, du plus simple au plus puissant.
//
// 1. À la volée (aucun entraînement) :
//    import { definePlugin } from "sabaki";
//    const plugin = definePlugin({
//      manifest,
//      classify: ({ state }) => ({ decision: "other", confidence: 0.5, domain: manifest.domain }),
//    });
//
// 2. Mode nano (poids TF-IDF embarqués, Ko, <1 ms) :
//    import { nanoClassifier } from "sabaki";
//    const plugin = nanoClassifier(manifest, weights); // weights: ModelWeights (voir train.py)
//
// 3. Mode mini (ONNX minilaya, ~87 Mo téléchargés au 1er usage, ~20 ms) :
//    import { miniClassifier } from "sabaki";
//    const plugin = await miniClassifier(manifest, "mon_workflow"); // + classifyAsync / decideAsync
import manifestData from "./manifest.json" with { type: "json" };
import type { PluginManifest, SabakiPlugin } from "sabaki";
import { definePlugin } from "sabaki";

const manifest = manifestData as PluginManifest;

const plugin: SabakiPlugin = definePlugin({
	manifest,
	classify: ({ state }) => ({
		// TODO: remplacez par votre logique (mots-clés, nanoClassifier, appel HTTP…).
		decision: state.length > 100 ? "long" : "short",
		confidence: 0.5,
		domain: manifest.domain,
	}),
});

export default plugin;
