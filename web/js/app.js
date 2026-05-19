const cams = [
  { id: "cam1", name: "Kamera 1", stream: "/cam1/stream" },
  { id: "cam2", name: "Kamera 2", stream: "/cam2/stream" },
  { id: "cam3", name: "Kamera 3", stream: "/cam3/stream" }
];

const view = document.getElementById("view");
const splitBtn = document.getElementById("splitBtn");

let mode = "split";
let activeCam = cams[0].id;

function makeCamTile(cam, extraClass = "") {
  const wrap = document.createElement("div");
  wrap.className = `cam ${extraClass}`.trim();
  wrap.dataset.camId = cam.id;

  const img = document.createElement("img");
  img.src = cam.stream;
  img.alt = cam.name;
  img.loading = "eager";

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = cam.name;

  wrap.appendChild(img);
  wrap.appendChild(label);

  wrap.addEventListener("click", () => {
    if (mode === "split") {
      activeCam = cam.id;
      mode = "single";
      render();
    } else {
      if (cam.id !== activeCam) {
        activeCam = cam.id;
        render();
      }
    }
  });

  return wrap;
}

function renderSplit() {
  view.innerHTML = "";
  // Dynamische Grid-Klasse basierend auf Anzahl der Kameras
  const camCount = cams.length;
  view.className = `grid grid-${Math.min(camCount, 3)}`;

  cams.forEach(cam => {
    view.appendChild(makeCamTile(cam));
  });
}

function renderSingle() {
  view.innerHTML = "";
  view.className = "grid grid-1";

  const active = cams.find(c => c.id === activeCam);
  const others = cams.filter(c => c.id !== activeCam);

  const big = makeCamTile(active);
  big.addEventListener("dblclick", () => {
    mode = "split";
    render();
  });

  view.appendChild(big);

  if (others.length > 0) {
    // Zeige die nächste Kamera als Miniatur an
    const mini = makeCamTile(others[0], "mini");
    view.appendChild(mini);
  }
}

function render() {
  if (mode === "split") {
    renderSplit();
  } else {
    renderSingle();
  }
}

splitBtn.addEventListener("click", () => {
  mode = "split";
  render();
});

// Initiales Rendern
render();
