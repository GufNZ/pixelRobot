import plotValue from './lib/plotValue';

const facingNumber = {
	NORTH: 0,
	WEST: 1,
	SOUTH: 2,
	EAST: 3
};
export { facingNumber };

const facingDelta = {
	[facingNumber.NORTH]: { y: 1 },
	[facingNumber.WEST]: { x: -1 },
	[facingNumber.SOUTH]: { y: -1 },
	[facingNumber.EAST]: { x: 1 }
};

const facingChars = '^<v>';

const facingName = Object.keys(facingNumber);

export default class Robot {
	constructor(options) {
		const myOptions = Object.assign(
			{},
			{
				width: 5,
				height: 5,
				debug: false,
				plot: plotValue.PLOT_NEVER,
				print: console.info,
				warn: console.warn
			},
			options
		);

		this.debug = myOptions.debug;
		this.width = myOptions.width;
		this.height = myOptions.height;
		this.plotValue = myOptions.plot;

		this.print = myOptions.print;
		this.warn = myOptions.warn;

		this.valid = false;
		this.x = null;
		this.y = null;
		this.facing = null;
		this.seenPlace = false;
	}

	log(command, ...args) {
		if (this.debug) {
			this.print(`${command}: ${args.join(', ')}; before = [${this.x}, ${this.y}]@${facingName[this.facing]}`);
		}
	}

	checkSeenPlace(name) {
		if (this.debug && !this.seenPlace) {
			this.print(`${name} before PLACE!`);
		}
	}

	checkPlot({ isReport } = {}) {
		if (this.debug) {
			this.print(`\tafter = [${this.x}, ${this.y}]@${facingName[this.facing]}`);
		}
		if (this.plotValue === plotValue.PLOT_ALWAYS
			|| isReport && this.plotValue === plotValue.PLOT_ON_REPORT
		) {
			this.plot();
		}
	}

	inBounds(x, y) {
		return (
			x >= 0 && x < this.width
			&& y >= 0 && y < this.height
		);
	}

	place(requestedX, requestedY, requestedFacing) {
		this.log('PLACE', requestedX, requestedY, requestedFacing);
		this.seenPlace = true;
		const [x, y] = [+requestedX, +requestedY];

		const facing = facingNumber[(requestedFacing || '').toUpperCase()];

		if (facing !== undefined && this.inBounds(x, y)) {
			Object.assign(
				this,
				{
					x,
					y,
					facing,
					valid: true
				}
			);
		}

		this.checkPlot();
	}

	move() {
		this.checkSeenPlace('MOVE');
		this.log('MOVE');
		if (!this.valid) {
			if (this.debug) {
				this.print('Not valid yet!');
			}
			return;
		}


		const delta = Object.assign({ x: 0, y: 0 }, facingDelta[this.facing]);
		if (this.inBounds(this.x + delta.x, this.y + delta.y)) {
			this.x += delta.x;
			this.y += delta.y;
		} else if (this.debug) {
			this.warn('Tried to move off the edge!');
		}

		this.checkPlot();
	}

	left() {
		this.checkSeenPlace('LEFT');
		this.log('LEFT');
		if (!this.valid) {
			if (this.debug) {
				this.print('Not valid yet!');
			}
			return;
		}


		this.facing = (this.facing + 1) & 3;

		this.checkPlot();
	}

	right() {
		this.checkSeenPlace('RIGHT');
		this.log('RIGHT');
		if (!this.valid) {
			if (this.debug) {
				this.print('Not valid yet!');
			}
			return;
		}


		this.facing = (this.facing - 1) & 3;

		this.checkPlot();
	}

	report() {
		this.checkSeenPlace('REPORT');
		this.log('REPORT');
		if (!this.valid) {
			if (this.debug) {
				this.print('Not valid yet!');
			}
			return;
		}


		this.print([this.x, this.y, facingName[this.facing]].join(', '));

		this.checkPlot({ isReport: true });
	}

	plot() {
		this.log('PLOT');

		if (this.plotValue === plotValue.PLOT_NEVER) {
			this.unhandledCommand('PLOT').call(this);
			return;
		}


		const table = new Array(this.height).fill(null);
		// The array iterates its elements not its properties:
		// eslint-disable-next-line guard-for-in
		for (const y in table) {
			table[y] = new Array(this.width + 2).fill('.');
			table[y][0] = table[y][this.width + 1] = '|';
		}

		if (this.valid) {
			table[this.height - this.y - 1][this.x + 1] = facingChars[this.facing];
		}

		const cap = `+${''.padEnd(this.width, '-')}+`;

		this.print(cap);
		table.forEach(row => {
			this.print(row.join(''));
		});
		this.print(cap);
	}

	unhandledCommand(command) {
		return (...args) => {
			this.warn(`UNHANDLED COMMAND: ${command} ${args.join(', ')}`, this);
		};
	}

	parseLine(line) {
		const parts = line
			.replace(/,/g, ' ')
			.split(' ')
			.filter(part => part);

		(this[parts[0]] || this.unhandledCommand(parts[0]))
			.apply(this, parts.slice(1));
	}

	run(input) {
		for (const line of input) {
			this.parseLine(line);
		}
	}
}
