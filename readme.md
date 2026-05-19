# 🐹 Schweini-Cams for Raspberry Pi

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg?logo=docker)](https://www.docker.com/)
[![Vibe Coding](https://img.shields.io/badge/Vibe--Coding-built%20with%20%E2%9C%A8-ff69b4)](https://github.com/topics/vibe-coding)

Ein leichtgewichtiges Multi-Kamera-Setup für den Raspberry Pi mit USB-Webcams, uStreamer, Docker Compose und einem modernen Split-View-Web-UI.

> ✨ **Hinweis:** Dieses Projekt ist durch **Vibe-Coding** entstanden – fokussiert auf schnellen Fortschritt, Intuition und Spaß am Bauen.

Dieses Projekt ist für die einfache Live-Überwachung ohne Aufzeichnung konzipiert.
Typischer Anwendungsfall: Beobachtung eines Meerschweinchengeheges aus drei oder mehr Blickwinkeln im Browser.

## 🚀 Features

* **Leichtgewichtig:** Hochleistungs-Live-Streaming mit uStreamer.
* **Browser-basiert:** Multi-Kamera-Ansicht direkt im Browser (optimiert für 1-3 Kameras).
* **Smart UI:** 
    - Dynamisches Grid-Layout (passt sich automatisch an die Anzahl der Kameras an).
    - **Fokus-Modus:** Klicke eine Kamera an, um sie zu vergrößern.
    - **Vorschau:** Die anderen Kameras bleiben als Miniaturansicht/Vorschau verfügbar.
    - **Reset:** Klick auf "Splitview" oder Doppelklick kehrt zur Gesamtübersicht zurück.
* **Modularer Aufbau:** Saubere Trennung von HTML, CSS und JavaScript für einfache Anpassbarkeit.
* **Dockerized:** Einfaches Setup via Docker Compose.
* **Konfigurierbar:** Kamera-Geräte, Auflösung und FPS via `.env`.

## 🐹 Anwendungsfall

Dieses Setup ist gedacht für:

* Raspberry Pi 4 (oder vergleichbar)
* 1-3+ USB-Webcams
* Nur Live-Ansicht (sehr geringe Latenz)
* **Keine** Aufnahme, **keine** Bewegungserkennung, **keine** schwere NVR-Software.

Ideal für die wartungsarme lokale Überwachung von Haustieren oder kleinen Bereichen.

## 📂 Projektstruktur

```text
.
├── docker-compose.yml
├── .env
└── web/
    ├── index.html
    ├── nginx.conf
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

## 🛠 Voraussetzungen

* Raspberry Pi 4 (oder kompatibel)
* Raspberry Pi OS mit installiertem Docker und Docker Compose Plugin
* 1-3 kompatible USB-Webcams
* `v4l2-ctl` installiert zur Kamera-Inspektion

`v4l2-ctl` installieren, falls benötigt:

```bash
sudo apt update
sudo apt install -y v4l-utils
```

## 🔍 Kamera-Devices finden

Liste verfügbare Video-Geräte auf:

```bash
v4l2-ctl --list-devices
```

Typische Ausgabe:

```text
USB Live camera:
    /dev/video0
    /dev/video1

USB 2.0 Camera:
    /dev/video4
    /dev/video5
```

Viele Webcams legen mehrere `/dev/videoX` Devices an. Normalerweise ist nur eines davon der eigentliche Video-Stream.

Unterstützte Formate prüfen:

```bash
v4l2-ctl -d /dev/video0 --list-formats-ext
```

Relevante Geräte bieten typischerweise **JPEG/MJPEG** Modi in Auflösungen wie `1280x720` oder `1920x1080` an.

## ⚙️ Konfiguration

Alle Kamera-Einstellungen werden in der `.env` Datei gespeichert.

Beispiel für 3 Kameras:

```dotenv
CAM1_DEVICE=/dev/video0
CAM1_RESOLUTION=1280x720
CAM1_FPS=15

CAM2_DEVICE=/dev/video4
CAM2_RESOLUTION=1280x720
CAM2_FPS=15

CAM3_DEVICE=/dev/video8
CAM3_RESOLUTION=1280x720
CAM3_FPS=15
```

## 🐳 Docker Compose

Das Setup startet für jede Kamera einen eigenen uStreamer-Container und einen Nginx als Webserver/Proxy.

```bash
# Starten des Stacks
docker compose up -d
```

Der Web-Server ist standardmäßig unter Port `8090` erreichbar.

## 🌐 Web Frontend

Das Frontend wird via Nginx ausgeliefert und ist nun modular aufgebaut:
- `web/index.html`: Struktur
- `web/css/style.css`: Dynamisches Layout (Flex/Grid)
- `web/js/app.js`: Kamera-Logik und Interaktion

Du kannst weitere Kameras einfach im `cams`-Array in der `js/app.js` hinzufügen.

## 🏁 Schnellstart

1. Klone das Repo.
2. Erstelle eine `.env` basierend auf deinen Kamera-Devices.
3. Führe `docker compose up -d` aus.
4. Öffne im Browser: `http://<RASPBERRYPI-IP>:8090`

## 🔗 Direkte Stream-URLs

Raw uStreamer Feeds (direkt von den Cam-Containern):

* **Kamera 1:** `http://<RASPBERRYPI-IP>:8081/stream`
* **Kamera 2:** `http://<RASPBERRYPI-IP>:8082/stream`
* **Kamera 3:** `http://<RASPBERRYPI-IP>:8083/stream`

---

## 💡 Tipps & Fehlerbehebung

### Platform Warning
Falls beim Start eine Warnung bezüglich der Plattform erscheint (`The requested image's platform does not match the detected host platform`), wurde in der `docker-compose.yml` bereits `platform: linux/arm64` hinterlegt, um sicherzustellen, dass auf einem Raspberry Pi das korrekte Image verwendet wird.

### Format-Probleme
Falls uStreamer mit `Unknown pixel format: MJPEG` abbricht, stelle sicher, dass `--format=JPEG` verwendet wird (uStreamer erwartet den String `JPEG`).

### Performance
Für einen Pi 4 ist `1280x720` @ `15 FPS` meist ideal. Bei Rucklern versuche `960x540` oder `10 FPS`.

### Persistente Device-Namen
USB-Nummerierungen (`/dev/video0`) können sich nach einem Reboot ändern. Nutze `/dev/v4l/by-id/...` Pfade in der `.env` für ein stabileres Setup.

---

## 📜 Credits

Gebaut mit:
* [uStreamer](https://github.com/pikvm/ustreamer) (by PiKVM)
* [Docker Compose](https://www.docker.com/)
* [Nginx](https://nginx.org/)

---

## ⚖️ Lizenz

MIT
