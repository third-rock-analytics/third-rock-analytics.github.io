const bounds = [
  [-130, 20],
  [-61.5, 53],
];

const map = new maplibregl.Map({
  // style: 'https://tiles.openfreemap.org/styles/liberty',
  style: "../json/basic.json",
  center: [-122.4890, 47.2553],
  zoom: 10,
  maxBounds: bounds,
  container: "map",
});

map.getCanvas().style.cursor = "crosshair";

map.addControl(new maplibregl.NavigationControl(), "top-right");

const popup = new maplibregl.Popup({ closeOnClick: true }).setHTML(
  '<h3 class="popup-title">Third Rock Analytics</h3><p class="popup-content">TRA is headquartered in Tacoma, WA. We take projects from all over the country.</p>',
);

const marker = new maplibregl.Marker({ color: "#FF5733" })
  .setLngLat([-122.4890, 47.2553])
  .setPopup(popup)
  .addTo(map);

map.on('load', () => {
  marker.togglePopup();
});