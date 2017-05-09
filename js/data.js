//Global 
var map;

var largeInfowindow;

var markers = [];

var marker;

var placeMarkers = [];


//End-Global 

//location section Start
var locations = [{
        title: 'Banana Grill',
        location: {
            lat: 53.3452104,
            lng: -6.2629325
        },
        content: 'https://www.facebook.com/bananagrillbar/',
        foursquareId: '559d82ed498e73f7a8b8169c',


        showListing: ko.observable(true)
    },
    {
        title: 'Rio Rodizio',
        location: {
            lat: 53.3255424,
            lng: -6.25517
        },
        content: 'https://www.facebook.com/riorodizioranelagh/',
        foursquareId: '5443c0c5498e57860e48ade2',

        showListing: ko.observable(true)
    },
    {
        title: 'Bistro Brazil',
        location: {
            lat: 53.3519492,
            lng: -6.2597197
        },
        content: 'https://www.facebook.com/bistrobrazilrestaurant/',
        foursquareId: '550b3d49498e2cba78228606',

        showListing: ko.observable(true)
    },
    {
        title: 'Taste of Brazil',
        location: {
            lat: 53.3445609,
            lng: -6.2672964
        },
        content: 'https://www.facebook.com/TasteOfBrazil/?hc_ref=SEARCH&fref=nf',
        foursquareId: '4dbd535893a08f9274d2907b',

        showListing: ko.observable(true)
    },

    {
        title: 'Buenos Aires Grill',
        location: {
            lat: 53.3410523,
            lng: -6.2689497
        },
        content: 'https://www.facebook.com/Buenos-Aires-Grill-176781262519124/',
        foursquareId: '4b17bbedf964a5209bc723e3',

        showListing: ko.observable(true)
    },
];


