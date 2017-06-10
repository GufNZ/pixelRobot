import { expect } from 'chai';
import { stub } from 'sinon';

import plotValue from '../lib/plotValue';

import Robot, { facingNumber } from '../robot';

const makeRobotWithOutputHandlers = options => {
	const print = stub();
	const warn = stub();
	const robot = new Robot(Object.assign(options || {}, { print, warn }));
	return [robot, print, warn];
};

const makeRobotWithPlotStub = options => {
	const robot = new Robot(options);
	robot.plot = stub();
	return robot;
};

const makeRobotStubbedForCommands = (options = {}) => {
	const robot = new Robot(options);
	robot.log = stub();
	if (options.except !== 'checkSeenPlace') {
		robot.checkSeenPlace = stub();
	}
	if (options.except !== 'checkPlot') {
		robot.checkPlot = stub();
	}
	if (options.except !== 'plot') {
		robot.plot = stub();
	}
	if (options.except !== 'unhandledCommand') {
		robot.unhandledCommand = stub();
	}
	robot.print = stub();
	robot.warn = stub();
	return robot;
};

describe('Robot', () => {
	describe('construction', () => {
		const robot = new Robot();

		describe('initial state', () => {
			it('has an initial valid of false', () => {
				expect(robot.valid).to.equal(false);
			});
			it('has an initial x of null', () => {
				expect(robot.x).to.equal(null);
			});
			it('has an initial y of null', () => {
				expect(robot.y).to.equal(null);
			});
			it('has an initial facing of null', () => {
				expect(robot.facing).to.equal(null);
			});
			it('has an initial seenPlace of false', () => {
				expect(robot.seenPlace).to.equal(false);
			});
		});

		describe('default options', () => {
			it('has a default width of 5', () => {
				expect(robot.width).to.equal(5);
			});
			it('has a default height of 5', () => {
				expect(robot.height).to.equal(5);
			});
			it('has a default debug of false', () => {
				expect(robot.debug).to.equal(false);
			});
			it('has a default plotValue of PLOT_NEVER', () => {
				expect(robot.plotValue).to.equal(plotValue.PLOT_NEVER);
			});
			it('has a default print of console.info', () => {
				expect(robot.print).to.equal(console.info);
			});
			it('has a default warn of console.warn', () => {
				expect(robot.warn).to.equal(console.warn);
			});
			it('has a default warn of console.warn', () => {
				expect(robot.warn).to.equal(console.warn);
			});
		});

		describe('modified options', () => {
			const [otherRobot, myPrint, myWarn] = makeRobotWithOutputHandlers({
				width: 2,
				height: 3,
				debug: true,
				plot: plotValue.PLOT_ENABLED
			});

			it('has the supplied width', () => {
				expect(otherRobot.width).to.equal(2);
			});
			it('has the supplied height', () => {
				expect(otherRobot.height).to.equal(3);
			});
			it('has the supplied debug', () => {
				expect(otherRobot.debug).to.equal(true);
			});
			it('has the supplied plotValue', () => {
				expect(otherRobot.plotValue).to.equal(plotValue.PLOT_ENABLED);
			});
			it('has the supplied print', () => {
				expect(otherRobot.print).to.equal(myPrint);
			});
			it('has the supplied warn', () => {
				expect(otherRobot.warn).to.equal(myWarn);
			});
		});
	});

	describe('methods', () => {
		describe('internals', () => {
			describe('log', () => {
				const [robot, printStub] = makeRobotWithOutputHandlers();

				it('should not log when not debug', () => {
					robot.log('test');
					expect(printStub.called).to.equal(false);
				});

				const [robot2, printStub2] = makeRobotWithOutputHandlers({ debug: true });

				it('should log when not debug', () => {
					robot2.log('test');
					expect(printStub2.called).to.equal(true);
				});
			});

			describe('checkSeenPlace', () => {
				let robot;
				beforeEach(() => {
					robot = makeRobotStubbedForCommands({ except: 'checkSeenPlace', debug: true });
				});

				it('should not log if not debug and no place seen yet', () => {
					robot.debug = false;
					robot.checkSeenPlace('test');
					expect(robot.print.called).to.equal(false);
				});

				it('should log if debug and no place seen yet', () => {
					robot.checkSeenPlace('test');
					expect(robot.print.called).to.equal(true);
				});

				it('should not log if debug and place seen already', () => {
					robot.seenPlace = true;
					robot.checkSeenPlace('test');
					expect(robot.print.called).to.equal(false);
				});
			});

			describe('checkPlot', () => {
				let robot;
				beforeEach(() => {
					robot = makeRobotStubbedForCommands({ except: 'checkPlot' });
				});

				describe('post action debug output', () => {
					it('should not log if not debug', () => {
						robot.checkPlot();
						expect(robot.print.called).to.equal(false);
					});

					it('should log if debug', () => {
						robot.debug = true;
						robot.checkPlot();
						expect(robot.print.called).to.equal(true);
					});
				});

				describe('plotValue = NEVER', () => {
					it('should not plot', () => {
						robot.plotValue = plotValue.PLOT_NEVER;
						robot.checkPlot();
						expect(robot.plot.called).to.equal(false);
					});
				});

				describe('plotValue = ENABLED', () => {
					it('should not plot', () => {
						robot.plotValue = plotValue.PLOT_ENABLED;
						robot.checkPlot();
						expect(robot.plot.called).to.equal(false);
					});
				});

				describe('plotValue = ON_REPORT', () => {
					beforeEach(() => {
						robot.plotValue = plotValue.PLOT_ON_REPORT;
					});

					it('should not plot', () => {
						robot.checkPlot();
						expect(robot.plot.called).to.equal(false);
					});

					const robot2 = makeRobotWithPlotStub({ plot: plotValue.PLOT_ON_REPORT });
					it('should plot for REPORT', () => {
						robot2.checkPlot({ isReport: true });
						expect(robot2.plot.called).to.equal(true);
					});
				});

				describe('plotValue = ALWAYS', () => {
					it('should plot', () => {
						robot.plotValue = plotValue.PLOT_ALWAYS;
						robot.checkPlot();
						expect(robot.plot.called).to.equal(true);
					});
				});
			});

			describe('inBounds', () => {
				const robot = new Robot();

				it('should return true for within range x,y', () => {
					expect(robot.inBounds(1, 1)).to.equal(true);
				});
				it('should return true for within range x and minimum y', () => {
					expect(robot.inBounds(1, 0)).to.equal(true);
				});
				it('should return true for minimum x and within range y', () => {
					expect(robot.inBounds(0, 1)).to.equal(true);
				});
				it('should return true for minimum x and minimum y', () => {
					expect(robot.inBounds(0, 0)).to.equal(true);
				});
				it('should return true for within range x and maximum y', () => {
					expect(robot.inBounds(1, 4)).to.equal(true);
				});
				it('should return true for maximum x and within range y', () => {
					expect(robot.inBounds(4, 1)).to.equal(true);
				});
				it('should return true for maximum x and maximum y', () => {
					expect(robot.inBounds(4, 4)).to.equal(true);
				});

				it('should return false for within range x and low y', () => {
					expect(robot.inBounds(1, -1)).to.equal(false);
				});
				it('should return false for low x and within range y', () => {
					expect(robot.inBounds(-1, 1)).to.equal(false);
				});
				it('should return false for low x and low y', () => {
					expect(robot.inBounds(-1, -1)).to.equal(false);
				});
				it('should return false for within range x and high y', () => {
					expect(robot.inBounds(1, 5)).to.equal(false);
				});
				it('should return false for high x and within range y', () => {
					expect(robot.inBounds(5, 1)).to.equal(false);
				});
				it('should return false for high x and high y', () => {
					expect(robot.inBounds(5, 5)).to.equal(false);
				});
			});

			describe('unhandledCommand', () => {
				const robot = makeRobotStubbedForCommands({ except: 'unhandledCommand' });
				const unhandledCommandResult = robot.unhandledCommand('test');

				it('should return a function', () => {
					expect(typeof unhandledCommandResult).to.equal('function');
				});

				it('should warn when result called', () => {
					unhandledCommandResult.call(robot);
					expect(robot.warn.called).to.equal(true);
				});
			});
		});

		describe('commands', () => {
			describe('place', () => {
				const robot = makeRobotStubbedForCommands();

				describe('logs etc', () => {
					robot.place();

					it('should call log()', () => {
						expect(robot.log.called).to.equal(true);
					});
					it('should call checkPlot()', () => {
						expect(robot.checkPlot.called).to.equal(true);
					});
				});

				describe('ignores invalid input', () => {
					it('should ignore when x too low', () => {
						robot.place(-1, 1, 'NORTH');
						expect(robot.valid).to.equal(false);
						expect(robot.x).to.equal(null);
						expect(robot.y).to.equal(null);
						expect(robot.facing).to.equal(null);
					});
					it('should ignore when x too high', () => {
						robot.place(100, 1, 'NORTH');
						expect(robot.valid).to.equal(false);
					});
					it('should ignore when y too low', () => {
						robot.place(1, -1, 'NORTH');
						expect(robot.valid).to.equal(false);
					});
					it('should ignore when y too high', () => {
						robot.place(1, 100, 'NORTH');
						expect(robot.valid).to.equal(false);
					});
					it('should ignore when facing is unknown', () => {
						robot.place(1, 1, 'wug');
						expect(robot.valid).to.equal(false);
						expect(robot.x).to.equal(null);
						expect(robot.y).to.equal(null);
						expect(robot.facing).to.equal(null);
					});
				});

				describe('initialises for valid input', () => {
					let forgetfulRobot;
					beforeEach(() => {
						forgetfulRobot = makeRobotStubbedForCommands();
					});

					it('should accept a valid input #1', () => {
						forgetfulRobot.place('1', '1', 'NORTH');
						expect(forgetfulRobot.valid).to.equal(true);
						expect(forgetfulRobot.x).to.equal(1);
						expect(forgetfulRobot.y).to.equal(1);
						expect(forgetfulRobot.facing).to.equal(facingNumber.NORTH);
					});

					it('should accept a valid input #2', () => {
						forgetfulRobot.place('0', '0', 'WEST');
						expect(forgetfulRobot.valid).to.equal(true);
						expect(forgetfulRobot.x).to.equal(0);
						expect(forgetfulRobot.y).to.equal(0);
						expect(forgetfulRobot.facing).to.equal(facingNumber.WEST);
					});

					it('should accept a valid input #3', () => {
						forgetfulRobot.place('4', '4', 'EAST');
						expect(forgetfulRobot.valid).to.equal(true);
						expect(forgetfulRobot.x).to.equal(4);
						expect(forgetfulRobot.y).to.equal(4);
						expect(forgetfulRobot.facing).to.equal(facingNumber.EAST);
					});

					it('should accept a valid input #4', () => {
						forgetfulRobot.place('0', '4', 'SOUTH');
						expect(forgetfulRobot.valid).to.equal(true);
						expect(forgetfulRobot.x).to.equal(0);
						expect(forgetfulRobot.y).to.equal(4);
						expect(forgetfulRobot.facing).to.equal(facingNumber.SOUTH);
					});
				});

				describe('ignores invalid input after valid input', () => {
					const otherRobot = makeRobotStubbedForCommands();

					otherRobot.place('3', '2', 'SOUTH');
					it('should not reset', () => {
						otherRobot.place('-9', '1', 'WEST');
						expect(otherRobot.valid).to.equal(true);
						expect(otherRobot.x).to.equal(3);
						expect(otherRobot.y).to.equal(2);
						expect(otherRobot.facing).to.equal(facingNumber.SOUTH);
					});
				});

				describe('uses valid input after valid input', () => {
					const otherRobot = makeRobotStubbedForCommands();

					otherRobot.place('3', '2', 'SOUTH');
					it('should apply the last valid', () => {
						otherRobot.place('1', '0', 'EAST');
						expect(otherRobot.valid).to.equal(true);
						expect(otherRobot.x).to.equal(1);
						expect(otherRobot.y).to.equal(0);
						expect(otherRobot.facing).to.equal(facingNumber.EAST);
					});
				});
			});

			describe('move', () => {
				let robot;
				beforeEach(() => {
					robot = makeRobotStubbedForCommands();
				});

				describe('checks', () => {
					beforeEach(() => {
						robot.move();
					});
					it('should call checkSeenPlace()', () => {
						expect(robot.checkSeenPlace.called).to.equal(true);
					});
					it('should call log()', () => {
						expect(robot.log.called).to.equal(true);
					});

					describe('when not debug', () => {
						beforeEach(() => {
							robot.debug = false;
						});

						describe('and not valid', () => {
							beforeEach(() => {
								robot.valid = false;
								robot.move();
							});

							it('should not call print()', () => {
								expect(robot.print.called).to.equal(false);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should not call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(false);
							});
						});

						describe('and valid', () => {
							beforeEach(() => {
								robot.valid = true;
								robot.move();
							});

							it('should not call print()', () => {
								expect(robot.print.called).to.equal(false);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(true);
							});
						});
					});

					describe('when debug', () => {
						beforeEach(() => {
							robot.debug = true;
						});

						describe('and not valid', () => {
							beforeEach(() => {
								robot.valid = false;
								robot.move();
							});

							it('should call print()', () => {
								expect(robot.print.called).to.equal(true);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should not call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(false);
							});
						});

						describe('and valid', () => {
							beforeEach(() => {
								robot.valid = true;
								robot.move();
							});

							it('should not call print()', () => {
								expect(robot.print.called).to.equal(false);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(true);
							});
						});
					});
				});

				it('should ignore moves when invalid', () => {
					robot.move();
					expect(robot.x).to.equal(null);
					expect(robot.y).to.equal(null);
				});

				describe('given valid input', () => {
					beforeEach(() => {
						robot.place(1, 1, 'NORTH');
					});

					it('should move one space when facing NORTH', () => {
						robot.facing = facingNumber.NORTH;
						robot.move();
						expect(robot.x).to.equal(1);
						expect(robot.y).to.equal(2);
						expect(robot.warn.called).to.equal(false);
					});

					it('should move one space when facing WEST', () => {
						robot.facing = facingNumber.WEST;
						robot.move();
						expect(robot.x).to.equal(0);
						expect(robot.y).to.equal(1);
						expect(robot.warn.called).to.equal(false);
					});

					it('should move one space when facing EAST', () => {
						robot.facing = facingNumber.EAST;
						robot.move();
						expect(robot.x).to.equal(2);
						expect(robot.y).to.equal(1);
						expect(robot.warn.called).to.equal(false);
					});

					it('should move one space when facing SOUTH', () => {
						robot.facing = facingNumber.SOUTH;
						robot.move();
						expect(robot.x).to.equal(1);
						expect(robot.y).to.equal(0);
						expect(robot.warn.called).to.equal(false);
					});
				});

				describe('when at the edge', () => {
					beforeEach(() => {
						robot.width = robot.height = 1;
						robot.place(0, 0, 'NORTH');
					});

					it('should not log when moving off the edge and not debug', () => {
						robot.debug = false;
						robot.move();
						expect(robot.warn.called).to.equal(false);
					});
					it('should log when moving off the edge and not debug', () => {
						robot.debug = true;
						robot.move();
						expect(robot.warn.called).to.equal(true);
					});

					it('should ignore moving NORTH', () => {
						robot.facing = facingNumber.NORTH;
						robot.move();
						expect(robot.valid).to.equal(true);
						expect(robot.x).to.equal(0);
						expect(robot.y).to.equal(0);
						expect(robot.facing).to.equal(facingNumber.NORTH);
					});
					it('should ignore moving WEST', () => {
						robot.facing = facingNumber.WEST;
						robot.move();
						expect(robot.valid).to.equal(true);
						expect(robot.x).to.equal(0);
						expect(robot.y).to.equal(0);
						expect(robot.facing).to.equal(facingNumber.WEST);
					});
					it('should ignore moving EAST', () => {
						robot.facing = facingNumber.EAST;
						robot.move();
						expect(robot.valid).to.equal(true);
						expect(robot.x).to.equal(0);
						expect(robot.y).to.equal(0);
						expect(robot.facing).to.equal(facingNumber.EAST);
					});
					it('should ignore moving SOUTH', () => {
						robot.facing = facingNumber.SOUTH;
						robot.move();
						expect(robot.valid).to.equal(true);
						expect(robot.x).to.equal(0);
						expect(robot.y).to.equal(0);
						expect(robot.facing).to.equal(facingNumber.SOUTH);
					});
				});
			});

			describe('left', () => {
				let robot;
				beforeEach(() => {
					robot = makeRobotStubbedForCommands();
				});

				describe('checks', () => {
					beforeEach(() => {
						robot.left();
					});
					it('should call checkSeenPlace()', () => {
						expect(robot.checkSeenPlace.called).to.equal(true);
					});
					it('should call log()', () => {
						expect(robot.log.called).to.equal(true);
					});

					describe('when not debug', () => {
						beforeEach(() => {
							robot.debug = false;
						});

						describe('and not valid', () => {
							beforeEach(() => {
								robot.valid = false;
								robot.left();
							});

							it('should not call print()', () => {
								expect(robot.print.called).to.equal(false);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should not call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(false);
							});
						});

						describe('and valid', () => {
							beforeEach(() => {
								robot.valid = true;
								robot.left();
							});

							it('should not call print()', () => {
								expect(robot.print.called).to.equal(false);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(true);
							});
						});
					});

					describe('when debug', () => {
						beforeEach(() => {
							robot.debug = true;
						});

						describe('and not valid', () => {
							beforeEach(() => {
								robot.valid = false;
								robot.left();
							});

							it('should call print()', () => {
								expect(robot.print.called).to.equal(true);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should not call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(false);
							});
						});

						describe('and valid', () => {
							beforeEach(() => {
								robot.valid = true;
								robot.left();
							});

							it('should not call print()', () => {
								expect(robot.print.called).to.equal(false);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(true);
							});
						});
					});
				});

				it('should ignore turns when invalid', () => {
					robot.left();
					expect(robot.facing).to.equal(null);
				});

				describe('given valid input', () => {
					beforeEach(() => {
						robot.place(1, 1, 'NORTH');
					});

					it('should turn left when facing NORTH', () => {
						robot.facing = facingNumber.NORTH;
						robot.left();
						expect(robot.facing).to.equal(facingNumber.WEST);
						expect(robot.warn.called).to.equal(false);
					});

					it('should turn left when facing WEST', () => {
						robot.facing = facingNumber.WEST;
						robot.left();
						expect(robot.facing).to.equal(facingNumber.SOUTH);
						expect(robot.warn.called).to.equal(false);
					});

					it('should turn left when facing EAST', () => {
						robot.facing = facingNumber.EAST;
						robot.left();
						expect(robot.facing).to.equal(facingNumber.NORTH);
						expect(robot.warn.called).to.equal(false);
					});

					it('should turn left when facing SOUTH', () => {
						robot.facing = facingNumber.SOUTH;
						robot.left();
						expect(robot.facing).to.equal(facingNumber.EAST);
						expect(robot.warn.called).to.equal(false);
					});
				});
			});

			describe('right', () => {
				let robot;
				beforeEach(() => {
					robot = makeRobotStubbedForCommands();
				});

				describe('checks', () => {
					beforeEach(() => {
						robot.right();
					});
					it('should call checkSeenPlace()', () => {
						expect(robot.checkSeenPlace.called).to.equal(true);
					});
					it('should call log()', () => {
						expect(robot.log.called).to.equal(true);
					});

					describe('when not debug', () => {
						beforeEach(() => {
							robot.debug = false;
						});

						describe('and not valid', () => {
							beforeEach(() => {
								robot.valid = false;
								robot.right();
							});

							it('should not call print()', () => {
								expect(robot.print.called).to.equal(false);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should not call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(false);
							});
						});

						describe('and valid', () => {
							beforeEach(() => {
								robot.valid = true;
								robot.right();
							});

							it('should not call print()', () => {
								expect(robot.print.called).to.equal(false);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(true);
							});
						});
					});

					describe('when debug', () => {
						beforeEach(() => {
							robot.debug = true;
						});

						describe('and not valid', () => {
							beforeEach(() => {
								robot.valid = false;
								robot.right();
							});

							it('should call print()', () => {
								expect(robot.print.called).to.equal(true);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should not call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(false);
							});
						});

						describe('and valid', () => {
							beforeEach(() => {
								robot.valid = true;
								robot.right();
							});

							it('should not call print()', () => {
								expect(robot.print.called).to.equal(false);
							});
							it('should not call warn()', () => {
								expect(robot.warn.called).to.equal(false);
							});
							it('should call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(true);
							});
						});
					});
				});

				it('should ignore turns when invalid', () => {
					robot.right();
					expect(robot.facing).to.equal(null);
				});

				describe('given valid input', () => {
					beforeEach(() => {
						robot.place(1, 1, 'NORTH');
					});

					it('should turn right when facing NORTH', () => {
						robot.facing = facingNumber.NORTH;
						robot.right();
						expect(robot.facing).to.equal(facingNumber.EAST);
						expect(robot.warn.called).to.equal(false);
					});

					it('should turn right when facing WEST', () => {
						robot.facing = facingNumber.WEST;
						robot.right();
						expect(robot.facing).to.equal(facingNumber.NORTH);
						expect(robot.warn.called).to.equal(false);
					});

					it('should turn right when facing EAST', () => {
						robot.facing = facingNumber.EAST;
						robot.right();
						expect(robot.facing).to.equal(facingNumber.SOUTH);
						expect(robot.warn.called).to.equal(false);
					});

					it('should turn right when facing SOUTH', () => {
						robot.facing = facingNumber.SOUTH;
						robot.right();
						expect(robot.facing).to.equal(facingNumber.WEST);
						expect(robot.warn.called).to.equal(false);
					});
				});
			});

			describe('report', () => {
				let robot;
				beforeEach(() => {
					robot = makeRobotStubbedForCommands();
				});

				describe('checks', () => {
					beforeEach(() => {
						robot.report();
					});
					it('should call checkSeenPlace()', () => {
						expect(robot.checkSeenPlace.called).to.equal(true);
					});
					it('should call log()', () => {
						expect(robot.log.called).to.equal(true);
					});

					describe('when not debug', () => {
						beforeEach(() => {
							robot.debug = false;
						});

						describe('and not valid', () => {
							beforeEach(() => {
								robot.valid = false;
								robot.report();
							});

							it('should not call print()', () => {
								expect(robot.print.called).to.equal(false);
							});
							it('should not call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(false);
							});
						});

						describe('and valid', () => {
							beforeEach(() => {
								robot.valid = true;
								robot.report();
							});

							it('should not call print(Not valid yet!)', () => {
								expect(robot.print.callCount).to.equal(1);
								expect(robot.print.calledWith('Not valid yet!')).to.equal(false);
							});
							it('should call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(true);
							});
						});
					});

					describe('when debug', () => {
						beforeEach(() => {
							robot.debug = true;
						});

						describe('and not valid', () => {
							beforeEach(() => {
								robot.valid = false;
								robot.report();
							});

							it('should call print(Not valid yet!)', () => {
								expect(robot.print.callCount).to.equal(1);
								expect(robot.print.calledWith('Not valid yet!')).to.equal(true);
							});
							it('should not call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(false);
							});
						});

						describe('and valid', () => {
							beforeEach(() => {
								robot.valid = true;
								robot.report();
							});

							it('should not call print(Not valid yet!)', () => {
								expect(robot.print.callCount).to.equal(1);
								expect(robot.print.calledWith).to.not.equal('Not valid yet!');
							});
							it('should call checkPlot()', () => {
								expect(robot.checkPlot.called).to.equal(true);
							});
						});
					});
				});

				it('should ignore when invalid', () => {
					robot.report();
					expect(robot.print.called).to.equal(false);
				});

				describe('given valid input', () => {
					[
						'1, 1, NORTH',
						'0, 0, SOUTH',
						'4, 4, EAST',
						'0, 4, WEST',
						'4, 0, NORTH',
						'2, 3, WEST'
					].forEach(result => {
						it(`should report state for ${result}`, () => {
							robot.place(...result.split(',').map(arg => arg.trim()));
							robot.report();
							expect(robot.print.calledOnce).to.equal(true);
							expect(robot.print.calledWith(result)).to.equal(true);
						});
					});
				});
			});

			describe('plot', () => {
				let robot;
				let unhandledCallStub;

				beforeEach(() => {
					robot = makeRobotStubbedForCommands({ except: 'plot' });

					unhandledCallStub = stub();
					robot.unhandledCommand.withArgs('PLOT').returns(unhandledCallStub);
				});

				it('should call log()', () => {
					robot.plot();
					expect(robot.log.called).to.equal(true);
				});

				describe('when plot is NEVER', () => {
					beforeEach(() => {
						robot.plotValue = plotValue.PLOT_NEVER;
					});

					it('should forward to unhandledCommand', () => {
						robot.plot();
						expect(robot.unhandledCommand.withArgs('PLOT').called).to.equal(true);
						expect(unhandledCallStub.calledOnce).to.equal(true);
					});
				});

				describe('when plot not NEVER', () => {
					beforeEach(() => {
						robot.plotValue = plotValue.PLOT_ALWAYS;
					});

					describe('and robot not placed validly yet', () => {
						const tests = {
							'1x1': [
								'+-+',
								'|.|',
								'+-+'
							],
							'2x1': [
								'+--+',
								'|..|',
								'+--+'
							],
							'2x2': [
								'+--+',
								'|..|',
								'|..|',
								'+--+'
							],
							'3x1': [
								'+---+',
								'|...|',
								'+---+'
							],
							'1x3': [
								'+-+',
								'|.|',
								'|.|',
								'|.|',
								'+-+'
							],
							'4x3': [
								'+----+',
								'|....|',
								'|....|',
								'|....|',
								'+----+'
							],
							'5x5': [
								'+-----+',
								'|.....|',
								'|.....|',
								'|.....|',
								'|.....|',
								'|.....|',
								'+-----+'
							],
							'7x7': [
								'+-------+',
								'|.......|',
								'|.......|',
								'|.......|',
								'|.......|',
								'|.......|',
								'|.......|',
								'|.......|',
								'+-------+'
							],
							'8x8': [
								'+--------+',
								'|........|',
								'|........|',
								'|........|',
								'|........|',
								'|........|',
								'|........|',
								'|........|',
								'|........|',
								'+--------+'
							],
							'16x9': [
								'+----------------+',
								'|................|',
								'|................|',
								'|................|',
								'|................|',
								'|................|',
								'|................|',
								'|................|',
								'|................|',
								'|................|',
								'+----------------+'
							]
						};

						Object.keys(tests).forEach(key => {
							it(`should plot an empty board sized ${key}`, () => {
								const [w, h] = key.split('x').map(n => +n);
								robot.width = w;
								robot.height = h;
								robot.plot();
								expect(robot.unhandledCommand.called).to.equal(false);
								expect(robot.print.callCount).to.equal(robot.height + 2);
								const result = [];
								for (let i = 0, len = robot.height + 2; i < len; i++) {
									result.push(robot.print.args[i][0]);
								}
								expect(result).to.deep.equal(tests[key], key);
							});
						});
					});

					describe('and robot placed validly on the default table size', () => {
						const tests = {
							'0,0,NORTH': [
								'+-----+',
								'|.....|',
								'|.....|',
								'|.....|',
								'|.....|',
								'|^....|',
								'+-----+'
							],
							'0,0,WEST': [
								'+-----+',
								'|.....|',
								'|.....|',
								'|.....|',
								'|.....|',
								'|<....|',
								'+-----+'
							],
							'0,0,EAST': [
								'+-----+',
								'|.....|',
								'|.....|',
								'|.....|',
								'|.....|',
								'|>....|',
								'+-----+'
							],
							'0,0,SOUTH': [
								'+-----+',
								'|.....|',
								'|.....|',
								'|.....|',
								'|.....|',
								'|v....|',
								'+-----+'
							],
							'1,1,NORTH': [
								'+-----+',
								'|.....|',
								'|.....|',
								'|.....|',
								'|.^...|',
								'|.....|',
								'+-----+'
							],
							'2,3,WEST': [
								'+-----+',
								'|.....|',
								'|..<..|',
								'|.....|',
								'|.....|',
								'|.....|',
								'+-----+'
							],
							'4,0,EAST': [
								'+-----+',
								'|.....|',
								'|.....|',
								'|.....|',
								'|.....|',
								'|....>|',
								'+-----+'
							],
							'0,4,SOUTH': [
								'+-----+',
								'|v....|',
								'|.....|',
								'|.....|',
								'|.....|',
								'|.....|',
								'+-----+'
							],
							'4,4,NORTH': [
								'+-----+',
								'|....^|',
								'|.....|',
								'|.....|',
								'|.....|',
								'|.....|',
								'+-----+'
							]
						};

						Object.keys(tests).forEach(key => {
							it(`should plot an empty board sized ${key}`, () => {
								robot.width = 5;
								robot.height = 5;
								robot.place(...key.split(','));
								robot.plot();
								expect(robot.unhandledCommand.called).to.equal(false);
								expect(robot.print.callCount).to.equal(robot.height + 2);
								const result = [];
								for (let i = 0, len = robot.height + 2; i < len; i++) {
									result.push(robot.print.args[i][0]);
								}
								expect(result).to.deep.equal(tests[key], key);
							});
						});
					});
				});
			});
		});
	});
});
