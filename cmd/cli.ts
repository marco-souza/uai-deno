import { Command } from 'cliffy';
import { addDegitHandler } from '../services/degit.ts';

/**
 * Main CLI command, as of right now the CLI does not have sub-commands.
 */
export async function run() {
	const cmd = makeCommand();
	await cmd.parse(Deno.args);
}

function makeCommand() {
	const mainCli = new Command();

	// Main command
	mainCli.name('uai').version('v1.0.0').description('Utility AI CLI');

	// Add sub-commands
	addDegitHandler(mainCli);

	return mainCli;
}
