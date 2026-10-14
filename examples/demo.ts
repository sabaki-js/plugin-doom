/** Demo: the doom plugin decides on canned MAP01 states (nano, no deps). */
import plugin from "../src/index.js";

const STATES: Array<[string, string]> = [
	["spawn, porte fermée devant", "t=2.4s HP 100 armor 0 weapon 2 ammo 50 kills 0\ncurrent tactic: explore, held 0.0s\nenemies: none\nitems: none\nwalls: ahead 6.6m left 5.6m right 4.6m\ndoor: closed 9.9m bearing -6\nleast explored: ahead\nrecent tactics: \nbearing: negative left, positive right\nexit: 478.8m bearing -105"],
	["combat, ennemi proche", "t=40.0s HP 82 armor 0 weapon 2 ammo 30 kills 5\ncurrent tactic: exit, held 0.0s\nenemies: Imp 120.0m bearing +10\nitems: none\nwalls: ahead 8.1m left 5.0m right 4.2m\ndoor: none visible\nleast explored: right\nrecent tactics: exit\nexit: 620.0m bearing -40"],
	["couloir libre vers la sortie", "t=90.0s HP 60 armor 0 weapon 2 ammo 12 kills 9\ncurrent tactic: exit, held 0.0s\nenemies: none\nitems: none\nwalls: ahead 20.0m left 6.0m right 6.0m\ndoor: none visible\nleast explored: ahead\nrecent tactics: attack, exit\nexit: 142.0m bearing +5"],
];

for (const [label, state] of STATES) {
	const r = plugin.classify({ state });
	console.log(`${label} -> ${r.decision} (${r.confidence}) [${r.domain}]`);
}
