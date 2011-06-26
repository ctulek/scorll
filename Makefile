# Scorll Makefile
VERSION := $(shell date +%Y%m%d%H%M%S)
RELEASE_NAME := "r$(VERSION)"

all:
	@echo "Use make build"

RELEASEPATH = public/release
BUILDSCRIPTPATH = public/util/buildscripts
BUILDPROFILE = ../../scorll.profile.js
BUILDCOMMAND = sh build.sh profileFile=$(BUILDPROFILE) action=release releaseName=$(RELEASE_NAME) cssOptimize=comments
build:
	cd $(RELEASEPATH); rm -rf r*;
	@echo "Running build command..."
	@echo $(BUILDCOMMAND)
	cd $(BUILDSCRIPTPATH); $(BUILDCOMMAND)
	@echo "Build command finished"
	@echo $(RELEASE_NAME) | cat > config.release-revision
test-vows:
	vows
