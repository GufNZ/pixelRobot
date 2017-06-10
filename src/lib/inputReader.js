import fs from 'fs';
import getStdIn from 'get-stdin';

const readFileAsync = filename => new Promise((resolve, reject) => {
	try {
		fs.readFile(filename, (err, buffer) => {
			if (err) {
				reject(err);
			} else {
				resolve(buffer);
			}
		});
	} catch (err) {
		reject(err);
	}
});

export default function inputReader(options) {
	const opts = Object.assign(
		{
			files: [],

			// For testing dependency injection:
			readFileAsync,
			getStdIn
		},
		options
	);
	const promises = options.files
		.map(fileName => (
			fileName
				? opts.readFileAsync(fileName)
				: opts.getStdIn.buffer()
		));

	return Promise.all(promises)
		.then(inputs => inputs
			.reduce((lines, buffer) => lines.concat(buffer.toString().split('\n')), [])
			.map(line => line.trim().toLowerCase())
			.filter(line => line)	// Skip blank lines
		)
		.catch(error => { throw error; });
}
