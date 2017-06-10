import readLine from 'readline';
import processArgs from './lib/argsProcessor';
import evaluateOptions from './lib/inputReader';
import Robot from './robot';

(function main(args) {
	const options = processArgs(args);
	if (options.files.length) {
		evaluateOptions(options)
			.then(input => new Robot(options).run(input))
			.catch(console.error);
	} else {
		const stdInSession = readLine.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: '> '
		});

		stdInSession.prompt();

		const robot = new Robot(options);

		stdInSession
			.on('line', line => {
				robot.run([line]);
				stdInSession.prompt();
			})
			.on('close', () => {
				process.exit(0);
			});
	}
}(process.argv));
