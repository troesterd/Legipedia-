#!/bin/bash

# Create public directory structure
mkdir -p /home/vm/legipedia/public/data/laws

# Run the script to split the laws data
node /home/vm/legipedia/scripts/split-laws.js

echo "Data files processed and copied to public directory"
echo "Laws have been split into separate content files"
