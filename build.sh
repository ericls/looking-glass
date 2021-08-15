#!/usr/bin/env bash

(cd client; npm run build)
echo "Building for linux"
deno run --allow-all --unstable --no-check leaf.ts -- --target x86_64-unknown-linux-gnu
mv dist/looking_glass dist/looking_glass.linux
echo "Building for mac(intel)"
deno run --allow-all --unstable --no-check leaf.ts -- --target x86_64-apple-darwin
mv dist/looking_glass dist/looking_glass.mac