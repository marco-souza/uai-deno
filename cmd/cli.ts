import { Command } from 'cliffy';
import { addDegitHandler } from '../services/degit.ts';
import { addDolCmd } from '../services/dol.ts';
import { addPkgCmd } from '../services/pkg.ts';

/**
 * Main CLI command, as of right now the CLI does not have sub-commands.
 */
export async function run() {
	const cmd = makeCommand();
	await cmd.parse(Deno.args);
}

function makeCommand() {
	// Main command
	const mainCli = new Command()
		.name('uai')
		.version('v1.0.2')
		.description('Utility CLI tool')
		.action(() => mainCli.showHelp());

	// Add sub-commands
	addDegitHandler(mainCli);
	addDolCmd(mainCli);
	addPkgCmd(mainCli);

	return mainCli;
}
