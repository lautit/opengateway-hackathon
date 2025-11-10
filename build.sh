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
    "methods": ["POST"],
    "dest": "functions/api.func"
  }
]' > "${OUTPUT_DIR}/routes.json"

#=============================================================================#
# Create server function
#=============================================================================#

pnpm install
pnpm build

mkdir -p "${INDEX_FUNCTION_DIR}"

echo '{
  "runtime": "node",
  "entrypoint": "checkpoint.mjs",
  "envVarsInUse": [
    "OPENXPAND_MOCKED_API",
    "OPENXPAND_API_BASE_URL",
    "OPENXPAND_TOKEN_URL",
    "OPENGATEWAY_API_SCOPES",
    "OPENGATEWAY_CLIENT_SECRET",
    "OPENGATEWAY_CLIENT_ID"
  ]
}' > "${INDEX_FUNCTION_DIR}/.vc-config.json"