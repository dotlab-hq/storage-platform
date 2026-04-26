Write-Output "Starting dev server..."
$dev = Start-Process pnpm -ArgumentList "dev" -WorkingDirectory "F:\storage-platform" -PassThru -NoNewWindow
# Give it time to compile
Start-Sleep -Seconds 15

try {
  Write-Output "Running S3 list test..."
  & pnpm --silent tsx debug-s3-list.ts
} finally {
  Write-Output "Stopping dev server..."
  Stop-Process -Id $dev.Id -Force
}
