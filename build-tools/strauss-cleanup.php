<?php
/**
 * Post-Strauss vendor cleanup — cross-platform (Linux / macOS / Windows).
 *
 * Replaces the UNIX-only shell steps that used to run after Strauss:
 *     rm -rf vendor/paragonie
 *     find vendor -mindepth 1 -maxdepth 1 -type d -empty -delete
 *
 * Strauss copies the runtime libs into vendor/prefixed/ and (with
 * delete_vendor_packages) removes the originals, which can leave the
 * un-prefixed paragonie copy and a scatter of now-empty top-level dirs.
 * This script removes them using only PHP, so `composer run build` behaves
 * identically on every OS.
 *
 * Run from the plugin root (composer runs scripts with CWD = composer.json dir):
 *     @php build-tools/strauss-cleanup.php
 */

// Directories under vendor/ to always remove (un-prefixed leftovers).
$forceRemove = ['vendor/paragonie'];

// Recursively delete a directory (no-op if it does not exist).
$rrmdir = static function (string $dir) use (&$rrmdir): void {
	if (!is_dir($dir)) {
		return;
	}
	foreach (scandir($dir) as $entry) {
		if ($entry === '.' || $entry === '..') {
			continue;
		}
		$path = $dir . DIRECTORY_SEPARATOR . $entry;
		if (is_dir($path) && !is_link($path)) {
			$rrmdir($path);
		} else {
			@unlink($path);
		}
	}
	@rmdir($dir);
};

foreach ($forceRemove as $dir) {
	if (is_dir($dir)) {
		$rrmdir($dir);
		echo "[cleanup] removed {$dir}\n";
	}
}

// Delete now-empty top-level directories directly under vendor/.
$removedEmpty = 0;
foreach (glob('vendor/*', GLOB_ONLYDIR) ?: [] as $dir) {
	// scandir on an empty dir returns exactly ['.', '..'].
	if (count(scandir($dir)) === 2) {
		@rmdir($dir);
		$removedEmpty++;
	}
}
if ($removedEmpty > 0) {
	echo "[cleanup] removed {$removedEmpty} empty vendor/ dir(s)\n";
}
