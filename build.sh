#!/bin/sh

set -e

OUTPUT_DIR=.vercel/output
INDEX_FUNCTION_DIR=${OUTPUT_DIR}/functions/api.func

#=============================================================================#
# Set up project
#=============================================================================#

rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

echo '{
  "version": 3
}' > "${OUTPUT_DIR}/config.json"

echo '[
  {
    "src": "^/api/checkpoint$",
    "dest": "functions/api.func"
  }
]' > "${OUTPUT_DIR}/routes.json"

#=============================================================================#
# Create server function
#=============================================================================#

pnpm install
pnpm run build:back
pnpm run build:front

mkdir -p "${INDEX_FUNCTION_DIR}"

echo '{
  "runtime": "node",
  "entrypoint": "checkpoint.mjs"
}' > "${INDEX_FUNCTION_DIR}/.vc-config.json"