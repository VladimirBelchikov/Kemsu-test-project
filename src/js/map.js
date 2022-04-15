import "../styles/style.scss";
import {Map} from "ol";
import {View} from "ol";
import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style";
import {Draw, Modify, Snap} from "ol/interaction";
import {OSM, Vector as VectorSource} from "ol/source";
import {Tile as TileLayer, Vector as VectorLayer} from "ol/layer";
import {get, fromLonLat} from "ol/proj";

export const olMap = () => {
  let pointInPolygon = require("robust-point-in-polygon");

  const raster = new TileLayer({
    source: new OSM(),
  });

  const source = new VectorSource();

// Create layers
// Redefinition styles for layers and points
  const vector = new VectorLayer({
    source: source,
    style: new Style({
      fill: new Fill({
        color: "rgba(255, 255, 255, 0.5",
      }),
      stroke: new Stroke({
        color: "#000000",
        lineDash: [10, 10],
        width: 2,
      }),
      image: new CircleStyle({
        radius: 10,
        fill: new Fill({
          color: "#000000",
        }),
      }),
    }),
  });

// Block multi-world panning
  const extent = get("EPSG:3857").getExtent().slice();
  extent[0] += extent[0];
  extent[2] += extent[2];

// Create map
  const map = new Map({
    layers: [raster, vector],
    target: "map",
    view: new View({
      center: fromLonLat([86.08, 55.3]),
      zoom: 8,
      extent,
    }),
  });

  const modify = new Modify({source: source});
  map.addInteraction(modify);

// Globals
  let draw,
    snap,
    selected = "",
    count = 0;

// Select type of geometry (point or polygon)
  const selectGeometryType = (value) => {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    addInteractions(value)
  }

// Set point to the map
  document.querySelector(".controls__set-point").addEventListener("click", () => {
    selected !== "None" ? selectGeometryType("None") : selectGeometryType("Point");
  });

// Set polygon to the map
  document.querySelector(".controls__set-polygon").addEventListener("click", () => {
    if (selected !== "None") {
      selectGeometryType("None")
    } else {
      selectGeometryType("Polygon");
      source.forEachFeature((key) => {
        if (key.getGeometry().getType() === "Polygon") {
          source.removeFeature(key);
        }
      });
    }
  })

// Change selected interaction
  const addInteractions = (value) => {
    selected = value;
    if (value !== "None") {
      draw = new Draw({
        source: source,
        type: value
      });
      map.addInteraction(draw);
      snap = new Snap({source: source});
      map.addInteraction(snap);
    }
  }

// Change counter if map has at least one point and one polygon
  const changeCounter = () => {
    let points = [];
    let polygon = [];
    source.forEachFeature((key) => {
      key.getGeometry().getType() === 'Point'
        ?
        points.push(key.getGeometry().getCoordinates())
        :
        polygon = (key.getGeometry().getCoordinates())
    })

    if (points.length !== 0 && polygon.length !== 0) {
      points.forEach((value) => {
        if (pointInPolygon(polygon[0], value) === -1) {
          count++
        }
      })
      document.querySelector(".controls__counter").innerHTML = count;
      count = 0;
    } else {
      document.querySelector(".controls__counter").innerHTML = "0";
    }
  }

// Start interaction is none selected
  addInteractions("None");

// Counter updater
  setInterval(changeCounter, 500);
}
