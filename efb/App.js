import { StyleSheet, Text, View, Button, Platform, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import * as Location from "expo-location";
import Modal from 'react-native-modal';

import MapView, { UrlTile, Geojson } from 'react-native-maps';
import { LocalTile, Marker, Polyline, Polygon } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome'
import * as FileSystem from 'expo-file-system';
import { getLocalFile, shareFile, downloadKML } from './LocalFiles';
import { buildGeoJsonFromCoordinates } from './utils';


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


export default function App() {

  const [isDrawing, setIsDrawing] = useState(false);
  const [DrawingColor, setDrawingColor] = useState("black");
  const [polylines, setPolylines] = useState([]);
  const [polyline, setPolyline] = useState([]);
  const intervalRef = useRef(null);

  const savePolyline = () => {
    if (polyline.length > 1)
      setPolylines([...polylines, polyline]);
    setPolyline([]);
  }
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [recordedCoordinates, setRecordedCoordinates] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [hasSavedFile, setHasSavedFile] = useState(false);

  const checkExistingFile = async () => {
    const { exists } = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "recordedPath");
    setHasSavedFile(exists);
  }

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const updateLocation = async () => {
    console.log("Updating location...");
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      coordinates = [location.coords.longitude, location.coords.latitude];

      setRecordedCoordinates((prevState) => [...prevState, coordinates]);

    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };

  // const logLocation = async () => {
  //   await getLocation();
  //   const directories = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
  //   if (directories.includes("locations")) {
  //     const locationContent = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + "locations");
  //     currentCoordinates = [locationContent["coords"]["latitude"], locationContent["coords"]["longitude"]];
  //   }


  //   await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "locations", JSON.stringify(location));
  //   console.log("Location content:", locationContent);
  // }

  const startRecording = () => {
    setIsRecording(true);
    setRecordedCoordinates([]);
    intervalRef.current = setInterval(updateLocation, 5000);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    clearInterval(intervalRef.current);

    const geoJsonData = buildGeoJsonFromCoordinates(recordedCoordinates);

    await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "recordedPath", JSON.stringify(geoJsonData));
    setHasSavedFile(true);

    const directories = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    console.log("Directories:", directories);
    const fileContent = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + "recordedPath");
    console.log("File content:", fileContent);
  };

  // useEffect(() => {
  //   getLocation();
  //   const locationInterval = setInterval(() => {
  //     if (isRecording)
  //       logLocation();
  //   }, 1000);

  //   return () => {
  //     clearInterval(locationInterval);
  //   }
  // }, [isRecording]);

  useEffect(() => {
    checkExistingFile();
  }, [hasSavedFile]);

  const [text, setText] = useState("titulo");


  const [geoJson, setGeoJson] = useState({
    "type": "FeatureCollection",
    "features": [

    ]
  })

  return (
    <View style={styles.container}>
      <MapView
        style={{ width: "100%", height: "100%" }}
        followsUserLocation={isFollowingUser}
        showsUserLocation={true}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        scrollEnabled={!isDrawing}
        ref={map => { this.map = map }}
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
        <UrlTile urlTemplate={'http://172.15.0.66:5000/{z}/{x}/{y}.png'} shouldReplaceMapContent={false} />
        {polylines.map((polyline, index) => (
          <Polyline key={index} coordinates={polyline} strokeColor="red" strokeWidth={2} />
        ))}
        {polyline.length > 1 && <Polyline coordinates={polyline} strokeColor="red" strokeWidth={2} />}
        <Marker
          coordinate={{ latitude: latitude, longitude: longitude }}
          title={'My Marker'}
          description={'This is my marker'}
        />

        <Geojson
          geojson={geoJson}
          tracksViewChanges={true}
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
        onPress={async () => {
          if (isRecording) {
            await stopRecording();
          } else {
            await startRecording();
          }
        }}
        style={[
          styles.circleButton,
          { bottom: 20, left: 100, backgroundColor: isRecording ? "rgba(74, 74, 74, 0.5)" : "rgba(255, 255, 255, 0.3)" }
        ]}
      >
        <Text style={{ color: "#fff" }}>R</Text>
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
              onPress={async () => {
                try {
                  file = await getLocalFile();

                  setGeoJson(JSON.parse(file))

                }
                catch (erro) {
                  console.log("err: " + erro)
                }
              }}
            >
              <Text style={styles.optionText}>Import KML</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              onPress={async () => {
                const jsonData = JSON.stringify(geoJson)
                fileUri = await downloadKML(jsonData, text + ".kml")
                await shareFile(fileUri)
              }}
            >
              <Text style={styles.optionText}>Export KML</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              disabled={!hasSavedFile}
              onPress={async () => {
                await shareFile(FileSystem.documentDirectory + "recordedPath")
              }}
            >
              <Text style={styles.optionText}>Export Recorded Path</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </TouchableOpacity>
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