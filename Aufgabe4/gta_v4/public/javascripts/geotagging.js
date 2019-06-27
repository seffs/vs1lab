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

    eventListener: function() {

      var ajax = new XMLHttpRequest();

      function taggingFormular() {
        ajax.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 201) {
            console.log(ajax.responseText);
            var newgtag = JSON.parse(ajax.responseText);
            updateList(newgtag);
          }
        }

      var gtag = {
        name: document.getElementById("tagname").value,
        latitude: document.getElementById("taglati").value,
        longitude: document.getElementById("taglongi").value,
        hashtag: document.getElementById("taghash").value
      };

      ajax.open("POST","/geotags",true);
      ajax.setRequestHeader('Content-Type',"application/json");
      var tagform = JSON.stringify(gtag);
      console.log(tagform);
      ajax.send(tagform);
      }

      function filterFormular() {
        ajax.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            var gtags = JSON.parse(ajax.responseText);
            filterList(gtags);
          }
        }
      var url = "/geotags?searchterm=" + document.getElementById("discterm").value + "&latitude=" + document.getElementById("discoverylati").value + "&longitude=" + document.getElementById("discoverylongi").value;
      ajax.open("GET",url,true);
      ajax.setRequestHeader('Content-Type',"application/json");
      ajax.send();
      }


      function updateList(gtag) {
        var original = document.getElementById("results").innerHTML;
        document.getElementById("results").innerHTML = original + "<li> " + gtag.taglist.name + " (" + gtag.taglist.latitude + ", " + gtag.taglist.longitude + ") " + gtag.taglist.hashtag + "</li>";
        document.getElementById("discoverylati").value = gtag.taglist.latitude;
        document.getElementById("discoverylongi").value = gtag.taglist.longitude;
        document.getElementById("result-img").dataset.tags = JSON.stringify(gtag.mapTags);
        document.getElementById("result-img").src = getLocationMapSrc(gtag.taglist.latitude, gtag.taglist.longitude, gtag.mapTags, 15);
      }

      function filterList(gtags) {
        document.getElementById("results").innerHTML="";
        for (var key in gtags) {
          var li = document.createElement("li");
          li.innerHTML = gtags[key].name + " (" + gtags[key].latitude + ", " + gtags[key].longitude + ") " + gtags[key].hashtag + "</li>";
          document.getElementById("results").appendChild(li);
        };
        var lati = gtags[0].latitude;
        var longi = gtags[0].longitude;
        document.getElementById("result-img").dataset.tags = JSON.stringify(gtags);
        document.getElementById("result-img").src = getLocationMapSrc(lati, longi, gtags, 15);
      }


      function eventHandler1(event) {
        taggingFormular();
      }
      function eventHandler2(Event) {
        filterFormular();
      }

      document.getElementById("tagsubmit").addEventListener("click", eventHandler1, true);
      document.getElementById("discoveryapply").addEventListener("click",eventHandler2,true);
      document.getElementById("discoveryremove").addEventListener("click",function (event) {
        document.getElementById("discterm").value = "";
        eventHandler2(event);
      },true);
    },

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
    }


  }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);

/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(function() {
  gtaLocator.eventListener();
  gtaLocator.updateLocation();
});
