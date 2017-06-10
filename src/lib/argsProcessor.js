import plotValue from './plotValue';

const normaliseArgs = args => {
	const normalisedArgs = [];

	for (const arg of args.slice(2)) {
		if (/^--.+=.+/.test(arg)) {
			const eqIndex = arg.indexOf('=');
			normalisedArgs.push(arg.substr(0, eqIndex));
			normalisedArgs.push(arg.substr(eqIndex + 1));
		} else {
			normalisedArgs.push(arg);
		}
	}

	return normalisedArgs.filter(arg => arg);
};

const processArgs = args => {
	const options = {
		files: [],
		plot: plotValue.PLOT_NEVER,
		width: 5,
		height: 5,
		debug: false
	};

	const normalisedArgs = normaliseArgs(args);

	for (let i = 0, len = normalisedArgs.length; i < len; i++) {
		const arg = normalisedArgs[i];
		if (options.debug) {
			console.info(`Arg ${i} = ${arg}`, normalisedArgs);
		}

		if (arg[0] === '-') {
			switch (arg) {
				case '-D':
				case '--debug':
					options.debug = true;
					break;

				case '-p':
				case '--plot':
					options.plot = plotValue.getPlotValue(normalisedArgs[++i]) || plotValue.PLOT_ON_REPORT;
					break;

				case '-w':
				case '--width':
					options.width = +normalisedArgs[++i];
					break;

				case '-h':
				case '--height':
					options.height = +normalisedArgs[++i];
					break;

				case '-':
					options.files.push(null);
					break;

				case '--':
					for (const file of normalisedArgs.slice(i + 1)) {
						options.files.push(file === '-' ? null : file);
					}
					i = len;
					break;

				default:
					console.error(`Unknown option: '${arg}'`);
					break;
			}
		} else {
			options.files.push(arg);
		}
	}

	if (options.debug) {
		console.info('Parsed Options:', options);
	}

	return options;
};

export default processArgs;
