$files = Get-ChildItem "Backend\Modules" -Filter *.csproj -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $content = $content -replace "(\.\.\\)+shared\\SharedKernel", "..\..\shared\SharedKernel"
    Set-Content -Path $file.FullName -Value $content
}
