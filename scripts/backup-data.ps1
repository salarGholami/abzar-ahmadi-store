param(
  [string]$BackupDir = "backups"
)

if (-not $env:GITHUB_OWNER -or -not $env:GITHUB_REPO -or -not $env:GITHUB_TOKEN) {
  Write-Error "GITHUB_OWNER, GITHUB_REPO and GITHUB_TOKEN are required."
  exit 1
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$target = Join-Path $BackupDir ("{0}-{1}.git" -f $env:GITHUB_REPO, (Get-Date -Format "yyyyMMdd-HHmmss"))
$header = "Authorization: Bearer $($env:GITHUB_TOKEN)"

git -c "http.extraHeader=$header" clone --mirror "https://github.com/$($env:GITHUB_OWNER)/$($env:GITHUB_REPO).git" $target
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Backup completed: $target"
