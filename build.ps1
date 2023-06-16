cd ./buildAndReleaseTask

Write-Host "Clearing 'node_modules'"
if (Test-Path -Path 'node_modules') {
    Remove-Item -Path 'node_modules' -Recurse -Force
}

Write-Host "Installing dependencies"
npm install

Write-Host "Building"
npm run build

cd ..

Write-Host "Packaging"
tfx extension create --manifest-globs vss-extension.json --rev-version

Write-Host "Done"
