import { StyleSheet, Text, View, Button, Platform, TouchableOpacity, TextInput } from 'react-native';
// use effect
import React, { useEffect, useState } from 'react';
import * as Location from "expo-location";
// // react native maps
import MapView, { UrlTile, Geojson} from 'react-native-maps';
import { LocalTile, Marker, Polyline, Polygon } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome'

import * as local from './LocalFiles';

// // latitude and longitude
const latitude = 37.78825;
const longitude = -122.4324;

// const getDeviceCurrentLocation = async () => {
  //   return new Promise((resolve, reject) =>
  //     GeoLocation.getCurrentPosition(
    //       (position) => {
      //         resolve(position);
      //       },
      //       (error) => {
        //         reject(error);
        //       },
        //       {
          //         enableHighAccuracy: true, // Whether to use high accuracy mode or not
          //         timeout: 15000, // Request timeout
          //         maximumAge: 10000 // How long previous location will be cached
          //       }
          //     )
          //   );
          // };
          
         const myPlace =  { "type": "FeatureCollection",
            "features" : [
              { "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [-22.9, -43.2]},
                "properties": {"prop0": "value0"}
                },
              { "type": "Feature",
                "geometry": {
                  "type": "LineString",
                  "coordinates": [
                    [-22.9, -43.2], [-21.9, -42.2], [-21.9, -43.2], [-22.9, -42.2]
                    ]
                  },
                "properties": {
                  "prop0": "value0",
                  "prop1": 0.0
                  }
                },
              { "type": "Feature",
                 "geometry": {
                   "type": "Polygon",
                   "coordinates": [
                     [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
                       [100.0, 1.0], [100.0, 0.0] ]
                     ]
          
                 },
                 "properties": {
                   "prop0": "value0",
                   "prop1": {"this": "that"}
                   }
                 }
              ]
            }
          
export default function App() {

  const [isDrawing, setIsDrawing] = useState(false);
  const [DrawingColor, setDrawingColor] = useState("black");
  
  const [polylines, setPolylines] = useState([]);
  const [polyline, setPolyline] = useState([]);
  const savePolyline = () => {
    if(polyline.length > 1)
      setPolylines([...polylines, polyline]);
    setPolyline([]);
  }
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [location, setLocation] = useState(
    {
        latitude: -22.9, 
        longitude: -43.2, 
        latitudeDelta: 0.0922, 
        longitudeDelta: 0.0421
    }
  );
  const [locationError, setLocationError] = useState(null);
  const [recordLocation, setRecordLocation] = useState(false);
  const [locationFile, setLocationFile] = useState(null);

  const startRecording = () => {
    // also tag current timestamp
    console.log( new Date().toISOString() );
    timestamp = new Date().toISOString();
    setLocationFile(timestamp);
  }

  const [pathTile, setPathTile] = useState(null)
  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Location permission denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };

  const logLocation = async () => {
    getLocation();
    console.log("Record location:", recordLocation);
    console.log("Location:", location);
    local.saveLocation(location, locationFile);
  }

  useEffect(() => {
    getLocation();
    const locationInterval = setInterval(() => {
      console.log("Record location:", recordLocation);
      if(recordLocation)
        logLocation();
    }, 1000);

    return () => {
      clearInterval(locationInterval);
    }
  }, [recordLocation]);

  const { latitude, longitude } = location?.coords || {};


  const [text, setText] = useState("titulo");

  // const [kmlURI, setkmlURI] = useState(null);


  const [geoJson,setGeoJson] =  useState ({ "type": "FeatureCollection",
    "features" : [
      
      ]
    })

  useEffect(() => {
    getLocation();
  }, []);
  // return map on current location
  return(
    <View style={styles.container}>
      <MapView
        style={{width: "100%", height: "100%"}}
        followsUserLocation={isFollowingUser}
        showsUserLocation={true}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        scrollEnabled={!isDrawing}
        ref = {map => {this.map = map}}
        mapType="normal"
        onTouchMove={(e) => {
          if (isDrawing) {
            const { locationX, locationY } = e.nativeEvent;
            this.map.coordinateForPoint({ x: locationX, y: locationY })
              .then(coords => {
                var latitude = coords.latitude;
                var longitude = coords.longitude;
                setPolyline([...polyline, { latitude, longitude }]);
              })
              .catch(error => {
                console.error("Error getting coordinates:", error);
              });
          }
        }}
        onTouchEnd={(e) => {
          savePolyline();
        }}
        onRegionChange={(region) => {
          setIsFollowingUser(false);
        }}
      >
        <UrlTile urlTemplate={'http://172.15.6.112:5000/{z}/{x}/{y}.png'} shouldReplaceMapContent={false}/>
        {polylines.map((polyline, index) => (
          <Polyline key={index} coordinates={polyline} strokeColor="red" strokeWidth={2} />
        ))}
        {polyline.length > 1 && <Polyline coordinates={polyline} strokeColor="red" strokeWidth={2} />}
        <Marker
          coordinate={{latitude: latitude, longitude: longitude}}
          title={'My Marker'}
          description={'This is my marker'}
        />
        <Geojson
        geojson={geoJson}
        strokeColor="red"
        fillColor="green"
        strokeWidth={2}
      />
      </MapView>
      <TouchableOpacity
        onPress={() => {
          setIsDrawing(!isDrawing);
        }}
        onLongPress={() => {
          console.log("Long press detected");
          setIsDrawing(true);
        }}
        style={[
          styles.circleButton,
          styles.pencilButton,
          { backgroundColor: isDrawing ? "rgba(74, 74, 74, 0.5)" : "rgba(255, 255, 255, 0.3)" }
        ]}
      >
        <Icon name="pencil" size={30} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setIsFollowingUser(true);
        }}
        style={[
          styles.circleButton,
          { bottom: 20, left: 20 }
        ]}
      >
        <Icon name="location-arrow" size={30} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          console.log("Record location before toggle:", recordLocation);
          if(!recordLocation)
            startRecording();
          setRecordLocation(!recordLocation);
        }}
        style={[
          styles.circleButton,
          { bottom: 20, left: 100 }
        ]}
      >
        <Text style={{color: "#fff"}}>R</Text>
      </TouchableOpacity>
      <Button
        onPress={async ()=>{
          // local.downloadFolder("http://techslides.com/demos/sample-videos","testeFolder")
          try{
            file = await local.GetLocalFile();
            
            setGeoJson(JSON.parse(file))
            console.log("depois")
            console.log(geoJson)

          }
          catch(erro){
            console.log("err: "+erro)
          }
          
          
          // Converter o conteúdo XML para objeto JavaScript
          // const parsedKml = await parseStringPromise(kmlContent);
          // setPathTile("file://"+uri+"/output/{z}/{x}/{y}.png")
          // console.log(pathTile)
          } }
        title="Import KML"
        color="#fff"
        accessibilityLabel="Take Url From"
      />
      <Button
        onPress={async ()=>{
            const jsonData = JSON.stringify(geoJson)
            console.log(jsonData)
            await local.downloadKML(jsonData,text+".kml")
          } }
        title="Export KML"
        color="#fff"
        accessibilityLabel="Take Url From"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButton: {
    position: 'absolute',
    width: 60, 
    height: 60, // same as height 
    borderRadius: 30, // Half of the width/height
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  pencilButton: {
    bottom: 20,
    right: 20,
  }
});