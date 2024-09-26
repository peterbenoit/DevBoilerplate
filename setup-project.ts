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

// Prompt for the repository name
const repoName = prompt('Enter the repository name:');

// Check if repoName exists
if (!repoName) {
    console.error('Error: Repository name is required.');
    Deno.exit(1);
}

// Convert the repository name to kebab-case
const normalizedRepoName = toKebabCase(repoName);

// Check if the directory already exists before creating the repo
if (await directoryExists(normalizedRepoName)) {
    console.error(`Error: The directory '${normalizedRepoName}' already exists.`);
    Deno.exit(1);
}

// Prompt for privacy setting with a default to 'yes'
const isPrivate = prompt('Should the repository be private? (yes/no) [yes]:') || 'yes';
const privacySetting = isPrivate.toLowerCase() === 'yes' ? 'private' : 'public';

// Store your GitHub token securely in an environment variable
const githubToken = Deno.env.get('DENO_GITHUB_TOKEN');

if (!githubToken) {
    console.error(
        'Error: GitHub token is not set. Set it using `export DENO_GITHUB_TOKEN=your_token_here`'
    );
    Deno.exit(1);
}

// Prepare the API URL and request body
const apiUrl = 'https://api.github.com/user/repos';
const body = {
    name: repoName,
    private: privacySetting === 'private',
};

// Send the request to create the repository
const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
});

// Check the response
if (response.ok) {
    const jsonResponse = await response.json();
    console.log(`Repository '${jsonResponse.name}' created successfully: ${jsonResponse.html_url}`);

    // Clone the repository into the normalized name directory
    const cloneCommand = new Deno.Command('git', {
        args: ['clone', jsonResponse.clone_url, normalizedRepoName],
    });

    const cloneStatus = await cloneCommand.output();

    if (cloneStatus.success) {
        console.log(`Repository cloned successfully into '${normalizedRepoName}'!`);

        const repoDir = normalizedRepoName;

        // Prompt for the framework to use, default to 'react'
        const framework =
            prompt('Which framework do you want to use? (angular/react/vue/svelte) [react]:') ||
            'react';

        // Prompt for the CSS framework to use, default to 'tailwind'
        const cssFramework =
            prompt(
                'Which CSS framework do you want to use? (tailwind/bootstrap/bulma/none) [tailwind]:'
            ) || 'tailwind';

        if (!framework) {
            console.error('Framework selection is required.');
            Deno.exit(1);
        }

        let initCommand;
        if (framework.toLowerCase() === 'angular') {
            initCommand = new Deno.Command('npx', {
                args: ['@angular/cli', 'new', '.', '--skip-install'],
                cwd: repoDir,
            });
        } else if (framework.toLowerCase() === 'react') {
            initCommand = new Deno.Command('npx', {
                args: ['create-react-app', '.', '--template', 'cra-template'],
                cwd: repoDir,
            });
        } else if (framework.toLowerCase() === 'vue') {
            initCommand = new Deno.Command('npx', {
                args: ['create-vue@latest', '.', '--default'],
                cwd: repoDir,
            });
        } else if (framework.toLowerCase() === 'svelte') {
            initCommand = new Deno.Command('npx', {
                args: ['degit', 'sveltejs/template', '.', '--force'],
                cwd: repoDir,
            });
        } else {
            console.error('Unsupported framework. Please choose angular, react, vue, or svelte.');
            Deno.exit(1);
        }

        // Run the initialization command
        const initProject = await initCommand.output();

        if (initProject.success) {
            console.log(`${framework} project initialized successfully in '${repoDir}'!`);

            // Install the selected CSS framework
            if (cssFramework.toLowerCase() === 'tailwind') {
                console.log('Installing Tailwind CSS...');
                await new Deno.Command('npm', {
                    args: ['install', '-D', 'tailwindcss'],
                    cwd: repoDir,
                }).output();
                await new Deno.Command('npx', {
                    args: ['tailwindcss', 'init'],
                    cwd: repoDir,
                }).output();
            } else if (cssFramework.toLowerCase() === 'bootstrap') {
                console.log('Installing Bootstrap...');
                await new Deno.Command('npm', {
                    args: ['install', 'bootstrap'],
                    cwd: repoDir,
                }).output();
            } else if (cssFramework.toLowerCase() === 'bulma') {
                console.log('Installing Bulma...');
                await new Deno.Command('npm', {
                    args: ['install', 'bulma'],
                    cwd: repoDir,
                }).output();
            } else {
                console.log('No CSS framework selected.');
            }

            // Install project dependencies
            console.log('Installing project dependencies...');
            await new Deno.Command('npm', { args: ['install'], cwd: repoDir }).output();

            // Run the development server based on the framework
            console.log(`Starting the development server for ${framework}...`);
            let startCommand;
            if (framework.toLowerCase() === 'svelte' || framework.toLowerCase() === 'vue') {
                startCommand = new Deno.Command('npm', { args: ['run', 'dev'], cwd: repoDir });
            } else {
                startCommand = new Deno.Command('npm', { args: ['start'], cwd: repoDir });
            }

            await startCommand.output();
        } else {
            console.error(`Error initializing ${framework} project.`);
        }
    } else {
        console.error('Error cloning the repository.');
    }
} else {
    console.error('Error creating repository:', await response.text());
}
