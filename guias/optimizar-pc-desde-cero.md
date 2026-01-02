---
layout: default
title: "Optimiza tu PC desde cero"
permalink: /guias/optimizar-pc-desde-cero/
description: "Checklist completa en español para dejar tu PC limpio, rápido y actualizado con comandos, registros y automatizaciones de Windows 10/11."
keywords:
  - "optimizar pc"
  - "windows 11 rapido"
  - "comandos rendimiento"
  - "registros windows"
hero:
  title: "PC afinado desde cero"
  subtitle: "Ajustes rápidos, limpieza profunda y parches sin perder estabilidad"
---

# Optimiza tu PC desde cero

Arranca un equipo recién formateado (o saturado) y déjalo como nuevo con una hoja de ruta clara. Todas las instrucciones están pensadas para Windows 10/11 en castellano, priorizan estabilidad y te indican qué comandos, servicios y registros tocar.

> 🎯 **Objetivo exprés:** en 25 minutos tendrás drivers al día, almacenamiento limpio, red optimizada y un plan de mantenimiento automático.

## Checklist relámpago

- 🔌 Fuente, RAM y SSD verificados; BIOS/UEFI actualizado.
- 📦 Controladores al día (GPU, chipset, red) + Windows Update limpio.
- 🧹 Disco y registro depurados con herramientas nativas.
- 🎮 Plan de energía y juegos configurado; overlays innecesarios desactivados.
- 📶 Red con DNS fiable, caché limpia y colas de QoS activas.
- 🤖 Script programado para repetir limpieza y comprobaciones cada semana.

## 1) Preparación física y firmware

1. **Revisa hardware:** limpia polvo, comprueba cables SATA/NVMe y RAM con Memtest86+.
2. **Actualiza BIOS/UEFI** desde la utilidad del fabricante (EZ Flash, M-Flash…). Activa:
   - XMP/EXPO para la RAM.
   - Resizable BAR (si tu GPU lo soporta).
   - Arranque UEFI + TPM activo para BitLocker.
3. **Perfiles de ventilación:** usa curvas silenciosas en reposo y agresivas a partir de 70 °C.

## 2) Comandos esenciales de Windows

Ejecuta PowerShell como administrador y sigue este bloque en orden:

```powershell
# Actualizaciones críticas y drivers
winget upgrade --all --silent

# Integridad de sistema
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
chkdsk C: /scan

# Limpieza rápida
cleanmgr /sageset:1; cleanmgr /sagerun:1
$prefetchPath = "$env:SystemRoot\\Prefetch"; Remove-Item "$prefetchPath\\*" -Force -ErrorAction SilentlyContinue

# Energía y arranque
powercfg -h off                        # Desactiva hibernación y libera espacio
powercfg /setactive SCHEME_MIN         # Alto rendimiento
bcdedit /set disabledynamictick yes    # Reduce micro-pauses en portátiles

# Red estable
ipconfig /flushdns
netsh int ip reset
netsh winsock reset
```

> 💡 Si usas portátil, crea un plan adicional con `powercfg /duplicate SCHEME_BALANCED` y ajusta solo la GPU y el procesador cuando tengas batería.

## 3) Servicios y tareas que consumen recursos

- **Desactiva lo que no uses:**
  - Xbox Game Bar (`Settings > Juegos > Barra de juegos` → off).
  - Capturas y DVR en segundo plano (`Settings > Juegos > Capturas`).
  - Apps en segundo plano que no aporten (`Settings > Apps > Apps en segundo plano`).
- **Programador de tareas:** revisa en *Task Scheduler* la carpeta `\\Microsoft\\Office` y `\\Microsoft\\Edge` para deshabilitar tareas de telemetría si no usas esos programas.
- **Inicio:** en el Administrador de tareas deja solo antivirus, drivers (NVIDIA/AMD/Intel) y apps imprescindibles.

## 4) Registros seguros para aligerar Windows

> ⚠️ Toca el registro con cuidado. Exporta primero (`reg export HKLM backup.reg`).

Ejecuta en PowerShell (admin):

```powershell
# Telemetría básica (sin romper Windows Update)
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection" /v AllowTelemetry /t REG_DWORD /d 1 /f

# Desactivar Game Bar y capturas automáticas
reg add "HKCU\SOFTWARE\Microsoft\GameBar" /v UseNexusForGameBarEnabled /t REG_DWORD /d 0 /f
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR" /v AppCaptureEnabled /t REG_DWORD /d 0 /f

# Animaciones ligeras en el explorador
reg add "HKCU\Control Panel\Desktop" /v MenuShowDelay /t REG_SZ /d 50 /f
reg add "HKCU\Control Panel\Desktop" /v MouseHoverTime /t REG_SZ /d 150 /f

# Evitar aplicaciones sugeridas y reinstalaciones automáticas
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\CloudContent" /v DisableWindowsConsumerFeatures /t REG_DWORD /d 1 /f
```

## 5) Rendimiento en juegos

- **Panel de GPU:** fuerza *Low Latency* (NVIDIA) o *Anti-Lag+* (AMD) y limita los FPS al 2–3 % bajo la tasa de refresco para reducir stutter.
- **Modo juego de Windows:** déjalo activado, pero desactiva las notificaciones y superposiciones.
- **Audio:** usa 48 kHz / 24 bits para reducir latencia sin perder calidad.
- **Almacenamiento:** instala los juegos en SSD NVMe, activa *Hardware Accelerated GPU Scheduling* (`Settings > Sistema > Pantalla > Gráficos`).

## 6) Red y latencia estable

- DNS mixto: 1.1.1.1 / 1.0.0.1 o 9.9.9.9 en IPv4 e IPv6.
- QoS para juegos:

```powershell
New-NetQosPolicy -Name "Gaming" -AppPathNameMatchCondition "*" -IPProtocolMatchCondition Both -PriorityValue8021Action 3 -NetworkProfile All -DSCPValue 46
```

- Wi‑Fi: fuerza 5 GHz/6 GHz cuando sea posible, desactiva ahorro de energía en el adaptador (`Administrador de dispositivos > Adaptador > Administración de energía`).

## 7) Automatiza el mantenimiento

Guarda este script como `C:\scripts\mantenimiento.ps1` y programa su ejecución semanal en el Programador de tareas:

```powershell
winget upgrade --all --silent
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
cleanmgr /sagerun:1
ipconfig /flushdns
Get-ChildItem "$env:TEMP" -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
Get-ChildItem "$env:SystemRoot\\SoftwareDistribution\\Download" -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
```

## 8) Qué no tocar (para mantener estabilidad)

- No borres el contenido de `C:\Windows\WinSxS` ni uses optimizadores agresivos.
- Evita deshabilitar Windows Update por completo; mejor programa las horas activas.
- No desactives el servicio de indexado si usas Outlook o buscas muchos archivos.

## Plantilla para adaptarla a tu PC

| Área | Ajuste | Herramienta sugerida |
| --- | --- | --- |
| Audio | Ajusta latencia y desactiva efectos 3D innecesarios | Panel de sonido clásico → Propiedades → Avanzado |
| Almacenamiento | Activa TRIM y revisa sectores | `fsutil behavior set DisableDeleteNotify 0` |
| Seguridad | Defender activo + análisis rápido semanal | `MpCmdRun -Scan -ScanType 1` |
| Creators/Streamers | Prioridad de OBS a Alta y perfil *Performance* | Configuración de OBS → Avanzado |

Con estas acciones tendrás un PC ágil y listo para juegos, estudio o edición sin depender de software mágico. Guarda la guía en marcadores y vuelve cuando necesites repetir el mantenimiento.
