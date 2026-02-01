const key = "PwpQtZrwJrMrtOV5L2aX";
const styleJson = `https://api.maptiler.com/maps/topo-v4/style.json?key=${key}`;

const attribution = new ol.control.Attribution({
  collapsible: false,
});

const map = new ol.Map({
  target: "map",
  controls: ol.control.defaults
    .defaults({ attribution: false })
    .extend([attribution]),
  view: new ol.View({
    constrainResolution: true,
    center: ol.proj.fromLonLat([0, 0]),
    zoom: 1,
  }),
});
olms.apply(map, styleJson);
