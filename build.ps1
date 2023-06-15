cd ./buildAndReleaseTask
npm run build
cd ..
tfx extension create --manifest-globs vss-extension.json --rev-version
