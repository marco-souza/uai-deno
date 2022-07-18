import { Command } from 'cliffy';
import { $ } from 'zx';

export function addDegitHandler(cli: Command) {
	cli
		.description('Straightforward project scaffolding')
		.command('degit', 'degit but made in deno')
		.alias('dg')
		.option('-b, --branch [branch:string]', 'Specify a branch to clone', {
			default: 'main',
		})
		.option('-v, --verbose', 'Verbose output')
		.option('-g, --git', 'Initialize git output')
		.arguments('<repo:string> [folder:string]')
		.action(cliHandler);
}

interface IOptions {
	branch: string;
	git: boolean;
	verbose: boolean;
}

async function cliHandler(
	{ git: enableGit, branch, verbose }: IOptions,
	repo: string,
	folder?: string,
) {
	const [username, project, ...path] = repo.split('/');
	if (project == null) throw Error('You need to specify a project');

	const githubRepoUrl = `git@github.com:${username}/${project}.git`;
	const distFolder = folder ?? path.at(-1) ?? project;

	$.verbose = verbose;

	console.log(`🔬 Cloning repo ${distFolder}...`);
	await $`
    git clone -b ${branch} ${githubRepoUrl} /tmp/degit-cache && \
    mv /tmp/degit-cache/${path?.join('/') ?? ''} ${distFolder} && \
    rm -rf ${distFolder}/.git
    rm -rf /tmp/degit-cache
  `;

	if (enableGit) {
		console.log(`⚙  Initializing git ...`);
		await $`
			cd ${distFolder} && git init && \
			git add . && git commit -m "initial commit"
		`;
	}

	console.log(`\n🦕 Done! You're ready to fly! 🚀`);
	console.log(`\ncd ${distFolder} `);
}
