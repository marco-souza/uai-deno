import { colors, Command } from 'cliffy';
import { $ } from 'zx';

export function addDegitHandler(cli: Command) {
	cli
		.command('degit', 'degit but made in deno')
		.alias('dg')
		.option('-b, --branch [branch:string]', 'Specify a branch to clone', {
			default: 'main',
		})
		.option('-v, --verbose', 'Verbose output', { default: false })
		.arguments('<repo:string> [folder:string]')
		.action(cliHandler);
}

interface IOptions {
	branch: string;
	verbose: boolean;
}

async function cliHandler(
	{ branch, verbose }: IOptions,
	repo: string,
	folder?: string,
) {
	try {
		const [username, project, ...path] = repo.split('/');
		if (project == null) throw Error('You need to specify a project');

		const githubRepoUrl = `git@github.com:${username}/${project}.git`;
		const distFolder = folder ?? project;

		$.verbose = verbose;

		console.log(`🔬 Cloning repo ${distFolder}...`);
		await $`
    git clone -b ${branch} ${githubRepoUrl} /tmp/degit-cache && \
    mv /tmp/degit-cache/${path?.join('/') ?? ''} ${distFolder} && \
    rm -rf ${distFolder}/.git
    rm -rf /tmp/degit-cache
  `;

		console.log(`⚙  Initializing git ...`);
		await $
			`cd ${folder} && git init && git add . && git commit -m "initial commit"`;

		console.log(`\n🦕 Done! You're ready to fly! 🚀`);
		console.log(`\ncd ${distFolder} `);
	} catch (error) {
		console.error(colors.red(error.message));
	}
}
