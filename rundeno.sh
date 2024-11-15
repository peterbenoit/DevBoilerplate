#!/bin/bash

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo "Deno is not installed. Installing Deno..."
    curl -fsSL https://deno.land/x/install/install.sh | sh
    export DENO_INSTALL="$HOME/.deno"
    export PATH="$DENO_INSTALL/bin:$PATH"
else
    echo "Deno is installed. Checking for updates..."
    deno upgrade
fi

# Check if npm (and Node.js) is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Installing Node.js and npm..."

    # Install Node.js using NVM (Node Version Manager)
    if ! command -v nvm &> /dev/null; then
        # Install nvm if not already installed
        echo "nvm (Node Version Manager) not found. Installing nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

        # Load nvm into the current shell session
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi

    # Install the latest Node.js version using nvm
    nvm install node
    nvm use node
else
    echo "npm is installed."
fi

# Run the setup-project.ts script
deno run --allow-net --allow-env --allow-run=git,npx,npm --allow-read setup-project.ts
