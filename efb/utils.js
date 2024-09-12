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
                "properties": {}
            }
        ]
    }
}

const lineToGeoJson = (lines) =>{
    const newLine = {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates":[]
        },
        "properties": {
          "name": "Drawn"
        }
     };
    lines.forEach(line => {
        newLine.geometry.coordinates.push(line)
    });
    return newLine
}

export const updateGeoJsonFromDrawing = (geoJson,lines) => {

    let newFeature = lineToGeoJson(lines);
    geoJson.features.push(newFeature);
    return geoJson;
}