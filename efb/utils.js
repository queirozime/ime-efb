export const buildGeoJsonFromCoordinates = (coordinates) => {
  return {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": coordinates
        },
        "properties": {
          "stroke": "rgba(6, 245, 66, 1)",
          "stroke-width": 5,
        }
      }
    ]
  }
}

const lineToGeoJson = (lines, enclosed) => {
  coords = lines.coords;
  const newLine = {
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": []
    },
    "properties": {
      "stroke": lines.strokeColor,
      "stroke-width": lines.strokeWidth,
      "fill": lines.fillColor,
      "id": lines.id,
    },
  };

  coords.forEach(line => {
    let arrayLine = [line.longitude.toFixed(4), line.latitude.toFixed(4), "0"]
    newLine.geometry.coordinates.push(arrayLine)
  });

  if (enclosed) {
    newLine.geometry.type = "Polygon"
    newLine.geometry.coordinates = [newLine.geometry.coordinates]
  }

  return newLine
}

const circleToGeoJson = (circle) => {
  const circleToPolygon = require('circle-to-polygon');
  let polygonCoords = circleToPolygon([circle.center.longitude, circle.center.latitude], circle.radius, { numberOfEdges: 64 });
  const newCircle = {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": polygonCoords.coordinates
    },
    "properties": {
      "subtype": "circle",     // not used, only if we want to override in the future
      "radius": circle.radius, // not used
      "stroke": circle.strokeColor,
      "stroke-width": circle.strokeWidth,
      "fill": circle.fillColor,
      "id": circle.id,
    },
  };
  return newCircle
}

export const updateGeoJsonFromDrawing = (geoJson, type, object) => {
  let newFeature = {};
  if (type == "polyline") {
    newFeature = lineToGeoJson(object, false);
  } else if (type == "circle") {
    newFeature = circleToGeoJson(object);
  } else if (type == "polygon") {
    newFeature = lineToGeoJson(object, true);
  } else {
    console.log("Unsuported type");
    return geoJson;
  }
  geoJson.features.push(newFeature);
  return geoJson;
}


export const exportKML = async (geoJson) => {
  const jsonData = JSON.stringify(geoJson)
  let kmlData = await translate.GeoJSON2KML(jsonData);
  let fileUri = await downloadKML(kmlData, fileName + ".kml")
  await shareFile(fileUri)
}

export function getDistanceHaversine(coord1, coord2) {
  const R = 6371e3;
  const lat1 = coord1.latitude * Math.PI / 180;
  const lat2 = coord2.latitude * Math.PI / 180;
  const delta_lat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const delta_long = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(delta_lat / 2) * Math.sin(delta_lat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(delta_long / 2) * Math.sin(delta_long / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c;
  return d;
}

export const removePolygonsAndLineStrings = (geoJson, setGeoJson) => {
  const filteredGeoJson = {
    ...geoJson,
    features: geoJson.features.filter((feature) =>
      feature.geometry.type !== "Polygon" && feature.geometry.type !== "LineString"
    )
  }
  setGeoJson(filteredGeoJson)
}

export const removeFromGeoJsonById = (geoJson, setGeoJson, id) => {
  const filteredGeoJson = {
    ...geoJson,
    features: geoJson.features.filter((feature) =>
      feature.properties.id !== id
    )
  }
  setGeoJson(filteredGeoJson)
}