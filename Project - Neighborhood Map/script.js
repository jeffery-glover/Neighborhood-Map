$(document).ready(function() {

    $('#sidebarCollapse').on('click', function() {
        $('#sidebar').toggleClass('active');
    });

});


var locations = [{
        title: 'Los Alamitos Traffic Circle',
        location: {
            lat: 33.789797,
            lng: -118.142204
        },
        type: 'Traffic'
    },
    {
        title: 'California State University, Long Beach',
        location: {
            lat: 33.783629,
            lng: -118.114064
        },
        type: 'University'
    },
    {
        title: 'The Queen Mary',
        location: {
            lat: 33.752209,
            lng: -118.190288
        },
        type: 'Sister to the Titanic'
    },
    {
        title: 'Long Beach Airport',
        location: {
            lat: 33.819519,
            lng: -118.150851
        },
        type: 'Airport'
    },
    {
        title: 'Catalina Express',
        location: {
            lat: 33.763592,
            lng: -118.199536
        },
        type: 'Boat'
    },
    {
        title: 'Hot Java',
        location: {
            lat: 33.766973,
            lng: -118.165693
        },
        type: 'Coffee'
    },
    {
        title: 'Hilltop Park',
        location: {
            lat: 33.799373,
            lng: -118.165617
        },
        type: 'Lookout'
    },
    {
        title: '1900 E Ocean Blvd',
        location: {
          lat: 33.764145,
          lng: -118.169622
        }
    },
    {
        title: 'Aquarium of the Pacific',
        location: {
            lat: 33.763187,
            lng: -118.196951
        },
        type: 'Aquarium'
    }
];
var map;
// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
    // Create a styles array to use with the map.
    var styles = [{
        featureType: 'water',
        stylers: [{
            color: '#01e1ff'
        }]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [{
                color: '#ffffff'
            },
            {
                weight: 6
            }
        ]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#e85113'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
                color: '#efe9e4'
            },
            {
                lightness: -40
            }
        ]
    }, {
        featureType: 'transit.station',
        stylers: [{
                weight: 9
            },
            {
                hue: '#e85113'
            }
        ]
    }, {
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [{
            visibility: 'off'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{
            lightness: 100
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{
            lightness: -100
        }]
    }, {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{
                visibility: 'on'
            },
            {
                color: '#f0e4d3'
            }
        ]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{
                color: '#efe9e4'
            },
            {
                lightness: -25
            }
        ]
    }];
    // Constructor creates a new map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 33.764551,
            lng: -118.169564
        },
        zoom: 13,
        styles: styles,
        mapTypeControl: false
    });

    var largeInfowindow = new google.maps.InfoWindow();
    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');
    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i,
            map: map
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', popluateInfo);

        marker.addListener('click', toggleBounce);

        marker.addListener('mouseover', iconSet);

        marker.addListener('mouseout', iconDefault);

    }

    function iconDefault() {
        this.setIcon(defaultIcon);
    }

    function iconSet() {
        this.setIcon(highlightedIcon);
    }

    function popluateInfo() {
        populateInfoWindow(this, largeInfowindow);
    }

    function toggleBounce() {
        if (this.getAnimation() !== null) {
          this.setAnimation(null);
        } else {
            this.setAnimation(google.maps.Animation.BOUNCE);
            //setTimeout(function(){ marker.setAnimation(null); }, 750);
        }
      }

    //populates infowindow
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            // Clear the infowindow content to give the streetview time to load.
            infowindow.setContent('');
            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
            var streetViewService = new google.maps.StreetViewService();
            var radius = 50;

            $(document).ready(function() {

                var $wikiElem = $('#wikipedia-links');
                //  display wikipedia api to info window
                var wikiElem = [];

                var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + marker.title + '&callback=wikiCallback';

                var wikiRequestTimeout = setTimeout(function() {
                    wikiElem.push(infowindow.setContent(marker.title + '<li>No related Wiki Articles</li>'));
                }, 8000);

                $.ajax({
                    url: wikiUrl,
                    dataType: "jsonp",
                    success: function(response) {
                        var articleList = response[1];

                        for (var i = 0; i < articleList.length; i++) {
                            articleStr = articleList[i];
                            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                            wikiElem.push(infowindow.setContent(marker.title + '<li><a href="' + url + '">' + articleStr + '</a></li>'));
                            clearTimeout(wikiRequestTimeout);
                        }
                    }
                });
            });

            infowindow.open(map, marker);

        }
    }


    // This function will loop through the markers array and display them all.
    function showListings() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }
    // This function will loop through the listings and hide them all.
    function hideListings() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }
    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }
    ko.applyBindings(new ViewModel(locations, location, markers));
}
var ViewModel = function(locations) {
    //list of locations
    this.locList = ko.observableArray();
    for (var i = 0; i < locations.length; i++) {
        this.locList.push(locations[i]);
    }
    this.menu = ko.observable(false);
    //current filter text
    this.currentLocation = ko.observable("");

    //list item click function
    this.locationClick = function(marker) {
        var largeInfowindow = new google.maps.InfoWindow();

        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title === marker.title) {
                google.maps.event.trigger(markers[i], 'click');
            }
        }
        window.setTimeout(function() {
          for (var i = 0; i < markers.length; i++) {
            if (markers[i].title === marker.title) {
              markers[i].setAnimation(null);
            }
          }
        }, 2100);
    }; //.locationClick*/
    //filter markers based on input text on button click
    this.filterMarker = function() {
        if (this.currentLocation() === '') {} else {
            for (var i = 0; i < locations.length; i++) {
                var match = locations[i].title.toLowerCase().indexOf(this.currentLocation().toLowerCase()) > -1;
                this.locList()[i].showLocation = match;
                markers[i].setVisible(match);
            }
        }
    };
    this.filter = ko.computed(() => {
        if (!this.currentLocation()) {
            // No input found, loop through markers setting them visible, return all location
            for (var i = 0; i < markers.length; i++) {
                markers[i].setVisible(true);
            }
            return this.locList();
        } else {
            // input found, match keyword to filter
            return ko.utils.arrayFilter(this.locList(), (location) => {
                this.filterMarker();
                return location.title.toLowerCase().indexOf(this.currentLocation().toLowerCase()) !== -1;
            });
        }
    });
};

function errorHandling() {
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
}

var Location = function(data) {
    this.location = data.location;
    this.title = data.title;
    this.showLocation = ko.observable(data.showLocation);
};