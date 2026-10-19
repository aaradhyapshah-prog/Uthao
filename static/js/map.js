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

function calcFare(dist_km){ const base=60; return Math.round(base + dist_km*25); }

function haversine(lat1,lon1,lat2,lon2){
  const R=6371; const dLat=(lat2-lat1)*Math.PI/180; const dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function requestRide(){
  if(!routeLine) return alert("Set pickup and dropoff first.");
  simulateDriverAlong(routeLine.getLatLngs());
  alert("Ride booked (demo)");
}

function simulateDriverAlong(latlngs){
  if(driverMarker) map.removeLayer(driverMarker);
  const start = latlngs[latlngs.length-1];
  driverMarker = L.marker(start, {icon: L.divIcon({className:"driver-icon", html:"🚕"})}).addTo(map);
  let i = latlngs.length-1;
  const interval = setInterval(()=>{
    if(i<=0){ clearInterval(interval); return; }
    driverMarker.setLatLng(latlngs[i-1]); i--;
  }, 800);
}
