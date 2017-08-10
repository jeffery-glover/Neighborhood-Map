//Preset locations (will be found as markers on map as well in list on left)

var locations = [
          {title: '1900 E Ocean Blvd', location: {lat: 33.764279, lng: -118.169579}, showLocation: true},
          {title: 'Long Beach Museum of Art', location: {lat: 33.763472, lng: -118.164797}, showLocation: true},
          {title: 'Belmont Brewing Company', location: {lat: 33.759304, lng: -118.148184}, showLocation: true},
          {title: 'Joe Josts', location: {lat: 33.783141, lng: -118.158685}, showLocation: true},
          {title: 'Park Pantry', location: {lat: 33.766724, lng: -118.165607}, showLocation: true},
          {title: 'Hot Java', location: {lat: 33.766973, lng: -118.165693}, showLocation: true},
          {title: 'Fat Tomatoe Pizza', location: {lat: 33.766617, lng: -118.165114}, showLocation: true},
          {title: 'Hilltop Park', location: {lat: 33.799373, lng: -118.165617}, showLocation: true},
        ];

var map;

var markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 33.764551, lng: -118.169564},
        zoom: 15,
        mapTypeControl: 'false'
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

          // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

          // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
                } else {
                bounds.extend(place.geometry.location);
            }
        });

        map.fitBounds(bounds);

    });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    //the following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        //Get the position from the location array.
        var loc = locations[i]; //test
        var position = locations[i].location;
        var title = locations[i].title;
        //create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Extend the boundaries of the map for each marker
        bounds.extend(marker.position);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });
    }

    map.fitBounds(bounds);

function showMarkers() {
    if (!map) return;

    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

function hideMarkers(markers, selectedLocation) {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].title != selectedLocation) {
            markers[i].setMap(null);
        }
    }
}



    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    //on that markers position.
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.setMarker(null);
            });
        }
    }
};

var ViewModel = function (locations) {
    //list of locations
    this.locList = ko.observableArray();
    for (var i = 0; i < locations.length; i++) {
        this.locList.push(locations[i]);
    }

    this.menu = ko.observable(false);

    //current filter text
    this.currentLocation = ko.observable("");

    this.toggleMenu = function() {
        this.menu(!this.menu());
    }; //toggleMenu

    //list item click function
    this.locationClick = function (marker) {
        var largeInfowindow = new google.maps.InfoWindow();
        //(markers[0].title);
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title === marker.title) {
                markers[i].setAnimation(google.maps.Animation.BOUNCE);
                marker.AnimateTimeout(markers[i]);
                getVenue(marker, largeInfowindow, markers[i]);
            }
        }
    }; //.locationClick

    //filter markers based on input text on button click
    this.filterMarker = function () {
        if (this.currentLocation() === '') {
        } else {
            for (var i = 0; i < locations.length; i++) {
                var match = locations[i].title.toLowerCase().indexOf(this.currentLocation().toLowerCase()) > -1;
                this.locList()[i].showLocation = match;
                //markers[i].setVisible(match);
            } //.for
        } //.else
    }; // .filter

    //filter by text input
    this.filter = ko.computed(() => {
        if (!this.currentLocation()) {
            // No input found, loop through markers setting them visible, return all location
            for (var i = 0; i < markers.length; i++) {
                markers[i].setVisible(true);
            } //.for
            return this.locList();
        } else {
            // input found, match keyword to filter
            return ko.utils.arrayFilter(this.locList(), (location) => {
                this.filterMarker();
                return location.title.toLowerCase().indexOf(this.currentLocation().toLowerCase()) !== -1;
            });
        } //.conditional
    }); // .filter
}; //.viewmodel

//locations model
var Location = function (data) {
    this.location = data.location;
    this.title = data.title;
    this.showLocation = ko.observable(data.showLocation);
};

ko.applyBindings(new ViewModel(locations));
