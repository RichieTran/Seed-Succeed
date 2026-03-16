#!/usr/bin/env bash
set -e

# Install Node dependencies and build React frontend
npm install --legacy-peer-deps
npm run build

# Install Python dependencies
pip install -r backend/requirements.txt
