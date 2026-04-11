# Schweini-Cams for Raspberry Pi

A lightweight multi-camera browser setup for Raspberry Pi using USB webcams, uStreamer, Docker Compose, and a small split-view web UI.

This project is designed for simple live monitoring without recording.
Typical use case: watching a guinea pig cage from two or more angles in the browser.

## Features

* lightweight live streaming with uStreamer
* browser-based camera view
* split-view for two cameras
* click one camera to enlarge it
* second camera remains visible as preview
* easy Docker Compose setup
* camera device, resolution, and FPS configurable via `.env`
* extendable to a third camera

## Use case

This setup is intended for:

* Raspberry Pi 4
* 2 USB webcams
* simple live view only
* no recording
* no motion detection
* no heavy NVR software

It is ideal for low-maintenance local monitoring.

## Project structure

```text
.
├── compose.yaml
├── .env
└── web/
    ├── index.html
    └── nginx.conf
```

## Requirements

* Raspberry Pi 4
* Raspberry Pi OS with Docker and Docker Compose plugin installed
* 2 compatible USB webcams
* `v4l2-ctl` installed for camera inspection

Install `v4l2-ctl` if needed:

```bash
sudo apt update
sudo apt install -y v4l-utils
```

## Find your camera devices

List available video devices:

```bash
v4l2-ctl --list-devices
```

Typical output may look like this:

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

Many webcams expose multiple `/dev/videoX` devices.
Usually only one of them is the actual video stream you want.

To inspect supported formats:

```bash
v4l2-ctl -d /dev/video0 --list-formats-ext
v4l2-ctl -d /dev/video4 --list-formats-ext
```

For this project, the relevant device is typically the one offering JPEG/MJPEG video modes in usable resolutions such as:

* 640x480
* 1280x720
* 1920x1080

## Configuration

All important camera-specific settings are stored in `.env`.

Example:

```dotenv
CAM1_DEVICE=/dev/video0
CAM1_RESOLUTION=1280x720
CAM1_FPS=15

CAM2_DEVICE=/dev/video4
CAM2_RESOLUTION=1280x720
CAM2_FPS=15
```

## Docker Compose

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

## Web frontend

The web frontend is served via nginx and provides:

* split-view for both cameras
* click a camera to enlarge it
* the second camera stays visible as a small preview
* double-click returns to split-view

## Start the stack

From the project folder:

```bash
docker compose up -d
```

Check logs:

```bash
docker compose logs -f
```

Open in browser:

```text
http://RASPBERRYPI-IP:8090
```

## Direct stream URLs

If needed, the raw uStreamer feeds are also available directly:

* Camera 1: `http://RASPBERRYPI-IP:8081/stream`
* Camera 2: `http://RASPBERRYPI-IP:8082/stream`

## Notes about image format

If uStreamer exits with an error like:

```text
Unknown pixel format: MJPEG; available: YUYV, UYVY, RGB565, RGB24, JPEG
```

use:

```text
--format=JPEG
```

not:

```text
--format=MJPEG
```

uStreamer expects the camera pixel format name `JPEG` here.

## Performance recommendations

For Raspberry Pi 4 and simple live monitoring, these settings work well:

* resolution: `1280x720`
* fps: `15`
* format: `JPEG`
* no recording
* no audio

If playback is choppy on some phones or tablets, try reducing load:

* `960x540`
* `640x480`
* `10` or `15` fps

Different phones and browsers handle MJPEG streams differently.

## Camera auto-exposure quirks

Some USB webcams may show brightness pumping or flickering, especially under indoor lighting.

Check current camera settings:

```bash
v4l2-ctl -d /dev/video4 --all
v4l2-ctl -d /dev/video4 -L
```

Common causes include:

* auto exposure
* dynamic framerate exposure
* automatic white balance
* backlight compensation

In one real-world case, increasing FPS from `10` to `20` significantly improved brightness stability.

## Troubleshooting

### A camera does not show video

Check which device is the correct one:

```bash
v4l2-ctl --list-devices
v4l2-ctl -d /dev/video0 --list-formats-ext
v4l2-ctl -d /dev/video4 --list-formats-ext
```

### Container exits immediately

Inspect logs:

```bash
docker compose logs -f cam1
docker compose logs -f cam2
```

### Browser playback is choppy

Try:

* lower resolution
* lower FPS
* test another browser
* disable battery saver on mobile devices
* check Wi-Fi quality

### Device numbering changes after reboot

USB webcam numbering (`/dev/video0`, `/dev/video4`, etc.) may change after reboot or reconnect.

For a more robust setup, consider using persistent device naming via udev rules in the future.

## Extending to a third camera

You can add a third camera by:

1. defining `CAM3_*` variables in `.env`
2. adding a `cam3` service in `compose.yaml`
3. extending nginx routes
4. adding the stream to the frontend

Example `.env` extension:

```dotenv
CAM3_DEVICE=/dev/video6
CAM3_RESOLUTION=1280x720
CAM3_FPS=15
```

## Why this project?

This project intentionally avoids heavy surveillance stacks such as:

* NVR systems
* motion detection
* recording databases
* AI object detection

The goal is to keep everything:

* simple
* fast
* lightweight
* easy to understand
* easy to share with friends and family

## Credits

Built with:

* Raspberry Pi
* Docker Compose
* uStreamer
* nginx

uStreamer:
[https://github.com/pikvm/ustreamer](https://github.com/pikvm/ustreamer)

Docker image used here:
[https://hub.docker.com/r/beholderrpa/ustreamer](https://hub.docker.com/r/beholderrpa/ustreamer)

## License

MIT

