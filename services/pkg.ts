import { Command } from 'cliffy';
import { $ } from 'zx';

export function addPkgCmd(cli: Command) {
	const pkgCmd = new Command()
		.alias('p')
		.description('Agnostic Package Manager')
		// install
		.command('i, install [...packages]', 'install packages')
		.action(makeCommandHandler('install'))
		// remove
		.command('r, remove [...packages]', 'remove packages installed')
		.action(makeCommandHandler('remove'))
		// search
		.command('s, search [...packages]', 'search with optional query')
		.action(makeCommandHandler('search'))
		// update
		.command('u, update', 'update installed packages')
		.action(makeCommandHandler('update'));

	// bind sub-command
	cli.command('pkg', pkgCmd)
		.action(() => pkgCmd.showHelp());
}

type IOptions = {};

const makeCommandHandler = (cmd: PkgCommands) =>
async (
	_opts: IOptions,
	packages: string[],
) => {
	const pkg = await findPkgCommands();
	if (pkg == null) return;

	let evalCmd = pkg[cmd];
	if (['install', 'remove', 'search'].includes(cmd)) {
		evalCmd += ` ${(packages ?? []).join(' ')}`;
	}
	if ((cmd === 'update')) {
		// update other package managers
		evalCmd += '; npm up -g npm; sudo deno upgrade';
	}

	try {
		await $`eval ${evalCmd}`;
	} catch (error) {
		console.error('%c[error]', 'color: tomato;', 'Something when wrong');
	}
};

type IPkgManCommands = {
	install: string;
	search: string;
	update: string;
	remove: string;
};

type PkgCommands = keyof IPkgManCommands;

type PkgManMap = {
	yay: IPkgManCommands;
	pamac: IPkgManCommands;
	apt: IPkgManCommands;
	// brew: IPkgManCommands;
};

const pkgManMap: PkgManMap = {
	apt: {
		install: 'sudo apt install -y',
		search: 'sudo apt search',
		update: 'sudo apt update; sudo apt upgrade;',
		remove: 'sudo apt remove -y',
	},
	yay: {
		install: 'yay -S --noconfirm',
		search: 'yay -Ss',
		update: 'yay -Syu',
		remove: 'yay -Rssc',
	},
	pamac: {
		install: 'sudo pamac install',
		search: 'sudo pamac search',
		update: 'sudo pamac update',
		remove: 'sudo pamac remove',
	},
};

async function findPkgCommands() {
	for (const pm in pkgManMap) {
		if (await commandExists(pm)) return pkgManMap[pm as keyof PkgManMap];
	}
}

async function commandExists(cmd: string) {
	try {
		const out = await $`command -v ${cmd}`;
		return out.stdout.length > 0;
	} catch (e) {
		return false;
	}
}
