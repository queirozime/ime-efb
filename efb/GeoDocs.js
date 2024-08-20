import { DOMParser } from "xmldom"; // for parsing your KLM string, converting it to an XML doc
import { kml } from "@tmcw/togeojson"; // for converting KLM docs to JSON
import tokml from "tokml";

const parser = new DOMParser();

export async function KML2GeoJSON(routeKml){
    const dataKml = parser.parseFromString(routeKml);
    const routeJson = kml(dataKml);
    let stringGeoJSON = JSON.stringify(routeJson);
    let objectGeoJSON = JSON.parse(stringGeoJSON);

    console.log(stringGeoJSON)
    return stringGeoJSON;
}

export async function GeoJSON2KML(routeJson){

    const routeKml = tokml(routeJson);
    console.log(routeKml)
    
    return routeKml;
}