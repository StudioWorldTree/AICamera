#!/usr/bin/env bash
# Pull main, build the SSG notebook for fractal1 (root base, live bay), publish atomically.
# Runs from aicam-site-build.service. `--force` rebuilds an unchanged rev.
set -euo pipefail

# Wrapped so bash parses the whole script before `git reset` can rewrite this file.
main() {
	local repo=${AICAM_REPO:-/home/dorje/src/AICamera}
	local out=${AICAM_OUT:-/srv/aicam}
	cd "$repo"

	git fetch --quiet origin main
	local rev
	rev=$(git rev-parse origin/main)
	if [[ ${1:-} != --force && $(readlink "$out/site" 2>/dev/null) == "$out/releases/$rev" ]]; then
		exit 0
	fi

	git reset --quiet --hard "$rev"
	bun install --frozen-lockfile
	BASE_PATH='' VITE_BAY_LIVE=1 bun run build

	mkdir -p "$out/releases"
	rm -rf "$out/releases/$rev"
	cp -a build "$out/releases/$rev"
	ln -sfn "$out/releases/$rev" "$out/site.next"
	mv -T "$out/site.next" "$out/site"

	# Keep the three newest releases.
	ls -1dt "$out"/releases/*/ | tail -n +4 | xargs -r rm -rf
	echo "published $rev"
}

main "$@"
