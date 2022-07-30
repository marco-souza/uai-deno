import { Command } from 'cliffy';

export function addDolCmd(cli: Command) {
	cli
		.command('dol', 'dollar exchange rate')
		.description('Get dollar exchange rate to BRL')
		.option('-c, --clean', 'Return unformatted number')
		.option('-t, --to [currency:string]', 'Specify a output currency', {
			default: 'BRL',
		})
		.arguments('[amount:number]')
		.action(cliHandler);
}

interface IOptions {
	to: string;
	clean: boolean;
}

const EXCHANGE_API = 'https://dolarhoje.com/cotacao.txt';

async function cliHandler(opts: IOptions, amount = 1) {
	const res = await fetch(EXCHANGE_API);
	const text = await res.text();
	const rate = parseFloat(text.replace(',', '.'));

	const formatter = Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: opts.to,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	if (opts.clean) return console.log(rate * amount);

	console.log(formatter.format(rate * amount));
}
