$services = "AssessmentService", "CategoryService", "CertificateService", "ContentService", "CourseService", "DiscussionService", "EnrollmentService", "IdentityService", "MediaService", "NotificationService", "PaymentService", "ProgressService", "ReviewService", "SearchService", "UserService"

foreach ($service in $services) {
    # 1. Update csproj
    $csprojPath = "Backend/microservices/$service/$service.API/$service.API.csproj"
    if (Test-Path $csprojPath) {
        $csprojContent = Get-Content $csprojPath -Raw
        if ($csprojContent -notmatch "SharedKernel.csproj") {
            $csprojContent = $csprojContent -replace "</Project>", "  <ItemGroup>`r`n    <ProjectReference Include=`"..\..\..\shared\SharedKernel\SharedKernel.csproj`" />`r`n  </ItemGroup>`r`n</Project>"
            [System.IO.File]::WriteAllText((Resolve-Path $csprojPath), $csprojContent)
            Write-Host "Updated $csprojPath"
        }
    }

    # 2. Update Program.cs
    $programPath = "Backend/microservices/$service/$service.API/Program.cs"
    if (Test-Path $programPath) {
        $programContent = Get-Content $programPath -Raw

        $updated = $false

        # Add using statement if missing
        if ($programContent -notmatch "using SharedKernel.Utilities;") {
            $programContent = "using SharedKernel.Utilities;`r`n" + $programContent
            $updated = $true
        }

        # Replace connection string
        # Regex to handle multiline and whitespace variations
        $pattern = '(?s)var\s+connectionString\s*=\s*Environment\.GetEnvironmentVariable\("DATABASE_URL"\)\s*\?\?\s*builder\.Configuration\.GetConnectionString\("DefaultConnection"\);'
        $replacement = "var connectionString = ConnectionStringHelper.ConvertToNpgsql(`r`n    Environment.GetEnvironmentVariable(`"DATABASE_URL`")`r`n    ?? builder.Configuration.GetConnectionString(`"DefaultConnection`")!);"
        
        if ($programContent -match $pattern) {
            $programContent = $programContent -replace $pattern, $replacement
            $updated = $true
        } else {
            Write-Host "Pattern NOT found in $programPath - checking for variations"
            # Try a broader pattern in case of slight variations
            $pattern2 = '(?s)var\s+connectionString\s*=\s*Environment\.GetEnvironmentVariable\("DATABASE_URL"\)\s*\?\?\s*builder\.Configuration\["ConnectionStrings:DefaultConnection"\];'
            if ($programContent -match $pattern2) {
                 $replacement2 = "var connectionString = ConnectionStringHelper.ConvertToNpgsql(`r`n    Environment.GetEnvironmentVariable(`"DATABASE_URL`")`r`n    ?? builder.Configuration[`"ConnectionStrings:DefaultConnection`"]!);"
                 $programContent = $programContent -replace $pattern2, $replacement2
                 $updated = $true
            } else {
                 Write-Host "Pattern 2 also NOT found in $programPath"
            }
        }

        if ($updated) {
            [System.IO.File]::WriteAllText((Resolve-Path $programPath), $programContent)
            Write-Host "Updated $programPath"
        }
    }
}
