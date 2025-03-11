# Get all TypeScript files
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"

# Process each file
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $modified = $false
    
    # Replace ToastService.toast.success with ToastService.success
    if ($content -match "ToastService\.toast\.success") {
        $content = $content -replace "ToastService\.toast\.success", "ToastService.success"
        $modified = $true
    }
    
    # Replace ToastService.toast.error with ToastService.error
    if ($content -match "ToastService\.toast\.error") {
        $content = $content -replace "ToastService\.toast\.error", "ToastService.error"
        $modified = $true
    }
    
    # Replace ToastService.toast.warning with ToastService.warning
    if ($content -match "ToastService\.toast\.warning") {
        $content = $content -replace "ToastService\.toast\.warning", "ToastService.warning"
        $modified = $true
    }
    
    # Replace ToastService.toast.info with ToastService.info
    if ($content -match "ToastService\.toast\.info") {
        $content = $content -replace "ToastService\.toast\.info", "ToastService.info"
        $modified = $true
    }
    
    # Save the file if it was modified
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Fixed ToastService references in $($file.FullName)"
    }
}

Write-Host "Done!" 