import { Command } from 'cliffy';
import { $ } from 'zx';

export function addDegitHandler(cli: Command) {
	cli
		.command('degit', 'degit but made in deno')
		.description('Straightforward project scaffolding')
		.alias('dg')
		.option('-b, --branch [branch:string]', 'Specify a branch to clone', {
			default: 'main',
		})
		.option('-g, --git', 'Initialize git output')
		.option('-t, --template', 'use deno templates from github.com/marco-souza/deno-templates')
		.option('-v, --verbose', 'Verbose output')
		.arguments('<repo:string> [folder:string]')
		.action(cliHandler);
}

interface IOptions {
	branch: string;
	git: boolean;
	verbose: boolean;
	template: boolean;
}

async function cliHandler(
	{ git: enableGit, branch, verbose, template }: IOptions,
	repo: string,
	folder?: string,
) {
	const [username, project, path] = parseRepositoryInfo(repo, template)
	const githubRepoUrl = `git@github.com:${username}/${project}.git`;
	const distFolder = folder ?? path.split('/').at(-1) ?? project;

	$.verbose = verbose;

	console.log(`🔬 Cloning repo ${distFolder}...`);
	await $`
    git clone -b ${branch} ${githubRepoUrl} /tmp/degit-cache && \
    mv /tmp/degit-cache/${path} ${distFolder} && \
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

type RepositoryInfo = [username: string, project: string, path: string]

function parseRepositoryInfo(repo: string, templates: boolean = false): RepositoryInfo {
	const repoSplitted = repo.split('/')
	if (templates)
		return ['marco-souza', 'deno-templates', repo]

	const [username, project, ...path] = repoSplitted;
	if (project == null) throw Error('You need to specify a project');

	return [username, project, path.join('/')]
}
