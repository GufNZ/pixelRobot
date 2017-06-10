import { expect } from 'chai';
import { spy } from 'sinon';

import inputReader from '../../lib/inputReader';

describe('inputReader', () => {
	it('should process empty files as []', () => {
		inputReader({ files: [] })
			.then(result => {
				expect(result).to.deep.equal([]);
			});
	});

	describe('with files supplied', () => {
		const options = {
			files: ['a', 'b', 'c'],
			readFileAsync: spy(
				fileName => Promise.resolve({
					a: 'a',
					b: ' b ',
					c: ' C \n   \n\n d   \n'
				}[fileName])
			)
		};

		it('should read the files given', () => {
			inputReader(options)
				.then(result => {
					expect(options.readFileAsync.calledThrice).to.equal(true);
					expect(result).to.deep.equal(['a', 'b', 'c', 'd']);
				});
		});
	});

	describe('with STDIN indicated', () => {
		const options = {
			files: [null],
			getStdIn: {
				buffer: spy(() => Promise.resolve('this is\nSTDIN\n'))
			}
		};

		it('should read STDIN', () => {
			inputReader(options)
				.then(result => {
					expect(result).to.deep.equal(['this is', 'stdin']);
				});
		});
	});

	describe('with files supplied and STDIN indicated', () => {
		const options = {
			files: ['a', 'b', null, 'c'],
			readFileAsync: spy(
				fileName => Promise.resolve({
					a: 'a',
					b: ' b ',
					c: ' C \n   \n\n d   \n'
				}[fileName])
			),
			getStdIn: {
				buffer: spy(() => Promise.resolve('this is\nSTDIN\n'))
			}
		};

		it('should read the files given', () => {
			inputReader(options)
				.then(result => {
					expect(options.readFileAsync.calledThrice).to.equal(true);
					expect(result).to.deep.equal(['a', 'b', 'this is', 'stdin', 'c', 'd']);
				});
		});
	});
});
