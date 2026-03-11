#!/bin/bash
set -e

MODE="${1:-deploy}"

# Move to the website directory (where this script lives)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables (line-by-line to handle special characters)
if [ -f .env ]; then
  while IFS='=' read -r key value; do
    [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
    export "$key=$value"
  done < .env
else
  echo "Error: .env file not found in website directory"
  exit 1
fi

if [ -z "$SFTP_PASS" ]; then
  echo "Error: SFTP_PASS is not set in .env"
  exit 1
fi

PORT="${SFTP_PORT:-22}"

if [ "$MODE" = "--test" ] || [ "$MODE" = "test" ]; then
  echo "Running SFTP connection test to ${SFTP_HOST}:${PORT} as ${SFTP_USER}..."
  lftp -c "
    set sftp:connect-program 'ssh -o StrictHostKeyChecking=accept-new -p ${PORT}';
    open -u ${SFTP_USER},'${SFTP_PASS}' sftp://${SFTP_HOST};
    pwd;
    ls;
    quit
  "
  echo "SFTP test complete."
  exit 0
fi

echo "Building static site (webpack in website/)..."
npm run build

if [ ! -d "dist" ]; then
  echo "Error: 'dist' directory not found. Make sure webpack.common.js has the correct output path."
  exit 1
fi

echo "Uploading 'dist' to ${SFTP_HOST}:${SFTP_REMOTE_DIR}..."

# Use lftp for recursive SFTP upload without deleting extra remote files
lftp -c "
  set sftp:connect-program 'ssh -o StrictHostKeyChecking=accept-new -p ${PORT}';
  open -u ${SFTP_USER},'${SFTP_PASS}' sftp://${SFTP_HOST};
  mirror --reverse --verbose dist/ ${SFTP_REMOTE_DIR}/;
  quit
"

echo "Deploy complete!"

