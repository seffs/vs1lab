/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
  getCurrentPosition: function(onsuccess) {
    onsuccess({
      "coords": {
        "latitude": 49.013790,
        "longitude": 8.390071,
        "altitude": null,
        "accuracy": 39,
        "altitudeAccuracy": null,
        "heading": null,
        "speed": null
      },
      "timestamp": 1540282332239
    });
  }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

  // Private Member

  /**
   * Funktion spricht Geolocation API an.
   * Bei Erfolg Callback 'onsuccess' mit Position.
   * Bei Fehler Callback 'onerror' mit Meldung.
   * Callback Funktionen als Parameter übergeben.
   */
  var tryLocate = function(onsuccess, onerror) {
    if (geoLocationApi) {
      geoLocationApi.getCurrentPosition(onsuccess, function(error) {
        var msg;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "User denied the request for Geolocation.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            msg = "The request to get user location timed out.";
            break;
          case error.UNKNOWN_ERROR:
            msg = "An unknown error occurred.";
            break;
        }
        onerror(msg);
      });
    } else {
      onerror("Geolocation is not supported by this browser.");
    }
  };

  // Auslesen Breitengrad aus der Position
  var getLatitude = function(position) {
    return position.coords.latitude;
  };

  // Auslesen Längengrad aus Position
  var getLongitude = function(position) {
    return position.coords.longitude;
  };

  // Hier Google Maps API Key eintragen
  var apiKey = "Rms3UZACEUFBBmmGNYXehCVHf9MbDLtD";

  /**
   * Funktion erzeugt eine URL, die auf die Karte verweist.
   * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
   * sein.
   *
   * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
   * tags : Array mit Geotag Objekten, das auch leer bleiben kann
   * zoom: Zoomfaktor der Karte
   */
  var getLocationMapSrc = function(lat, lon, tags, zoom) {
    zoom = typeof zoom !== 'undefined' ? zoom : 10;

    if (apiKey === "YOUR_API_KEY_HERE") {
      console.log("No API key provided.");
      return "images/mapview.jpg";
    }

    var tagList = "&pois=You," + lat + "," + lon;
    if (tags !== undefined) tags.forEach(function(tag) {
      tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
    });

    var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
      apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

    console.log("Generated Maps Url: " + urlString);
    return urlString;
  };

  return { // Start öffentlicher Teil des Moduls ...

    // Public Member
    readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

    updateLocation: function() {

      function errorMessage(msg) {
        alert(msg);
      }

      function myPosition(position) {
        var latitude = getLatitude(position);
        var longitude = getLongitude(position);
        document.getElementById("taglati").value = latitude;
        document.getElementById("discoverylati").value = latitude;
        document.getElementById("taglongi").value = longitude;
        document.getElementById("discoverylongi").value = longitude;
        updateMap();
      }

      function updateMap() {
        var lati = document.getElementById("taglati").value;
        var longi = document.getElementById("taglongi").value;
        var taglist = JSON.parse(document.getElementById("result-img").dataset.tags);
        document.getElementById("result-img").src = getLocationMapSrc(lati, longi, taglist, 15);
      }

      if (document.getElementById("taglati").value === "") {
        console.log("Update Position...");
        tryLocate(myPosition, errorMessage);
      } else {
        updateMap();
      }
    },

    getMap: function(lat, lon, tags, zoom) {
      return getLocationMapSrc(lat, lon, tags, zoom);
    }


  }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);

var ajaxEvents = (function() {

  var gtag = function(name, lati, longi, hashtag) {
    this.name = name;
    this.latitude = lati;
    this.longitude = longi;
    this.hashtag = hashtag;
  };

  return {

    submitTag: function() {
      var ajax = new XMLHttpRequest();


      ajax.onreadystatechange = function() {
        if (ajax.readyState == 4) {

          var tags = JSON.parse(ajax.responseText);
          document.getElementById("results").innerHTML = "";
          if (tags !== []) {
            tags.forEach(function(gtag) {
              var newElement = document.createElement("li");
              var content = document.createTextNode(gtag.name + " (" + gtag.latitude + ", " + gtag.longitude + ") " + gtag.hashtag);
              newElement.appendChild(content);
              var list = document.getElementById("results");
              list.appendChild(newElement);
            });
          }

          var lati = document.getElementById("taglati").value;
          var longi = document.getElementById("taglongi").value;
          document.getElementById("result-img").src = gtaLocator.getMap(lati, longi, tags, 15);
        }
      };

      var newGtag = new gtag(document.getElementById("tagname").value, document.getElementById("taglati").value, document.getElementById("taglongi").value, document.getElementById("taghash").value);
      var gtagJson = JSON.stringify(newGtag);
      ajax.open("POST", "/geotags", true);
      ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      ajax.send(gtagJson);
    },

    discoverTags: function() {
      var ajax = new XMLHttpRequest();

      ajax.onreadystatechange = function() {
        if (ajax.readyState == 4) {

          var tags = JSON.parse(ajax.responseText);
          document.getElementById("results").innerHTML = "";
          if (tags !== []) {
            tags.forEach(function(gtag) {
              var newElement = document.createElement("li");
              var content = document.createTextNode(gtag.name + " (" + gtag.latitude + ", " + gtag.longitude + ") " + gtag.hashtag);
              newElement.appendChild(content);
              var list = document.getElementById("results");
              list.appendChild(newElement);
            });
          }

          var lati = document.getElementById("taglati").value;
          var longi = document.getElementById("taglongi").value;
          document.getElementById("result-img").src = gtaLocator.getMap(lati, longi, tags, 15);
        }
      };

      var myLat = "?latitude=" + document.getElementById("discoverylati").value;
      var myLong = "&longitude=" + document.getElementById("discoverylongi").value;
      var term = "&searchterm=" + document.getElementById("discterm").value;
      ajax.open("GET", "/geotags" + myLat + myLong + term, true);
      ajax.send();
    }
  }
})();

document.getElementById("tagsubmit").addEventListener("click", function() {
  ajaxEvents.submitTag();
});
document.getElementById("discoveryapply").addEventListener("click", function() {
  ajaxEvents.discoverTags();
});
document.getElementById("discoveryremove").addEventListener("click", function() {
  document.getElementById("discterm").value = "";
  ajaxEvents.discoverTags();
});

/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(function() {
  gtaLocator.updateLocation();
});
