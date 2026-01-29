#!/bin/bash

ip=$(ip route get 1.2.3.4 | awk '{print $7}' | xargs)

cat > .env<< EOF
EXPO_PUBLIC_SERVER_URL="http://$ip:8000"
EXPO_PUBLIC_WS_SERVER_URL="ws://$ip:8000"
EOF


echo ":: Running on IP: $ip"
