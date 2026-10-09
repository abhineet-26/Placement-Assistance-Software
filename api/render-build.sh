#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed database
python seed_script.py
