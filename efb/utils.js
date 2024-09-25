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