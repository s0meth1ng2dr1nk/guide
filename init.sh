#!/bin/bash
set -euox pipefail

BASE=$(cd $(dirname "${BASH_SOURCE[0]:-0}") && pwd -P)
cd "${BASE}"

cat << EOF > /etc/systemd/system/guide.service
[Unit]
Description=Guide Node App
After=network.target

[Service]
WorkingDirectory=${BASE}

ExecStart=$(command -v pnpm) run start

Restart=always
RestartSec=3

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sops -d .sops.env > .env

pnpm install

systemctl daemon-reload
systemctl enable guide
systemctl start guide
