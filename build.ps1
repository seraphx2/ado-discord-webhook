cd buildAndReleaseTask
tsc
cd..
tfx extension create --manifest-globs vss-extension.json --rev-version