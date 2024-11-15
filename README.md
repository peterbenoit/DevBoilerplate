# Project Automation Script

Welcome! 🎉 This script is designed to streamline your project setup by automating everything from creating a new GitHub repository to initializing a project with your preferred JavaScript and CSS frameworks. Whether you're a fan of Angular, React, Vue, or Svelte, and prefer Tailwind, Bootstrap, or Bulma for styling, this script has you covered! With just a few commands, you'll have your new project up and running with all dependencies installed and the development server ready to go.

## Features

- Automatically creates a GitHub repository and clones it locally
- Supports multiple JavaScript frameworks:
  - Angular
  - React
  - Vue
  - Svelte
- Supports CSS frameworks:
  - Tailwind CSS
  - Bootstrap
  - Bulma
- Installs project dependencies
- Starts the development server based on the selected framework

## Prerequisites

- **Deno** installed
- **GitHub Personal Access Token** with repository permissions:
  - To create a GitHub Personal Access Token (PAT), go to your GitHub settings and select "Tokens (classic)"
  - Choose "Generate new token" and ensure it has repo permissions for creating and managing repositories
- **npm** installed for handling package installations

## Setup Instructions

### 1. Clone the Repository

To get started, clone this repository locally:

```bash
git clone https://github.com/peterbenoit/DevBoilerplate.git
cd DenoInstaller
```

### 2. Set Up the GitHub Token

Ensure you have your GitHub token set as an environment variable:

```bash
export DENO_GITHUB_TOKEN=your_personal_access_token
```

### 3. Run the Script

Run the Deno script to automate the project setup:

```bash
deno run --allow-net --allow-env --allow-run=git,npx,npm --allow-read setup-project.ts
```

Alternatively, if you want a simpler command, you can run the rundeno.sh script provided:

```bash
./rundeno.sh
```

The rundeno.sh script will:
1. Check if Deno is installed
2. Install Deno if it is not installed
3. Upgrade Deno to the latest version if it is already installed
4. Run the setup-project.ts script with the necessary permissions

### 4. Framework and CSS Selection

During execution, you'll be prompted to select:
- A JavaScript framework (Angular, React, Vue, Svelte)
- A CSS framework (Tailwind, Bootstrap, Bulma, or None)

### 5. Development Server

After installation, the development server will automatically start. You can access it by navigating to http://localhost:<PORT> in your browser (the port depends on the framework).

## Why Deno instead of Node?

- **Security:** Deno is secure by default. It requires explicit permission for file, network, and environment access, reducing the risk of security vulnerabilities
- **Built-in TypeScript Support:** Deno has first-class TypeScript support out of the box, eliminating the need for additional configuration and tooling
- **Simplified Module System:** Deno uses ES modules and URLs for importing dependencies, avoiding the complexities of node_modules and package.json
- **Standard Library:** Deno provides a standard library with a wide range of utilities, reducing the need for third-party dependencies
- **Single Executable:** Deno is distributed as a single executable, making installation and updates straightforward

## Contributing

Feel free to submit issues or contribute via pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
