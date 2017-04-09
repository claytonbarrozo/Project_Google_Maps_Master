var locations = [{
        position: {
            lat: 37.788571,
            lng: -122.441498
        },
        name: "Eliza's",

    },

    {
        position: {
            lat: 37.774206,
            lng: -122.506071
        },
        name: "Hakka Restaurant"

    },

    {
        position: {
            lat: 37.760987,
            lng: -122.438695
        },
        name: "Mama Ji's"
    }, {
        position: {
            lat: 37.775947,
            lng: -122.494515
        },
        name: "Shanghai Dumpling King"
    },

    {
        position: {
            lat: 37.796794,
            lng: -122.405446
        },
        name: "House of Nanking"
    }

]



var map, infowindow;

function toggleBounce(marker) {
      if (marker.getAnimation() !== null) {
         marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  };

  function googleError(){
    if (typeof map == 'undefined'){
      alert("error");
    }
  }

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 37.7749,
            lng: -122.4194
        },
        zoom: 10
    });

       

    for (var i = 0; i < myViewModel.myLocations().length; i++) {
        //console.log(myViewModel.myLocations(i));

        var marker = new google.maps.Marker({

            position: myViewModel.myLocations()[i].position,
            map: map,
            name: myViewModel.myLocations()[i].name,
            animation: null

        });
        myViewModel.myLocations()[i].marker = marker;


      
        

      //marker.addListener('click', toggleBounce);

        marker.addListener('click', function() {
          toggleBounce(this);
          getYelpData(this);
          
          console.log("success");
          var contentString = '<h3>' + placeName + '</h3>';
           // contentString += '<p>Rating:' + results.businesses[0].rating + '</p>';
            infowindow.setContent(contentString);
            infowindow.open(map, marker);

         
        });


    }

    infowindow = new google.maps.InfoWindow({});


    /*   
        

      var marker4 = new google.maps.Marker({
      position: {lat: 37.7449, lng: -122.4154},
      map: map,
      title: 'Hello World!'
      });

      var marker5 = new google.maps.Marker({
      position: {lat: 37.7649, lng: -122.4154},
      map: map,
      title: 'Hello World!'
      });
       
    */

}

function getYelpData(marker) {

    function nonce_generate() {
        return (Math.floor(Math.random() * 1e12).toString());
    };

    var YELP_BASE_URL = "http://api.yelp.com/v2/search";
    var yelp_url = YELP_BASE_URL;
    var YELP_KEY_SECRET = 'VkPLkNT6aJ6pVkLYhlzrYbjbqQQ';
    var YELP_TOKEN_SECRET = 'p17i1pe9qahC-_vaOEegCM81BcM';
    var term = marker.name;
   // marker = location.marker;
    placeName = marker.name;


    var parameters = {
        oauth_consumer_key: "jm06CzZZen_oNkv_p8thnA",
        oauth_token: "g7zqOkvW1IIFBcTHiQGG3QnHWTGakuj-",
        oauth_nonce: nonce_generate(),
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        callback: 'cb',
        term: term,
        location: 'San Francisco',
        limit: 1
    };


    //var yelp_url = YELP_BASE_URL + '/business/' + self.selected_place().Yelp.business_id;
    var settings = {
        url: yelp_url,
        data: parameters,
        cache: true, // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
        dataType: 'jsonp',
        success: function(results) {
            this.results = results;
            console.log('it worked');
            // Do stuff with results
            console.log(results);
            var contentString = '<h3>' + placeName + '</h3>';
            contentString += '<p>Rating:' + results.businesses[0].rating + '</p>';
            contentString += '<img class="bgimg" src="' + results.businesses[0].image_url + '">' + "</img>" ; 
            infowindow.setContent(contentString);
            infowindow.open(map, marker);


        },
        error: function() {
            console.log('it failed');
            // Do stuff on fail
            alert("error");
        }
    };

    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
    parameters.oauth_signature = encodedSignature;
    $.ajax(settings);

}




var Location = function(data) {
    this.name = data.name;
    this.marker = ko.observableArray(locations);
    this.marker2 = data.marker2;

    // name = "Location 1";



}

var viewModel = function() {
    var self = this;
    this.myLocations = ko.observableArray(locations);
    this.myLocation = ko.observable(new Location(locations[0]));
    console.log(this.myLocation());

    this.query = ko.observable("");
    this.filteredArray = ko.computed(function() { 
        var query = self.query().toLowerCase(); 
        if (!query) {
            return self.myLocations()
        } else {
            return ko.utils.arrayFilter(self.myLocations(), function(location) {
                var isMatch = location.name.toLowerCase().indexOf(query) >= 0;
                location.marker.setVisible(isMatch);
                return isMatch;
            })
        }


        // console.log("query: ", query);
         


    });
    //self.obsArray =
    //self.getYelp(query){


    this.listClick = function(location) {
        console.log(location);

        getYelpData(location.marker);
    }
};




/*$.ajax(settings).done(function(data) {
  




     


   

    // Send AJAX query via jQuery library.
    

  var yelpLocations = data.businesses;
  yelpLocations.forEach(function(location) {
    var loc = {};
    loc.name = location.name;
    loc.phone = location.display_phone;
    loc.lat = location.location.coordinate.latitude;
    loc.lng = location.location.coordinate.longitude;
    // etc.  -- add whatever data looks interesting
    // when done, push the location into the location array for the app
    locationsArray.push(appLocation)
  });
});
*/



var myViewModel = new viewModel();
ko.applyBindings(myViewModel);

        

      

    //  @.ajax(url).then(function(data)){
      //  placeconstructor.attr = data.attr

        //data.attr = "phone number of the location"
        //placeconstructor.phone = data.attr;
      //}