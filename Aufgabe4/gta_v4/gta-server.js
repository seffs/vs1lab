/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');
//var gtagManage = require("./gtag_manage");

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN
app.use(express.static(__dirname + "/public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

// TODO: CODE ERGÄNZEN
var gtag = function(name, lati, longi, hashtag) {
  this.name = name;
  this.latitude = lati;
  this.longitude = longi;
  this.hashtag = hashtag;
};

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

// TODO: CODE ERGÄNZEN
var geoTagManagement = (function() {

  var geoTagSpace = [];

  return {

    getGeoTags: function() {
      return geoTagSpace;
    },

    searchRad: function(lati, longi, radius, geoTagList) {
      var ret = [];
      geoTagList.forEach(function(gtag) {
        if (parseFloat(gtag.latitude) <= (parseFloat(lati) + radius) && parseFloat(gtag.latitude) >= (parseFloat(lati) - radius)) {
          if (parseFloat(gtag.longitude) <= (parseFloat(longi) + radius) && parseFloat(gtag.longitude) >= (parseFloat(longi) - radius)) {
            ret.push(gtag);
          }
        }
      });
      return ret;
    },

    searchTerm: function(term) {
      var ret = [];
      geoTagSpace.forEach(function(gtag) {
        if (gtag.name.indexOf(term) !== (-1)) {
          ret.push(gtag);
        } else if (gtag.hashtag.indexOf(term) !== (-1)) {
          ret.push(gtag);
        }
      });
      return ret;
    },

    addGeoTag: function(gtag) {
      geoTagSpace.push(gtag);
    },

    delGeoTag: function(gtag) {
      var i = geoTagSpace.indexOf(gtag);
      geoTagSpace = geoTagSpace.splice(i, 1);
    },

    delById: function(id) {

      geoTagSpace = geoTagSpace.filter(function(ele) {
        return ele.name != id;
      });
    },

    getById: function(id) {
      var ret = [];
      geoTagSpace.forEach(function(gtag) {
        if (gtag.name === id) {
          ret.push(gtag);
        }
      });
      return ret;
    }
  };
})();

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
  var tagList = geoTagManagement.getGeoTags();
  res.render('gta', {
    taglist: tagList,
    myLatitude: req.body.latitude,
    myLongitude: req.body.longitude,
    mapTags: JSON.stringify(geoTagManagement.getGeoTags())
  });
});



/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

// TODO: CODE ERGÄNZEN START
app.post('/tagging', function(req, res) {
  var newGtag = new gtag(req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag);
  geoTagManagement.addGeoTag(newGtag);
  var showGtags = geoTagManagement.getGeoTags();
  showGtags = geoTagManagement.searchRad(req.body.latitude, req.body.longitude, 10.0, showGtags);
  res.render('gta', {
    taglist: showGtags,
    myLatitude: req.body.latitude,
    myLongitude: req.body.longitude,
    mapTags: JSON.stringify(showGtags)
  });
});

/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

// TODO: CODE ERGÄNZEN
app.post('/discovery', function(req, res) {
  var showGtags = geoTagManagement.getGeoTags();
  if (req.body.searchterm !== "") {
    showGtags = geoTagManagement.searchTerm(req.body.searchterm);
  }
  showGtags = geoTagManagement.searchRad(req.body.latitude, req.body.longitude, 10.0, showGtags);
  res.render('gta', {
    taglist: showGtags,
    myLatitude: req.body.latitude,
    myLongitude: req.body.longitude,
    mapTags: JSON.stringify(showGtags)
  });
});

// REST API
app.get('/geotags', function(req, res) {
  var lati = req.query.latitude;
  var longi = req.query.longitude;
  var term = req.query.searchterm;

  var showGtags = geoTagManagement.getGeoTags();
  if (term !== "") {
    showGtags = geoTagManagement.searchTerm(term);
  }
  showGtags = geoTagManagement.searchRad(lati, longi, 10.0, showGtags);
  res.json(showGtags);
});

app.post('/geotags', function(req, res) {
  var newGtag = new gtag(req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag);
  geoTagManagement.addGeoTag(newGtag);
  var showGtags = geoTagManagement.getGeoTags();
  showGtags = geoTagManagement.searchRad(req.body.latitude, req.body.longitude, 10.0, showGtags);
  res.location('/geotags/' + req.body.name);
  res.status(201);
  res.json(showGtags);
});

app.get('/geotags/:tagid', function(req, res) {
  var tagId = req.params.tagid;
  var tagAr = geoTagManagement.getById(tagId);
  var tag = tagAr[0];
  if (tag === undefined) {
    res.sendStatus(404);
  } else {
    res.json(tag);
  }

});

app.put('/geotags/:tagid', function(req, res) {
  var tagId = req.params.tagid;
  var tagAr = geoTagManagement.getById(tagId);
  var tag = tagAr[0];
  console.log(tag);
  console.log(req.body);
  console.log(req.body.name);
  tag.name = req.body.name;
  tag.latitude = req.body.latitude;
  tag.longitude = req.body.longitude;
  tag.hashtag = req.body.hashtag;
  console.log(geoTagManagement.getGeoTags());
  res.json(tag);
});

app.delete('/geotags/:tagid', function(req, res) {
  var tagId = req.params.tagid;
  var tagAr = geoTagManagement.getById(tagId);
  var tag = tagAr[0];
  if (tag === undefined) {
    res.sendStatus(404);
  } else {
    geoTagManagement.delById(tagId);
    res.sendStatus(204);
  }
});

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
