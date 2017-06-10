import { expect } from 'chai';
import { stub } from 'sinon';

import plotValue from '../../lib/plotValue';

import processArgs from '../../lib/argsProcessor';

describe('argsProcessor', () => {
	const defaultArgs = {
		files: [],
		plot: plotValue.PLOT_NEVER,
		width: 5,
		height: 5,
		debug: false
	};

	const tests = {
		'': {},
		'-D': { debug: true },
		'--debug': { debug: true },
		'-w 1': { width: 1 },
		'--width 2': { width: 2 },
		'--width=3': { width: 3 },
		'-h 7': { height: 7 },
		'--height 8': { height: 8 },
		'--height=9': { height: 9 },
		'-': { files: [null] },
		'a b c': { files: ['a', 'b', 'c'] },
		'a -w 1 b -- c -D d - e -h 3': { width: 1, files: ['a', 'b', 'c', '-D', 'd', null, 'e', '-h', '3'] },
		'-w  2  -h  3': { width: 2, height: 3 },

		'-p': { plot: plotValue.PLOT_ON_REPORT },
		'-p 0': {},
		'--plot 1': { plot: plotValue.PLOT_ENABLED },
		'--plot=2': { plot: plotValue.PLOT_ON_REPORT },
		'-p   3': { plot: plotValue.PLOT_ALWAYS },
		'-p N': { plot: plotValue.PLOT_NEVER },
		'-p n': { plot: plotValue.PLOT_NEVER },
		'-p Y': { plot: plotValue.PLOT_ENABLED },
		'-p r': { plot: plotValue.PLOT_ON_REPORT },
		'-p A': { plot: plotValue.PLOT_ALWAYS },
		'-p Off': { plot: plotValue.PLOT_NEVER },
		'-p oN': { plot: plotValue.PLOT_ENABLED },
		'-p never': { plot: plotValue.PLOT_NEVER },
		'-p report': { plot: plotValue.PLOT_ON_REPORT },
		'-p onReport': { plot: plotValue.PLOT_ON_REPORT },
		'-p on-report': { plot: plotValue.PLOT_ON_REPORT },
		'-p ON_REPORT': { plot: plotValue.PLOT_ON_REPORT },
		'-p ON_R': { plot: plotValue.PLOT_ON_REPORT },
		'-p on-R': { plot: plotValue.PLOT_ON_REPORT },
		'-p onR': { plot: plotValue.PLOT_ON_REPORT },
		'-p always': { plot: plotValue.PLOT_ALWAYS },

		'-w 2 -p 3 -h 9 -w 5 -p n -h 4 -h 5': {}
	};

	let errorStub;
	beforeEach(() => {
		errorStub = stub();
		console.error = errorStub;
	});

	Object.keys(tests).forEach(cmdLine => {
		it(`should parse the command line '${cmdLine}' as expected`, () => {
			const expected = Object.assign({}, defaultArgs, tests[cmdLine]);
			const args = cmdLine.split(' ');
			const result = processArgs(['node', 'app'].concat(args));
			expect(result).to.deep.equal(expected);
		});
	});
});
