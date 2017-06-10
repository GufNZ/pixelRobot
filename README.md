# PixelRobot
Code test for Pixel.

	yarn install
	#yarn run test
	yarn run build
	yarn run start -- <args>

----

## Arguments:
* If none, the same as passing `-`, except that the input lines are echoed when `STDIN` is not a TTY.
* `-w value` | `--width=value`: set a new width; defaults to `5`.
* `-h value` | `--height=value`: set a new height; defaults to `5`.
* `-p value` | `--plot=value`: enable table plotting:
	* `never`|`off`|`0`: PLOT command ignored.
	* `enabled`|`on`|`1`: PLOT command enabled; will plot the table when encountered in the input.
	* `on-report`|`2`: PLOT command automatically invoked when REPORT is encountered in the input.
	* `always`|`3`: PLOT command invoked after every command in the input.
* `-D` | `--debug`: Enable debug output.
* `--`: All remaining args are files, regardless of if they start with `-`.
* Otherwise args are a list of filenames to read from, where `-` means `STDIN`.  These are concatenated to form the input stream.
