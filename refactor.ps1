$ErrorActionPreference = 'Stop'
cd Backend
mkdir Modules -ErrorAction SilentlyContinue
mkdir Monolith.API/Controllers -ErrorAction SilentlyContinue

dotnet new webapi -n Monolith.API -o Monolith.API --no-https --force
Remove-Item Monolith.API/Program.cs -Force
Remove-Item Monolith.API/Controllers/* -Recurse -Force

$services = Get-ChildItem microservices -Directory | Select-Object -ExpandProperty Name
foreach ($svc in $services) {
    if (-Not (Test-Path "microservices/$svc")) { continue }
    
    # Move layers
    foreach ($layer in @('Domain', 'Application', 'Infrastructure')) {
        $src = "microservices/$svc/$svc.$layer"
        $dest = "Modules/$svc.$layer"
        if (Test-Path $src) {
            Move-Item -Path $src -Destination $dest
            # Fix project references internally
            $csproj = Get-ChildItem "$dest" -Filter *.csproj | Select-Object -First 1
            if ($csproj) {
                (Get-Content $csproj.FullName) -replace "\.\.\\$svc\.", "..\$svc." | Set-Content $csproj.FullName
                (Get-Content $csproj.FullName) -replace "\.\.\\\.\.\\shared\\SharedKernel", "..\..\shared\SharedKernel" | Set-Content $csproj.FullName
            }
        }
    }
    
    # Move controllers
    $api = "microservices/$svc/$svc.API"
    if (Test-Path "$api/Controllers") {
        mkdir "Monolith.API/Controllers/$svc" -ErrorAction SilentlyContinue
        Copy-Item -Path "$api/Controllers/*" -Destination "Monolith.API/Controllers/$svc/" -Recurse
    }
}
