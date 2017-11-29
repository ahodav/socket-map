const myModule = {
    init: function() {
        const self = this;
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const username = prompt("hot");
            if (username && lat && lng) {
                const socket = io({
                    transportOptions: {
                        polling: {
                            extraHeaders: {
                                'username': username,
                                'lat': lat,
                                'lng': lng
                            }
                        }
                    }
                });

                socket.on('all users', function(data) {
                    self.allMarkers = data;
                    for (marker in self.allMarkers) {
                        self.addMarker(self.allMarkers[marker]);
                    };
                });

                socket.on('new user', function(data) {
                    self.allMarkers[data.id] = data;
                    self.addMarker(data);
                });

                socket.on('delete user', function(data) {
                    delete self.allMarkers[data.id];
                    self.removeMarker(data);
                });

                self.mymap = L.map('mapid').setView([lat, lng], 13);
                L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(self.mymap)
                
            }
        })
    },
    removeMarker: function(marker) {
        this.mymap.removeLayer(marker.marker)
    },
    addMarker: function(marker) {
        marker.marker = L.marker([marker.lat, marker.lng])
        marker.marker.addTo(this.mymap)    
            .bindPopup(marker.name)
            .openPopup();
    }
};
window.onload = myModule.init();