# @sabaki-js/plugin-template

Starter template for a [sabaki](https://github.com/sabaki-js/sabaki) plugin.
Click **Use this template**, rename the package, implement `classify` — done.

## Three ways to build a plugin

1. **Ad-hoc** (`definePlugin`) — no training, a function is enough.
2. **`nano`** (`nanoClassifier` + TF-IDF weights) — kilobytes, <1 ms, zero dependencies.
3. **`mini`** (`miniClassifier` + ONNX) — semantic understanding, ~20 ms.

See `src/index.ts` (commented examples) and `src/manifest.json` (annotated fields).

## Publish

```sh
npm version patch && npm run publish-package  # tags v* -> CI publishes to npm
```

## License

MIT
