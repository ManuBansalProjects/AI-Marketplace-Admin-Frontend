#!/bin/bash

echo "Starting MongoDB API Server..."
node server/index.js &
SERVER_PID=$!

echo "Waiting for backend server to initialize..."
sleep 3

echo "Starting Vite Frontend..."
npm run dev &
VITE_PID=$!

wait $SERVER_PID $VITE_PID
