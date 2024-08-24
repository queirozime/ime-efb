import { DOMParser } from "xmldom"; // for parsing your KLM string, converting it to an XML doc
import { kml } from "@tmcw/togeojson"; // for converting KLM docs to JSON
import tokml from "tokml";
import { object } from "prop-types";


const parser = new DOMParser();
export async function KML2GeoJSON(routeKml){
    const dataKml = parser.parseFromString(routeKml);
    const routeJson =  kml(dataKml);
    let stringGeoJSON = JSON.stringify(routeJson);
    let objectGeoJSON = JSON.parse(stringGeoJSON);
    return objectGeoJSON;
}

// Para Usar o KML2GeoJSON
// onPress={async ()=>{
//     // local.downloadFolder("http://techslides.com/demos/sample-videos","testeFolder")
//     try{
//       let fileKML = await local.GetLocalFile();
//       let fileGeoJSON = await translate.KML2GeoJSON(fileKML);
//       console.log("Before set:",fileGeoJSON)
//       setGeoJson(fileGeoJSON)
//     }
//     catch(erro){
//       console.log("err: "+erro)
//     }
//   }}


function stringifyComplexProperties(feature) {
    for (let prop in feature.properties) {
        if (typeof feature.properties[prop] === 'object') {
            feature.properties[prop] = JSON.stringify(feature.properties[prop]);
        }
    }
}

export async function GeoJSON2KML(routeJson){
    const geojsonData = JSON.parse(routeJson);
    geojsonData.features.forEach(stringifyComplexProperties);
    let routeKml = tokml(geojsonData);
    routeKml = routeKml.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    
    return routeKml;
}
// Para Usar o geoJSON2KML ( lembrar de colocar try catch)
// onPress={async ()=>{
//     const jsonData = JSON.stringify(geoJson)
//     kmlData = translate.GeoJSON2KML(jsonData);
//     fileUri = await local.downloadKML(kmlData,text+".kml") // lembrar de colocar o titulo no lugar do text
//     await local.shareFile(fileUri)
//   }}