/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWFya29zdGVyayIsImEiOiJjbDFkdXg3NTEwbGJ6M2RwNDA1N3NweDZjIn0.eJmGz8UqExuToCDlrbP19w';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/markosterk/cl1dvj7hf006n15ntxp0xq6ba',
    scrollZoom: false,
    //   center: [-118.113491, 34.111745],
    //   zoom: 4,
    //   interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker'; //css class

    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add pop-up with information about the marker (tour)
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    //Extend the map bounds to include the location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
