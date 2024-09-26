
# Setup Project Automation Script

This repository contains a Deno script that automates the creation of a new GitHub repository, clones it locally, initializes a project using a chosen JavaScript framework (Angular, React, Vue, Svelte), and installs a CSS framework (Tailwind, Bootstrap, or Bulma). It also automates dependency installation and starts the development server.

## Features

- Automatically creates a GitHub repository and clones it locally.
- Supports multiple JavaScript frameworks:
  - Angular
  - React
  - Vue
  - Svelte
- Supports CSS frameworks:
  - Tailwind CSS
  - Bootstrap
  - Bulma
- Installs project dependencies.
- Starts the development server based on the selected framework.

## Prerequisites

- **Deno v2 RC** installed.
- **GitHub Personal Access Token** with repository permissions.
- **npm** installed for handling package installations.

## Setup Instructions

### 1. Clone the Repository

To get started, clone this repository locally:

```bash
git clone https://github.com/peterbenoit/your-repo-name.git
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

Alternatively, if you want a simpler command, you can run the `rundeno.sh` script provided:

```bash
./rundeno.sh
```

### 4. Framework and CSS Selection

During the execution, you'll be prompted to select:
- A JavaScript framework (Angular, React, Vue, Svelte).
- A CSS framework (Tailwind, Bootstrap, Bulma, or None).

### 5. Development Server

After installation, the development server will automatically start. You can access it by navigating to `http://localhost:<PORT>` in your browser (the port depends on the framework).

## Contributing

Feel free to submit issues or contribute via pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
