<img src="https://raw.githubusercontent.com/sabaki-js/sabaki/main/assets/logo.svg" width="120" alt="sabaki logo" />

# @sabaki-js/doom

[![npm](https://img.shields.io/npm/v/%40sabaki-js%2Fdoom)](https://www.npmjs.com/package/%40sabaki-js%2Fdoom) [![license](https://img.shields.io/npm/l/%40sabaki-js%2Fdoom)](https://github.com/sabaki-js/plugin-doom#readme) [![CI](https://github.com/sabaki-js/plugin-doom/actions/workflows/test-battery.yml/badge.svg)](https://github.com/sabaki-js/plugin-doom/actions)

Doom decisions (navigation + combat arbitration).

Questions: `command`, `target`, `weapon`. Work in progress: nav MiniLM (MAP01) + vision policy (arena).

## Demo

`npm run demo` — the plugin decides on 3 canned MAP01 states (nano, no deps).

The mini model (MiniLM + exit compass) finishes MAP01 — 4/6 EXIT:

![démo : le mini finit MAP01](assets/demo_full.gif)

| mode | weights | closed loop |
|---|---|---|
| nano (TF-IDF, 112 terms) | `src/weights.json` | 0/6 |
| mini (MiniLM ONNX, CPU) | `sabaki-models` | 2–4/6 |

## Run your own demo

The classifier runs in Node, the game in Python (VizDoom). The JS server
decides, the Python client plays — one HTTP call per game tick.

```sh
# 1. game + model stack (Python)
pip install vizdoom gymnasium pygame onnxruntime
git clone https://github.com/azalio/doomLaya /tmp/doomlaya

# 2. mini weights (~90 MB) + tokenizer
# from https://github.com/sabaki-js/sabaki-models/releases (doom_nav.onnx)
export ONNX=/path/to/doom_nav.onnx VOCAB=/path/to/tokenizer.json

# 3. JS decision server (needs sabaki@>=1.0.1 + onnxruntime-node)
npm i sabaki@1.0.1 onnxruntime-node
node serve_mini.mjs 8472

# 4. play one episode (second terminal)
DOOM_SERVE=http://localhost:8472 python examples/drive_serve.py 1
```

`serve_doom.mjs` serves the nano classifier instead (faster, weaker: 0/6 —
it decides well on single states but cannot navigate a full level).

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
