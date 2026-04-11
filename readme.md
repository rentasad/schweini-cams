# 🐹 Schweini-Cams for Raspberry Pi

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg?logo=docker)](https://www.docker.com/)
[![Vibe Coding](https://img.shields.io/badge/Vibe--Coding-built%20with%20%E2%9C%A8-ff69b4)](https://github.com/topics/vibe-coding)

A lightweight multi-camera browser setup for Raspberry Pi using USB webcams, uStreamer, Docker Compose, and a small split-view web UI.

> ✨ **Note:** Dieses Projekt ist durch **Vibe-Coding** entstanden – fokussiert auf schnellen Fortschritt, Intuition und Spaß am Bauen.

This project is designed for simple live monitoring without recording.
Typical use case: watching a guinea pig cage from two or more angles in the browser.

## 🚀 Features

* **Lightweight:** High-performance live streaming with uStreamer.
* **Browser-based:** Multi-camera view directly in your browser.
* **Smart UI:** Split-view for two cameras, click to enlarge, preview remains visible.
* **Dockerized:** Easy setup via Docker Compose.
* **Configurable:** Camera device, resolution, and FPS via `.env`.
* **Scalable:** Easily extendable to 3 or more cameras.

## 🐹 Use case

This setup is intended for:

* Raspberry Pi 4 (or similar)
* 2+ USB webcams
* Simple live view only (low latency)
* **No** recording, **no** motion detection, **no** heavy NVR software.

It is ideal for low-maintenance local monitoring of pets or small areas.

## 📂 Project structure

```text
.
├── compose.yaml
├── .env
└── web/
    ├── index.html
    └── nginx.conf
```

## 🛠 Requirements

* Raspberry Pi 4 (or compatible)
* Raspberry Pi OS with Docker and Docker Compose plugin installed
* 2+ compatible USB webcams
* `v4l2-ctl` installed for camera inspection

Install `v4l2-ctl` if needed:

```bash
sudo apt update
sudo apt install -y v4l-utils
```

## 🔍 Find your camera devices

List available video devices:

```bash
v4l2-ctl --list-devices
```

Typical output:

```text
USB Live camera:
    /dev/video0
    /dev/video1
    /dev/video2
    /dev/video3

USB 2.0 Camera:
    /dev/video4
    /dev/video5
```

Many webcams expose multiple `/dev/videoX` devices. Usually only one of them is the actual video stream.

Inspect supported formats:

```bash
v4l2-ctl -d /dev/video0 --list-formats-ext
v4l2-ctl -d /dev/video4 --list-formats-ext
```

Relevant devices typically offer **JPEG/MJPEG** modes in resolutions like `1280x720` or `1920x1080`.

## ⚙️ Configuration

All camera settings are stored in `.env`.

Example:

```dotenv
CAM1_DEVICE=/dev/video0
CAM1_RESOLUTION=1280x720
CAM1_FPS=15

CAM2_DEVICE=/dev/video4
CAM2_RESOLUTION=1280x720
CAM2_FPS=15
```

## 🐳 Docker Compose

Example `compose.yaml`:

```yaml
services:
  cam1:
    image: beholderrpa/ustreamer:latest
    container_name: ustreamer-cam1
    restart: unless-stopped
    devices:
      - "${CAM1_DEVICE}:/dev/video0"
    command:
      - "--device=/dev/video0"
      - "--host=0.0.0.0"
      - "--port=8080"
      - "--resolution=${CAM1_RESOLUTION}"
      - "--desired-fps=${CAM1_FPS}"
      - "--format=JPEG"
      - "--persistent"
      - "--drop-same-frames=30"
    ports:
      - "8081:8080"

  cam2:
    image: beholderrpa/ustreamer:latest
    container_name: ustreamer-cam2
    restart: unless-stopped
    devices:
      - "${CAM2_DEVICE}:/dev/video0"
    command:
      - "--device=/dev/video0"
      - "--host=0.0.0.0"
      - "--port=8080"
      - "--resolution=${CAM2_RESOLUTION}"
      - "--desired-fps=${CAM2_FPS}"
      - "--format=JPEG"
      - "--persistent"
      - "--drop-same-frames=30"
    ports:
      - "8082:8080"

  web:
    image: nginx:alpine
    container_name: schweini-web
    restart: unless-stopped
    depends_on:
      - cam1
      - cam2
    ports:
      - "8090:80"
    volumes:
      - ./web/index.html:/usr/share/nginx/html/index.html:ro
      - ./web/nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

## 🌐 Web Frontend

The web frontend is served via Nginx and provides:

* **Split-view** for both cameras.
* **Focus mode:** Click a camera to enlarge it.
* **Preview:** The second camera stays visible as a small preview.
* **Reset:** Double-click returns to split-view.

## 🏁 Start the stack

```bash
docker compose up -d
```

Check logs:

```bash
docker compose logs -f
```

Open in browser: `http://<RASPBERRYPI-IP>:8090`

## 🔗 Direct stream URLs

Raw uStreamer feeds:

* **Camera 1:** `http://<RASPBERRYPI-IP>:8081/stream`
* **Camera 2:** `http://<RASPBERRYPI-IP>:8082/stream`

---

## 💡 Tips & Troubleshooting

### Format Issues
If uStreamer fails with `Unknown pixel format: MJPEG`, ensure you use `--format=JPEG`. uStreamer expects the literal string `JPEG` for MJPEG devices.

### Performance
For Pi 4, `1280x720` @ `15 FPS` is a sweet spot. If it's choppy, try `960x540` or `10 FPS`.

### Persistent Device Names
USB device numbering (`/dev/video0`, `/dev/video4`) can change on reboot. For a rock-solid setup, use `/dev/v4l/by-id/...` paths or udev rules.

### Camera exposure quirks
Some webcams flicker under indoor light. Try increasing FPS or disabling auto-exposure via `v4l2-ctl`.

## 🏗 Extending to a third camera

1. Add `CAM3_*` variables to `.env`.
2. Add a `cam3` service to `compose.yaml`.
3. Update `web/nginx.conf` and `web/index.html`.

## 📜 Credits

Built with:
* [uStreamer](https://github.com/pikvm/ustreamer) (by PiKVM)
* [Docker Compose](https://www.docker.com/)
* [Nginx](https://nginx.org/)

---

## ⚖️ License

MIT

