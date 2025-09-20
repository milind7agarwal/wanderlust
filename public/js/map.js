

    // 1. Create the map and set the starting point & zoom
    const map = L.map("map").setView([28.6139, 77.2090], 13); // Delhi coords

    // 2. Add the OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 3. Add a sample marker with a popup
    L.marker([28.6139, 77.2090])
      .addTo(map)
      .bindPopup("Your destination")
      .openPopup();


// document.addEventListener("DOMContentLoaded", () => {
//   const mapDiv = document.getElementById("map");
//   const lat = parseFloat(mapDiv.dataset.lat);
//   const lng = parseFloat(mapDiv.dataset.lng);
//   const title = mapDiv.dataset.title;

//   const map = L.map("map").setView([lat, lng], 13);
//   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//   }).addTo(map);

//   L.marker([lat, lng]).addTo(map).bindPopup(title).openPopup();
// });