//Knockout starts
//Starts RestaurantViewModel
var RestaurantViewModel = function() {
    var self = this; //Assign self to this
    this.restaurantList = ko.observableArray([]);

    locations.forEach(function(restaurantItem) {
        self.restaurantList.push(restaurantItem);
    });

    this.currentRestaurant = ko.observable(this.restaurantList()[0]);

    for (var i = 0; i < locations.length; i++) {
        this.restaurantList()[i].marker = markers[i];
        }
    
 
    RestaurantViewModel.prototype.initMap = function() {
        // style courtesy of snazzy maps "Crisp and Vivid" by "Nathan"
        // https://snazzymaps.com/style/2053/crisp-and-vivid
        var styles = [{
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#e9e5dc"
                }]
            },
            {
                "featureType": "landscape.natural.terrain",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#44a04b"
                }]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#7bb718"
                }]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#ffffff"
                }]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "color": "#a3a2a2"
                }]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#0099dd"
                }]
            }
        ];
        //End style
        //Starts map
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 53.350140,
                lng: -6.251495
            },
            zoom: 13,
            mapTypeControl: false
            //this.infoWindow = google.maps.InfoWindow();
        });
        //this code starts the infowindow the the user clicks on it
        largeInfowindow = new google.maps.InfoWindow();


        //var defaultIcon = makeMarkerIcon('0091ff');

       // var highlightedIcon = makeMarkerIcon('ffff24');

        var bounds = new google.maps.LatLngBounds();

        //A for loop that uses LocationData to generate multiple markers on the map
        for (var i = 0; i < locations.length; i++) {
            var position = locations[i].location;
            var content = locations[i].content;
            var title = locations[i].title;
            var marker = new google.maps.Marker({
                map: this.map,
                position: position,
                title: title,
                content: content,
                icon: 'http://icons.iconarchive.com/icons/martin-berube/people/48/chef-icon.png',
                animation: google.maps.Animation.DROP,
                id: locations[i].foursquareId

            });
           // console.log(foursquareId);
            markers.push(marker);

            this.restaurantList()[i].marker = marker; //Define marker



            bounds.extend(marker.position);

            marker.addListener('click', function() {
                populateInfoWindow(this, largeInfowindow);
            });

           // marker.addListener('mouseover', function() {
              //  this.setIcon(highlightedIcon);
            //});
            //marker.addListener('mouseout', function() {
                //this.setIcon(defaultIcon);
            //});
        }

        this.map.fitBounds(bounds);
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
                    infowindow.setContent('<h2>' + marker.title + '</h2>' + '<div id="pano">' + '</div>' +
                        '<a href="' + marker.content + '">' + marker.content + '</a>');
                    var errorTimeout = setTimeout(function() {
                        alert("Something went wrong");
                    }, 9000);
                    clearTimeout(errorTimeout);
                    var panoramaOptions = {
                        position: nearStreetViewLocation,
                        pov: {
                            heading: heading,
                            pitch: 15 // this changes the degrees of eth camera if I want to look up or down
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




    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://icons.iconarchive.com/icons/martin-berube/people/48/chef-icon.png',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

    // http://knockoutjs.com/documentation/click-binding.html#note-1-passing-a-current-item-as-a-parameter-to-your-handler-function
    this.selectedRestaurant = function(clickedRestaurant) {
        var marker = clickedRestaurant.marker;
       // console.log(clickedRestaurant);
       // console.log(this);
       // console.log(this === clickedRestaurant);
        google.maps.event.trigger(marker, 'click');

    };
    //filter section
    self.searchItem = ko.observable('');

    self.searchFilter = function(value) {
        var value = value.toLowerCase();
        self.restaurantList.removeAll();
        for (var i in locations) {
            var title = locations[i].title.toLowerCase();
            var match = title.indexOf(value) >= 0; // true or false

            if (match) {
                self.restaurantList.push(locations[i]);
            }

            locations[i].marker.setVisible(match); // true or false
        }
    };

    self.searchItem.subscribe(self.searchFilter);
};


function errorHandling() {
    alert("Please try again later!!");
}

self.markers.push(marker);

//Setting up Foursquare for infowindow
var CLIENT_ID = 'ZHNYRYRJWNHQGJHTPVVWLI1A3QDG3EJS42TFTIIDWEGGJOVX';
var CLIENT_SECRET = 'DPMYPDI0XVR5LITCDEEASMVJ0EGQ0HXXEGFNXVJSQSRU5SXV';


//Populate the infowindow with Foursquare

    var url = 'https://api.foursquare.com/v2/venues/' + marker.id + '?ll=53.350140,-6.251495&oauth_token=M2XWK2D1X3QIQ1E2J0BYNK1VKR4JVVCHVE0ERRR2NFZNWZ1H&v=20170331';


    $.ajax({
        type: "GET",
        url: url,
        dataType: 'json',
        data: {
            id: locations[i].foursquareId,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            async: true
        },
        success: function(data) {
            
            var venue = data.response.venue.name;
            var address = data.response.venue.location.address ? data.response.venue.location.address : " ";
            var city = data.response.venue.location.city ? data.response.venue.location.city : " ";
            var state = data.response.venue.location.state ? data.response.venue.location.state : " ";
            var phone = data.response.venue.contact.formattedPhone ? data.response.venue.contact.formattedPhone : " ";
            var url = data.response.venue.url;


            largeInfowindow.setContent('<div>' + '<b>' + venue + '</b>' + '</div>' + '<div>' + address + '</div>' + '<div>' + city + ', ' + state + ' ' + '<div>' + phone + '<div>' + url);
            largeInfowindow.open(map, marker);
            
        }
    }).fail(function(e) {
        largeInfowindow.setContent('<div><h4>Foursquare could not be loaded, try again later...</h4></div>');
        largeInfowindow.open(map, marker);
    });

var restaurantVM = new RestaurantViewModel();
ko.applyBindings(restaurantVM);

//This code selects the item when is clicked
var selctor = '#restaurant-list li';
$(selctor).on('click', function() {
    $(selctor).removeClass('active');
    $(this).addClass('active');
});
