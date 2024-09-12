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
        let arrayLine = [line.longitude.toFixed(4),line.latitude.toFixed(4),"0"]
        newLine.geometry.coordinates.push(arrayLine)
    });
    return newLine
}

export const updateGeoJsonFromDrawing = (geoJson,lines) => {

    let newFeature = lineToGeoJson(lines);
    geoJson.features.push(newFeature);
    return geoJson;
}


export const exportKML = async (geoJson) => {
    const jsonData = JSON.stringify(geoJson)
    console.log(geoJson)
    let kmlData = await translate.GeoJSON2KML(jsonData);
    let fileUri = await downloadKML(kmlData, fileName + ".kml") 
    await shareFile(fileUri)
}