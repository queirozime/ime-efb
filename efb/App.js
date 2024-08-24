import { StyleSheet, Text, View, Button, Platform, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Location from "expo-location";
import Modal from 'react-native-modal';

import MapView, { UrlTile, Geojson} from 'react-native-maps';
import { LocalTile, Marker, Polyline, Polygon } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome'

import * as local from './LocalFiles';
import * as translate from './GeoDocs'

// // latitude and longitude
const latitude = 37.78825;
const longitude = -122.4324;
// polygon coordinates
const polygon = [
  { latitude: 37.8025259, longitude: -122.4351431 },
  { latitude: 37.7896386, longitude: -122.421646 },
  { latitude: 37.7665248, longitude: -122.4161628 },
  { latitude: 37.7734153, longitude: -122.4577787 },
  { latitude: 37.7948605, longitude: -122.4596065 },
];


const myGeoJson = { 
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
      "properties": {"prop0": "value0"}
    },
    { 
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
          ]
        },
      "properties": {
        "prop0": "value0",
        "prop1": 0.0
        }
    },
    { 
      "type": "Feature",
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

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

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
    // console.log("Record location:", recordLocation);
    // console.log("Location:", location);
    local.saveLocation(location, locationFile);
  }

  useEffect(() => {
    getLocation();
    const locationInterval = setInterval(() => {
      // console.log("Record location:", recordLocation);
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
    "features": [{
      type: 'Feature',
      properties: {"name":"teste"},
      geometry: {
        type: 'Point',
        coordinates: [64.165329, 48.844287],
      }}
    ]
    })

  useEffect(() => {
      console.log("Updated geoJson:", geoJson);
  }, [geoJson]);

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
        <UrlTile urlTemplate={'http://172.15.0.66:5000/{z}/{x}/{y}.png'} shouldReplaceMapContent={false}/>
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
        tracksViewChanges = {true}
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
          // console.log("Record location before toggle:", recordLocation);
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
      <TouchableOpacity
        onPress={toggleModal}
        style={[
          styles.circleButton,
          { bottom: 20, left: 180 }
        ]}
      >
        <Icon name='folder' size={30} color="#fff" />
        <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modal}
        >
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.option}  
            onPress={async ()=>{
              // local.downloadFolder("http://techslides.com/demos/sample-videos","testeFolder")
              try{
                let fileKML = await local.GetLocalFile();
                let fileGeoJSON = await translate.KML2GeoJSON(fileKML);
                console.log("Before set:",fileGeoJSON)
                setGeoJson(fileGeoJSON)
              }
              catch(erro){
                console.log("err: "+erro)
              }
            }}
          >
            <Text style={styles.optionText}>Import KML</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.option} 
            onPress={async ()=>{
              try{

              const jsonData = JSON.stringify(myGeoJson)
              let kmlData = await translate.GeoJSON2KML(jsonData);
              fileUri = await local.downloadKML(kmlData,text+".kml")
              await local.shareFile(fileUri)
              }
              catch(erro){
                console.log("err: "+erro)
              }
            }}
          >
            <Text style={styles.optionText}>Export KML</Text>
          </TouchableOpacity>
        </View>
        </Modal>
      </TouchableOpacity>
      {/* <Button
        onPress={async ()=>{
          // local.downloadFolder("http://techslides.com/demos/sample-videos","testeFolder")
          try{
            file = await local.GetLocalFile();
            
            setGeoJson(JSON.parse(file))

          }
          catch(erro){
            console.log("err: "+erro)
          }
          } }
        title="Import KML"
        color="#fff"
        accessibilityLabel="Take Url From"
      />
      <Button
        onPress={async ()=>{
            const jsonData = JSON.stringify(geoJson)
            fileUri = await local.downloadKML(jsonData,text+".kml")
            await local.shareFile(fileUri)
          } }
        title="Export KML"
        color="#fff"
        accessibilityLabel="Take Url From"
      /> */}
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
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0, // This is the style you need to add
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  option: {
    padding: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
  },
});