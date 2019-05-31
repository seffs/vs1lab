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
var geoTagSpace = [];

var searchRad = function(lati, longi, radius) {
  geoTagSpace.forEach(function(gtag) {
    if (gtag.latitude <= (lati + radius) && gtag.latitude >= (lati - radius)) {
      return gtag;
    }
    if (gtag.longitude <= (longi + radius) && gtag.longitude >= (longi - radius)) {
      return gtag;
    }
  });
};

var searchTerm = function(term) {
  var ret = [];
  geoTagSpace.forEach(function(gtag) {
    if (gtag.name.indexOf(term) !== (-1)) {
      ret.push(gtag);
    } else if (gtag.hashtag.indexOf(term) !== (-1)) {
      ret.push(gtag);
    }
  });
  return ret;
};

var addGeoTag = function(gtag) {
  geoTagSpace.push(gtag);
};

var delGeoTag = function(gtag) {
  var i = geoTagSpace.indexOf(gtag);
  geoTagSpace = geoTagSpace.splice(i, 1);
};

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
  console.log(req.body.latitude);
  console.log(req.body.longitude);
  res.render('gta', {
    taglist: [],
    myLatitude: req.body.latitude,
    myLongitude: req.body.longitude,
    mapTags: JSON.stringify(geoTagSpace)
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
  console.log(req.body.latitude);
  console.log(req.body.longitude);
  var newGtag = new gtag(req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag);
  addGeoTag(newGtag);
  res.render('gta', {
    taglist: geoTagSpace,
    myLatitude: req.body.latitude,
    myLongitude: req.body.longitude,
    mapTags: JSON.stringify(geoTagSpace)
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
  console.log(req.body.latitude);
  console.log(req.body.longitude);
  var showGtags = geoTagSpace;
  if (req.body.searchterm !== "") {
    showGtags = searchTerm(req.body.searchterm);
  }
  res.render('gta', {
    taglist: showGtags,
    myLatitude: req.body.latitude,
    myLongitude: req.body.longitude,
    mapTags: JSON.stringify(showGtags)
  });
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
