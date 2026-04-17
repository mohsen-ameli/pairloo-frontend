#!/bin/bash


ip=$(ip route get 1.2.3.4 | awk '{print $7}' | xargs)

sed -i "s|EXPO_PUBLIC_SERVER_URL=.*|EXPO_PUBLIC_SERVER_URL=\"http://$ip:8000\"|g" .env
sed -i "s|EXPO_PUBLIC_WS_SERVER_URL=.*|EXPO_PUBLIC_WS_SERVER_URL=\"ws://$ip:8000\"|g" .env

echo ":: Running on IP: $ip"
