#!/bin/bash

# Check if Deno is installed
if ! command -v deno &> /dev/null
then
    echo "Deno is not installed. Installing Deno..."
    curl -fsSL https://deno.land/x/install/install.sh | sh
    export DENO_INSTALL="$HOME/.deno"
    export PATH="$DENO_INSTALL/bin:$PATH"
else
    echo "Deno is installed. Checking for updates..."
    deno upgrade
fi

# Run the setup-project.ts script
deno run --allow-net --allow-env --allow-run=git,npx,npm --allow-read setup-project.ts
