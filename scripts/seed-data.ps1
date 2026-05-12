# JEEVANLINK seed-data — registers demo users and creates sample data via the live API.
# Run AFTER all backend services are up and Eureka shows them green.
#
# Usage:   .\scripts\seed-data.ps1
# Gateway: http://localhost:8080 by default

$ErrorActionPreference = 'Stop'
$gateway = $env:JEEVANLINK_GATEWAY
if (-not $gateway) { $gateway = 'http://localhost:8080' }

function PostJson($path, $body, $token) {
    $headers = @{ 'Content-Type' = 'application/json' }
    if ($token) { $headers['Authorization'] = "Bearer $token" }
    Invoke-RestMethod -Uri "$gateway$path" -Method Post -Headers $headers -Body ($body | ConvertTo-Json -Depth 10)
}

function Register($email, $password, $fullName, $phone, $role) {
    Write-Host ">> Registering $email ($role)..." -ForegroundColor Cyan
    return PostJson '/api/auth/register' @{
        email = $email; password = $password; fullName = $fullName; phone = $phone; role = $role
    }
}

# ────────────── 1. HOSPITAL ──────────────
$hospital = Register 'hospital1@jeevanlink.com' 'hosp123' 'Apollo Hyderabad' '+91 9000000001' 'HOSPITAL_ADMIN'
PostJson '/api/hospitals' @{
    name = 'Apollo Hyderabad'
    address = 'Road No. 72, Jubilee Hills'
    city = 'Hyderabad'
    latitude = 17.4239; longitude = 78.4738
    contactPhone = '+91 9000000001'
} $hospital.token | Out-Null

# Seed inventory: O- low, A+ healthy, etc.
$invSeed = @(
    @{ bloodGroup = 'O_NEGATIVE';  unitsAvailable = 1 },
    @{ bloodGroup = 'O_POSITIVE';  unitsAvailable = 6 },
    @{ bloodGroup = 'A_NEGATIVE';  unitsAvailable = 3 },
    @{ bloodGroup = 'A_POSITIVE';  unitsAvailable = 8 },
    @{ bloodGroup = 'B_NEGATIVE';  unitsAvailable = 2 },
    @{ bloodGroup = 'B_POSITIVE';  unitsAvailable = 5 },
    @{ bloodGroup = 'AB_NEGATIVE'; unitsAvailable = 0 },
    @{ bloodGroup = 'AB_POSITIVE'; unitsAvailable = 4 }
)
foreach ($i in $invSeed) {
    PostJson '/api/inventory' $i $hospital.token | Out-Null
}
Write-Host "   Inventory seeded." -ForegroundColor Green

# ────────────── 2. DONORS ──────────────
$donors = @(
    @{ email='donor1@jeevanlink.com'; name='Rahul Kumar';  phone='+91 9000000002';
       bloodGroup='O_POSITIVE'; age=28; lat=17.4400; lng=78.3489 },
    @{ email='donor2@jeevanlink.com'; name='Priya Sharma'; phone='+91 9000000003';
       bloodGroup='A_NEGATIVE'; age=32; lat=17.4100; lng=78.4800 },
    @{ email='donor3@jeevanlink.com'; name='Anita Reddy';  phone='+91 9000000004';
       bloodGroup='O_NEGATIVE'; age=26; lat=17.4300; lng=78.4500 }
)

foreach ($d in $donors) {
    $tok = (Register $d.email 'donor123' $d.name $d.phone 'DONOR').token
    PostJson '/api/donors' @{
        bloodGroup = $d.bloodGroup
        age = $d.age
        latitude = $d.lat; longitude = $d.lng
        city = 'Hyderabad'
    } $tok | Out-Null
}
Write-Host "   3 donors seeded." -ForegroundColor Green

# ────────────── 3. DEMO REQUEST ──────────────
Write-Host ">> Creating demo blood request..." -ForegroundColor Cyan
$req = PostJson '/api/requests' @{
    bloodGroup = 'O_NEGATIVE'
    unitsRequired = 2
    priority = 'URGENT'
    patientName = 'Demo Patient'
    reason = 'Accident victim — surgery scheduled in 2 hours.'
} $hospital.token

Write-Host ""
Write-Host "✅ Seed complete!" -ForegroundColor Green
Write-Host ""
Write-Host "   Logins:" -ForegroundColor Yellow
Write-Host "   - hospital1@jeevanlink.com / hosp123"
Write-Host "   - donor1@jeevanlink.com / donor123 (O+)"
Write-Host "   - donor2@jeevanlink.com / donor123 (A-)"
Write-Host "   - donor3@jeevanlink.com / donor123 (O- universal)"
Write-Host ""
Write-Host "   Demo request id: $($req.id)" -ForegroundColor Yellow
