# PowerShell script to update API URLs in React components
$files = Get-ChildItem -Path src -Recurse -Include "*.jsx","*.js" | Where-Object {
    Select-String -Path $_.FullName -Pattern "localhost:5000" -Quiet
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Add import if not already present
    if ($content -notmatch "import.*API_BASE_URL.*from.*constants/api") {
        # Find the last import line and add our import after it
        $importPattern = "import.*from.*;"
        $lastImportMatch = [regex]::Matches($content, $importPattern) | Select-Object -Last 1

        if ($lastImportMatch) {
            $importLine = $lastImportMatch.Value
            $newImport = "import { API_BASE_URL } from '../constants/api';"
            $content = $content -replace [regex]::Escape($importLine), "$importLine`n$newImport"
        }
    }

    # Replace localhost URLs with environment variable
    $content = $content -replace "http://localhost:5000", '${API_BASE_URL}'

    # Write back to file
    Set-Content -Path $file.FullName -Value $content
    Write-Host "Updated: $($file.FullName)"
}

Write-Host "All files updated!"