const bounds = [
  [-130, 20],
  [-61.5, 53],
];

const map = new maplibregl.Map({
  // style: 'https://tiles.openfreemap.org/styles/liberty',
  style: "../json/basic.json",
  center: [-98.5, 39.8],
  zoom: 4,
  maxBounds: bounds,
  container: "map",
});

map.getCanvas().style.cursor = "crosshair";

const popup = new maplibregl.Popup({ closeOnClick: true }).setHTML(
  '<h3 class="popup-title">Third Rock Analytics</h3><p class="popup-content">TRA is headquartered in Tacoma, WA. We take projects from all over the country.</p>',
);

const marker = new maplibregl.Marker({ color: "#FF5733" })
  .setLngLat([-122.4659, 47.2587])
  .setPopup(popup)
  .addTo(map);
