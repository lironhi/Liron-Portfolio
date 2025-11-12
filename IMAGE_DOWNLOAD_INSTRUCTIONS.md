# Image Download Instructions for Portfolio Projects

## Eliana Beauty

Download the following images from the GitHub repository and place them in `public/projects/eliana-beauty/`:

### From `screenshots/` folder on GitHub:

1. **main.png** - Landing page
   - URL: `https://raw.githubusercontent.com/lironhi/eliana-beauty/main/screenshots/main.png`
   - Save to: `public/projects/eliana-beauty/main.png`

2. **services.png** - Service catalog
   - URL: `https://raw.githubusercontent.com/lironhi/eliana-beauty/main/screenshots/services.png`
   - Save to: `public/projects/eliana-beauty/services.png`

3. **booking.png** - Booking interface
   - URL: `https://raw.githubusercontent.com/lironhi/eliana-beauty/main/screenshots/booking.png`
   - Save to: `public/projects/eliana-beauty/booking.png`

4. **profil.png** - Client profile
   - URL: `https://raw.githubusercontent.com/lironhi/eliana-beauty/main/screenshots/profil.png`
   - Save to: `public/projects/eliana-beauty/profil.png`

5. **msg.png** - Messaging system
   - URL: `https://raw.githubusercontent.com/lironhi/eliana-beauty/main/screenshots/msg.png`
   - Save to: `public/projects/eliana-beauty/msg.png`

6. **dashboard.png** - Admin dashboard
   - URL: `https://raw.githubusercontent.com/lironhi/eliana-beauty/main/screenshots/dashboard.png`
   - Save to: `public/projects/eliana-beauty/dashboard.png`

7. **appointment.png** - Appointment management
   - URL: `https://raw.githubusercontent.com/lironhi/eliana-beauty/main/screenshots/appointment.png`
   - Save to: `public/projects/eliana-beauty/appointment.png`

8. **main_mob.png** - Mobile landing page
   - URL: `https://raw.githubusercontent.com/lironhi/eliana-beauty/main/screenshots/main_mob.png`
   - Save to: `public/projects/eliana-beauty/main_mob.png`

## Quick Download Commands (Windows PowerShell)

```powershell
# Create directory
New-Item -ItemType Directory -Force -Path "public\projects\eliana-beauty"

# Download images
$baseUrl = "https://raw.githubusercontent.com/lironhi/eliana-beauty/main/screenshots"
$images = @("main.png", "services.png", "booking.png", "profil.png", "msg.png", "dashboard.png", "appointment.png", "main_mob.png")

foreach ($img in $images) {
    Invoke-WebRequest -Uri "$baseUrl/$img" -OutFile "public\projects\eliana-beauty\$img"
    Write-Host "Downloaded $img"
}
```

## Alternative: Manual Download

1. Visit: https://github.com/lironhi/eliana-beauty/tree/main/screenshots
2. Right-click each image and "Save image as..."
3. Save to `public/projects/eliana-beauty/` folder

---

## Next Projects to Process

- [ ] AI Security Log Analyzer
- [ ] KPI Generator
- [ ] BECS Blood Bank
- [ ] Post Tracking System
- [ ] Aquarium Frame
- [ ] DrProject
- [ ] Bot Manager
- [ ] Wedding Eva & Liron
