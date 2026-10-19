let map, pickupMarker, dropMarker, routeLine, driverMarker;
document.addEventListener("DOMContentLoaded", ()=> {
  const mapDiv = document.getElementById("map");
  if(!mapDiv) return;
  map = L.map("map").setView([27.7172,85.3240], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  map.on("click", e=>{
    if(!pickupMarker){ pickupMarker = L.marker(e.latlng, {draggable:true}).addTo(map).bindPopup("Pickup").openPopup(); }
    else if(!dropMarker){ dropMarker = L.marker(e.latlng, {draggable:true}).addTo(map).bindPopup("Dropoff").openPopup(); drawRoute(); }
  })
});

function setPinsFromInputs(){
  const p = [27.7172,85.3240];
  const d = [27.72,85.33];
  pickupMarker = L.marker(p).addTo(map).bindPopup("Pickup").openPopup();
  dropMarker = L.marker(d).addTo(map).bindPopup("Dropoff").openPopup();
  drawRoute();
}

function drawRoute(){
  if(!pickupMarker || !dropMarker) return;
  const a = pickupMarker.getLatLng(), b = dropMarker.getLatLng();
  const latlngs = [a, b];
  if(routeLine) map.removeLayer(routeLine);
  routeLine = L.polyline(latlngs, {color:"#34d399", weight:4}).addTo(map);
  map.fitBounds(routeLine.getBounds(), {padding:[40,40]});
  const dist_km = haversine(a.lat,a.lng,b.lat,b.lng).toFixed(2);
  const eta_min = Math.max(3, Math.round(dist_km / 0.6 * 6));
  const info = document.getElementById("route-info");
  if(info) info.innerText = `Distance: ${dist_km} km • ETA: ${eta_min} min • Fare: NPR ${calcFare(dist_km)}`;
}

function simulateDriverAlong(latlngs){
  if(driverMarker) map.removeLayer(driverMarker);
  const start = latlngs[latlngs.length-1];
  driverMarker = L.marker(start, {icon: L.divIcon({className:"driver-icon", html:"🚕", iconSize:[32,32]})}).addTo(map);
  let i = latlngs.length-1;
  const interval = setInterval(()=>{
    if(i<=0){ clearInterval(interval); return; }
    driverMarker.setLatLng(latlngs[i-1]); i--;
  }, 800);
}
