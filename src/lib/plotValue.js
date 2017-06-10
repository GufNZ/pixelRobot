const PLOT_NEVER = 1;
const PLOT_ENABLED = 2;
const PLOT_ON_REPORT = 3;
const PLOT_ALWAYS = 4;

const plotValueLookup = {
	[PLOT_NEVER]: /^(?:N(?:EVER)?|OFF|0)$/i,
	[PLOT_ENABLED]: /^(?:ENABLED|Y|ON|1)$/i,
	[PLOT_ON_REPORT]: /^(?:(?:ON[ _-]?)?R(?:EPORT)?|2)$/i,
	[PLOT_ALWAYS]: /^(?:A(?:LWAYS)?|3)$/i
};

export default {
	PLOT_NEVER,
	PLOT_ENABLED,
	PLOT_ON_REPORT,
	PLOT_ALWAYS,

	getPlotValue: inputValue => {
		if (!inputValue) {
			return null;
		}


		for (const value in plotValueLookup) {
			if (plotValueLookup[value].test(inputValue)) {
				return +value;
			}
		}


		throw new Error(`Unrecognised -p|--plot value: '${inputValue}'`);
	}
};
