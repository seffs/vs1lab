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
var url = require('url');
//var gtagManage = require("./gtag_manage");

var app;
var router;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(express.json());

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
      }
    );
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

    delById: function(name) {

      geoTagSpace = geoTagSpace.filter(function(ele) {
        return ele.name != name;
      });
    },

    getById: function(name) {
      var ret = [];
      geoTagSpace.forEach(function(gtag) {
        if (gtag.name === name) {
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
  res.render('gta', {
    taglist: [],
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

/**
*AJAX-Aufrufe
*/

var queryString = function(req, res, next) {
  return next(req.query.searchterm ? 'route' : null);
};

app.get('/geotags', queryString, function(req,res) {
  res.json(geoTagManagement.getGeoTags());
});

app.get('/geotags', function(req,res) {
var showGtags = geoTagManagement.getGeoTags();
var query = url.parse(req.url, true).query;
if (query["searchterm"] !== "") {
  showGtags = geoTagManagement.searchTerm(query["searchterm"]);
}
showGtags = geoTagManagement.searchRad(query["latitude"], query["longitude"], 10.0, showGtags);
res.json(showGtags);
});

app.get('/geotags/:id', function(req,res) {
  var tagId = parseFloat(req.params.id);
  var found = geoTagManagement.getGeoTags()[tagId - 1];
  if (found != undefined) {
    res.send(found);
  }
  else {
    res.sendStatus(404);
  }
});

app.put('/geotags/:id', function(req,res) {
  /*Sollte mit JSON Objekt arbeiten, query strings nur für Darstellung*/
  var tagId = parseFloat(req.params.id);
  var found = geoTagManagement.getGeoTags()[tagId - 1];
  var liste =  geoTagManagement.getGeoTags();
  if (found != undefined) {
    var geo = new gtag(req.body.name, req.body.latitude,req.body.longitude,req.body.hashtag);
    liste[tagId - 1] = geo;
    res.json(geo);
  //  res.json(req.body);
  }
  else {
    res.sendStatus(404);
  }
});

app.delete('/geotags/:id', function(req, res) {
  var tagId = parseFloat(req.params.id);
  var found = geoTagManagement.getGeoTags()[tagId - 1];
  if (found != undefined) {
    geoTagManagement.delById(found.name);
    res.send();
  }
  else {
    res.sendStatus(404);
  }
});


app.post('/geotags', function(req,res) {
  var newGtag = new gtag(req.body.name,req.body.latitude, req.body.longitude, req.body.hashtag);
  geoTagManagement.addGeoTag(newGtag);
  var showGtags = geoTagManagement.getGeoTags();
  showGtags = geoTagManagement.searchRad(req.body.latitude, req.body.longitude, 10.0, showGtags);
  var answer = {
    taglist: newGtag,
    mapTags: showGtags
  }
  var url = "/geotags/" + req.body.name;
  res.location(url);
  res.status(201);
  res.json(answer);
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
