# Scorll Makefile
VERSION := $(shell date +%Y%m%d%H%M%S)
RELEASE_NAME := "r$(VERSION)"

RELEASEPATH = public/release
LIBSPATH = libs
PUBLICPATH = public/scorll
BUILDSCRIPTPATH = public/util/buildscripts
BUILDPROFILEPATH = ../../scorll.profile.js
UTILPATH = $(shell pwd)/util
BUILDCOMMAND = sh build.sh profileFile=$(BUILDPROFILEPATH) action=release releaseName=$(RELEASE_NAME) cssOptimize=comments
BEAUTYCOMMAND = find . -name *.js | xargs -n 1 -I FILE sh -c "python $(UTILPATH)/jsbeautifier.py -s2 --brace-style=end-expand -k -j -o FILE.jsbttmp FILE; mv FILE.jsbttmp FILE"

all:
	@echo "Use make build"

build:
	cd $(RELEASEPATH); rm -rf r*;
	@echo "Running build command..."
	@echo $(BUILDCOMMAND)
	cd $(BUILDSCRIPTPATH); $(BUILDCOMMAND)
	@echo "Build command finished"
	@echo $(RELEASE_NAME) | cat > config.release-revision

beauty:
	cd $(LIBSPATH); $(BEAUTYCOMMAND)
	cd $(PUBLICPATH); $(BEAUTYCOMMAND)

test-vows:
	vows
