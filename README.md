<img src="https://raw.githubusercontent.com/sabaki-js/sabaki/main/assets/logo.svg" width="120" alt="sabaki logo" />

# @sabaki-js/doom

[![npm](https://img.shields.io/npm/v/%40sabaki-js%2Fdoom)](https://www.npmjs.com/package/%40sabaki-js%2Fdoom) [![license](https://img.shields.io/npm/l/%40sabaki-js%2Fdoom)](https://github.com/sabaki-js/plugin-doom#readme) [![CI](https://github.com/sabaki-js/plugin-doom/actions/workflows/test-battery.yml/badge.svg)](https://github.com/sabaki-js/plugin-doom/actions)

Doom decisions (navigation + combat arbitration).

Questions: `command`, `target`, `weapon`. Work in progress: nav MiniLM (MAP01) + vision policy (arena).

## Demo

`npm run demo` — the plugin decides on 3 canned MAP01 states (nano, no deps).

Full closed loop (JS decides, Python plays): `node serve_mini.mjs` + `python examples/drive_serve.py`.
The mini model (MiniLM + exit compass) finishes MAP01 — 4/6 EXIT:

![démo : le mini finit MAP01](https://github.com/sabaki-js/plugin-doom/raw/refs/heads/main/assets/demo_exit.mp4)

| mode | weights | closed loop |
|---|---|---|
| nano (TF-IDF, 112 terms) | `src/weights.json` | 0/6 |
| mini (MiniLM ONNX, CPU) | `sabaki-models` | 2–4/6 |

## Usage

```ts
import { Sabaki } from "sabaki";
import plugin from "@sabaki-js/doom";

const sabaki = new Sabaki().register(plugin.default ?? plugin);
const r = sabaki.decide({ state: "..." });
// { domain: "doom", decision: ..., confidence: ..., plugin: "@sabaki-js/doom" }
```

Ask another question with `input.question`.

Part of [sabaki](https://github.com/sabaki-js/sabaki) — see the [GUIDE](https://github.com/sabaki-js/sabaki/blob/main/GUIDE.md).

## License

MIT
