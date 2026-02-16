const openfreemap = new ol.layer.Group();

const container = document.getElementById("popup");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");

const overlay = new ol.Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

const bbox = ol.proj.transformExtent(
  [-130, 20, -61.5, 53],
  "EPSG:4326",
  "EPSG:3857",
);

const view = new ol.View({
  center: ol.proj.fromLonLat([-98.5, 39.8]),
  zoom: 4,
  extent: bbox,
});

const map = new ol.Map({
  layers: [openfreemap],
  view: view,
  overlays: [overlay],
  target: "map",
});
olms.apply(openfreemap, "https://tiles.openfreemap.org/styles/bright");

map.on("singleclick", function (evt) {
  const coordinate = evt.coordinate;
  const hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));

  content.innerHTML = "<p>You clicked here:</p><code>" + hdms + "</code>";
  overlay.setPosition(coordinate);
});
