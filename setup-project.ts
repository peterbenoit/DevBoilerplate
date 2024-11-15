// Function to check if a directory exists
async function directoryExists(path: string): Promise<boolean> {
	try {
		const stat = await Deno.stat(path);
		return stat.isDirectory;
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) {
			return false;
		} else {
			throw error;
		}
	}
}

// Function to convert camelCase or PascalCase to kebab-case
function toKebabCase(str: string): string {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// Function to validate and normalize repository name
function normalizeRepoName(name: string): string {
    // Convert spaces to dashes and remove special characters
    return name.trim()
        .toLowerCase()
        .replace(/\s+/g, '-')     // Replace spaces with dashes
        .replace(/[^a-z0-9-]/g, '') // Remove special characters
        .replace(/--+/g, '-');     // Replace multiple dashes with single dash
}

// Update repository name prompt section
const repoName = prompt('Enter the repository name:');
if (!repoName) {
    console.error('Error: Repository name is required.');
    Deno.exit(1);
}

const normalizedRepoName = normalizeRepoName(repoName);
if (normalizedRepoName !== repoName) {
    console.log(`Repository name normalized to: ${normalizedRepoName}`);
}

if (await directoryExists(normalizedRepoName)) {
    console.error(`Error: The directory '${normalizedRepoName}' already exists.`);
    Deno.exit(1);
}

// Prompt for privacy setting
const isPrivate = (
	prompt('Should the repository be private? (yes/no) [yes]:') || 'yes'
).toLowerCase();
const privacySetting = isPrivate === 'yes' ? 'private' : 'public';

// Get GitHub token
const githubToken = Deno.env.get('DENO_GITHUB_TOKEN');
if (!githubToken) {
	console.error(
		'Error: GitHub token is not set. Set it using `export DENO_GITHUB_TOKEN=your_token_here`'
	);
	Deno.exit(1);
}


// Create repository on GitHub
const apiUrl = 'https://api.github.com/user/repos';
const response = await fetch(apiUrl, {
	method: 'POST',
	headers: {
		Authorization: `Bearer ${githubToken}`,
		Accept: 'application/vnd.github+json',
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({ name: repoName, private: privacySetting === 'private' }),
});

if (!response.ok) {
	console.error('Error creating repository:', await response.text());
	Deno.exit(1);
}

const { html_url, clone_url } = await response.json();
console.log(`Repository '${repoName}' created successfully: ${html_url}`);

// Clone the repository into the designated directory
const cloneCommand = new Deno.Command('git', { args: ['clone', clone_url, normalizedRepoName] });
const cloneStatus = await cloneCommand.output();
if (!cloneStatus.success) {
	console.error('Error cloning the repository.');
	Deno.exit(1);
}
console.log(`Repository cloned successfully into '${normalizedRepoName}'!`);

// Create local directory instead
// try {
// 	await Deno.mkdir(normalizedRepoName);
// } catch (error) {
// 	console.error('Error creating directory:', error);
// 	Deno.exit(1);
// }

// Set the working directory for project setup
const repoDir = normalizedRepoName;
const framework = (
	prompt('Which framework do you want to use? (angular/react/vue/svelte) [react]:') || 'react'
).toLowerCase();
const cssFramework = (
	prompt('Which CSS framework do you want to use? (tailwind/bootstrap/bulma/none) [tailwind]:') ||
	'tailwind'
).toLowerCase();

// Framework initialization commands
const frameworkCommands: { [key: string]: (repoName: string) => string[] } = {
    angular: (repoName: string) => [
        'npx',
        '@angular/cli@latest',
        'new',
        repoName,
        '--directory',
        '.',
        '--skip-install',
        '--strict'
    ],
    react: () => ['npx', 'create-react-app', '.'],
    vue: () => [
        'npm',
        'create',
        'vite@latest',
        '.',
        '--',
        '--template',
        'vue'
    ],
    svelte: () => ['npx', 'create-vite', '.', '--template', 'svelte']
};

// Initialize project with selected framework
console.log(`Initializing ${framework} project...`);
try {
    const frameworkCmd = frameworkCommands[framework](normalizedRepoName);
    let command, args;

    // Handle different framework commands appropriately
    switch (framework) {
        case 'vue':
            command = frameworkCmd[0];
            args = frameworkCmd.slice(1);
            break;
        default:
            command = frameworkCmd[0];
            args = frameworkCmd.slice(1);
    }

    console.log(`Executing: ${command} ${args.join(' ')}`);

    // Run the command to initialize the project
    const result = await new Deno.Command(command, {
        args: args,
        cwd: repoDir,
        stderr: 'piped',
        stdout: 'piped',
        env: {
            PATH: Deno.env.get("PATH"),
            HOME: Deno.env.get("HOME"),
            NODE_ENV: 'production',
            NPM_CONFIG_LOGLEVEL: 'error'
        },
    }).output();

    const output = new TextDecoder().decode(result.stdout);
    if (!result.success) {
        const errorOutput = new TextDecoder().decode(result.stderr);
        throw new Error(`Command failed with error:\n${errorOutput}`);
    }
    console.log(output);

    // Additional Vue-specific setup
    if (framework === 'vue') {
        // Install Vue Router and Vuex
        console.log('Installing additional Vue dependencies...');
        await new Deno.Command('npm', {
            args: ['install', 'vue-router@next', 'vuex@next'],
            cwd: repoDir,
        }).output();
    }
} catch (error) {
    console.error(`Error initializing ${framework} project:`, error);
    Deno.exit(1);
}

// Install project dependencies
console.log('Installing project dependencies...');
await new Deno.Command('npm', { args: ['install'], cwd: repoDir }).output();

// CSS framework installation commands
const cssFrameworkCommands: { [key: string]: string[] } = {
	tailwind: ['install', '-D', 'tailwindcss'],
	bootstrap: ['install', 'bootstrap'],
	bulma: ['install', 'bulma'],
};

if (cssFramework in cssFrameworkCommands) {
	console.log(
		`Installing ${cssFramework.charAt(0).toUpperCase() + cssFramework.slice(1)} CSS...`
	);
	await new Deno.Command('npm', {
		args: cssFrameworkCommands[cssFramework],
		cwd: repoDir,
	}).output();
}

// Development server commands and ports
const serverConfig: { [key: string]: { cmd: string[]; port: string } } = {
    angular: { cmd: ['ng', 'serve'], port: '4200' },
    react: { cmd: ['npm', 'start'], port: '3000' },
    vue: { cmd: ['npm', 'run', 'dev'], port: '5173' },
    svelte: { cmd: ['npm', 'run', 'dev'], port: '5173' }
};

// Start development server
console.log(`Starting ${framework} development server...`);
try {
    const { cmd: startCmd, port } = serverConfig[framework];
    const server = new Deno.Command('npx', {
        args: startCmd,
        cwd: repoDir,
        stdout: 'piped',
        stderr: 'piped',
        env: {
            NODE_ENV: 'development',
            FORCE_COLOR: 'true'
        },
        stdin: 'inherit'
    });

    const serverProcess = server.spawn();
    const decoder = new TextDecoder();

    // Monitor server output using async iterator
    for await (const chunk of serverProcess.stdout) {
        const text = decoder.decode(chunk);
        console.log(text);

        if (text.includes('VITE v') || text.includes('ready in') || text.includes('Local:')) {
            console.log(`\nDevelopment server for ${framework} is running at http://localhost:${port}`);
            break;
        }
    }

    // Keep process running
    await serverProcess.status;
} catch (error) {
    console.error(`Error starting development server:`, error);
    Deno.exit(1);
}
