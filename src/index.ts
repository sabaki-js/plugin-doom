/**
 * @sabaki-js/doom — sabaki plugin for the `doom` domain.
 *
 * Bundled `nano` mode (TF-IDF weights, <1 ms, zero dependencies).
 * Decides the high-level command (`attack`/`exit`/`open_door`) from a
 * text game state; a scripted executor (A* + waypoints, see sabaki/gpu/doom)
 * turns the command into Doom inputs. The state should include an
 * `exit: <dist>m bearing <±deg>` compass line — without it the classifier
 * cannot navigate (see REPORT).
 */
import {
	predict,
	type ClassifyOutput,
	type ModelWeights,
	type PluginManifest,
	type SabakiInput,
	type SabakiPlugin,
} from "sabaki";
import manifestData from "./manifest.json" with { type: "json" };
import weightsData from "./weights.json" with { type: "json" };

const manifest = manifestData as PluginManifest;
const weights = weightsData as ModelWeights;
/** Question principale = première du manifest (précisions mesurées : voir REPORT). */
const PRIMARY = manifest.primary ?? manifest.questions[0]!;

function classify(input: SabakiInput): ClassifyOutput {
	const q =
		input.question && weights.questions[input.question]
			? input.question
			: PRIMARY;
	const r = predict(input.state, weights, q);
	return {
		decision: r.decision,
		confidence: r.confidence,
		domain: manifest.domain,
	};
}

const plugin: SabakiPlugin = { manifest, classify };
export default plugin;
