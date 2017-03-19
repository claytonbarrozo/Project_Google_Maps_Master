
var map;

var markers = [];

var marker;

var placeMarkers = [];

var locations = [
	   {title: 'Banana Grill', 
        location: {lat: 53.3452104, lng:-6.2629325},
        content: 'https://www.facebook.com/bananagrillbar/'
      },
        {title: 'Rio Rodizio', 
        location: {lat: 53.3255424, lng:-6.25517},
        content: 'https://www.facebook.com/riorodizioranelagh/'
      },
        {title: 'Bistro Brazil', 
        location: {lat: 53.3535441, lng:-6.2592164},
        content: 'https://www.facebook.com/bistrobrazilrestaurant/'
      },
        {title: 'Taste of Brazil Restaurant',
        location: {lat: 53.3445609, lng:-6.2672964},
        content: 'https://www.facebook.com/TasteOfBrazil/?hc_ref=SEARCH&fref=nf'
      }
];


function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 53.350140, lng: -6.251495},
		zoom: 13,
		mapTypeControl: false
});


var	largeInfowindow = new google.maps.InfoWindow();
maxwidth: 100;

var defaultIcon = makeMarkerIcon('0091ff');

var highlightedIcon = makeMarkerIcon('ffff24');
	
var bounds = new google.maps.LatLngBounds();


for (var i = 0; i < locations.length; i++) {
	var position = locations[i].location;
    var content = locations[i].content;
	var title = locations[i].title;
	var marker = new google.maps.Marker({
		map: map,
		position: position,
		title: title,
		content: content,
		icon: defaultIcon,
		animation: google.maps.Animation.DROP,
		id: i
	});

markers.push(marker);

bounds.extend(marker.position);

marker.addListener('click', function() {
	populateInfoWindow(this, largeInfowindow);
});

marker.addListener('mouseover', function() {
	this.setIcon(highlightedIcon);
});
marker.addListener('mouseout', function() {
	this.setIcon(defaultIcon);
});
}

map.fitBounds(bounds);

document.getElementById('show-listings').addEventListener('click', showListings);
document.getElementById('hide-listings').addEventListener('click', function() {
	hideMarkers(markers);
});

var restaurantVM = new RestaurantViewModel();
ko.applyBindings(restaurantVM);
}


function populateInfoWindow(marker, infowindow) {
	if (infowindow.marker != marker) {
		infowindow.setContent('');
		infowindow.marker = marker;
		setTimeout(function() {
                marker.setAnimation(null);
            	}, 2600);

		//infowindow.setContent('<div>' + marker.title + '</div>');
		//infowindow.open(map, marker);

	infowindow.addListener('closeclick', function() {
		infowindow.marker = null;
	});

	var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options

 	function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
        	clearTimeout(errorTimeout);
            var nearStreetViewLocation = data.location.latLng;
            var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
                infowindow.setContent('<h2>' + marker.title + '</h2>' + '<div id="pano">' + '</div>'
                + '<a href="' + marker.content + '">' + marker.content + '</a>');
            var errorTimeout = setTimeout(function() { alert("Something went wrong"); }, 9000); 
            clearTimeout(errorTimeout);
            var panoramaOptions = {
                position: nearStreetViewLocation,
                pov: {
                   heading: heading,
                   pitch: 20
                }
            };

            var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
            }
    }
    
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}


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
function hideMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

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

var RestaurantViewModel = function() {
	var self = this;
	this.restaurantList = ko.observableArray([]);

	locations.forEach(function(restaurantItem) {
		self.restaurantList.push(restaurantItem);
	});

	this.currentRestaurant = ko.observable( this.restaurantList()[0] );

	for (var i = 0; i < locations.length; i++) {
		this.restaurantList()[i].marker = markers[i];
	}


	this.selectedRestaurant = function(clickedRestaurant) {
		for (var i = 0; i < locations.length; i++) {
			var title = self.restaurantList()[i].title;
			if (clickedRestaurant.title == title) {
				this.currentRestaurant = self.restaurantList()[i];
			}
		}
		this.marker.setAnimation(google.maps.Animation.BOUNCE);
		google.maps.event.trigger(this.marker, 'click');
		
	};

	self.searchItem = ko.observable('');
    self.searchFilter = function(value) {
        self.restaurantList.removeAll();
        for (var i in locations) {
            if (locations[i].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                self.restaurantList.push(locations[i]);
            }
        }
    };
    
    self.markerFilter = function(value) {
        for (var i in locations) {
            if (locations[i].marker.setMap(map) !== null) {
                locations[i].marker.setMap(null);
            }
            if (locations[i].marker.title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                locations[i].marker.setMap(map);
            }
        }  
    };

    //Couple our search items with our search/marker filter functions
    self.searchItem.subscribe(self.searchFilter);
    self.searchItem.subscribe(self.markerFilter);
};

function errorHandling() {
	alert("Loading Google Maps Failed!!");
}
