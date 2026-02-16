const openfreemap = new ol.layer.Group()

const bbox = ol.proj.transformExtent(
  [-130, 20, -61.5, 53],
  'EPSG:4326',
  'EPSG:3857'
)

const view = new ol.View({
  center: ol.proj.fromLonLat([-98.5, 39.8]),
  zoom: 4,
  extent: bbox
});

const map = new ol.Map({
  layers: [openfreemap],
  view: view,
  target: 'map',
})
olms.apply(openfreemap, 'https://tiles.openfreemap.org/styles/bright');
