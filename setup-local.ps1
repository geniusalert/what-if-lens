$ErrorActionPreference = 'Stop'
$target = Join-Path $PSScriptRoot '.env'
$secureKey = Read-Host 'Meta API key (hidden)' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
    $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    if ([string]::IsNullOrWhiteSpace($plainKey) -or $plainKey.Contains("`n") -or $plainKey.Contains('"')) { throw 'Invalid key.' }
    [IO.File]::WriteAllText($target, 'MODEL_API_KEY="' + $plainKey + '"' + [Environment]::NewLine + 'META_MODEL=muse-spark-1.3' + [Environment]::NewLine)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    $plainKey = $null
    $secureKey = $null
}
Write-Host 'Saved to the ignored local .env file. Run npm run dev. Hosted secrets are configured separately.'
