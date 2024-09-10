import React, { Component, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Touchable, TouchableOpacity } from 'react-native';
import { UrlTile } from 'react-native-maps';
import { Button } from 'react-native';
import * as Location from "expo-location";
import { Polyline } from 'react-native-maps';
import * as FileSystem from 'expo-file-system';

import MapView from 'react-native-maps';
import Layer from './Layer';
import uuid from 'react-native-uuid';
import FontAwesomeI from 'react-native-vector-icons/FontAwesome'
import MaterialCommunityIconsI from 'react-native-vector-icons/MaterialCommunityIcons'
import { buildGeoJsonFromCoordinates } from './utils';

import { Polygon, Geojson } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function Map(props) {

  const [isDrawing, setIsDrawing] = useState(false);
  const [DrawingColor, setDrawingColor] = useState("black");

  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [location, setLocation] = useState({ latitude: -22.9, longitude: -43.2, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });

  const [isRecording, setIsRecording] = useState(false);
  const [recordedCoordinates, setRecordedCoordinates] = useState([]);
  const [hasSavedFile, setHasSavedFile] = useState(false);

  const [polylines, setPolylines] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [polyline, setPolyline] = useState([]);

  const intervalRef = useRef(null);

  const savePolyline = () => {
    if (polyline.length > 1)
      setPolylines([...polylines, polyline]);
    setPolyline([]);
  }

  function onTouchMove(coordinate) {
    console.log(coordinate);
    if (isDrawing) {
      setPolyline([...polyline, coordinate]);
    }
  }

  function onTouchEnd(eventDetails) {
    savePolyline();
  }

  const eventToCoordinate = async (e, map) => {
    const { locationX, locationY } = e.nativeEvent;
    const coordinate = await map.coordinateForPoint({ x: locationX, y: locationY });
    return coordinate;
  }


  const handleTouchStart = async (e) => {
    const coordinate = await eventToCoordinate(e, this.map);
    // onTouchStart(coordinate);
    // setRefresh(!refresh);
    // setAction("start");
    // setEventCoord(coordinate);
  }

  const handleTouchMove = async (e) => {
    const coordinate = await eventToCoordinate(e, this.map);
    onTouchMove(coordinate);
    // setRefresh(!refresh);
    // setAction("move");
    // setEventCoord(coordinate);
  }

  const handleTouchEnd = async (e) => {
    const coordinate = await eventToCoordinate(e, this.map);
    onTouchEnd(coordinate);
    // setRefresh(!refresh);
    // setAction("end");
    // setEventCoord(coordinate);
  }

  const [eventCoord, setEventCoord] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [action, setAction] = useState("none");

  const checkExistingFile = async () => {
    const { exists } = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "recordedPath");
    setHasSavedFile(exists);
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


  return (
    <View
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <MapView
        style={{ width: "100%", height: "100%" }}
        followsUserLocation={isFollowingUser}
        showsUserLocation={true}
        initialRegion={location}
        scrollEnabled={!isDrawing}
        ref={map => { this.map = map }}
        mapType="normal"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onRegionChange={() => { setIsFollowingUser(false) }}
      >
        <UrlTile urlTemplate={'http://192.168.0.42:5000/{z}/{x}/{y}.png'} shouldReplaceMapContent={false} />
        {props.layers.map((layer, index) => (
          <Layer
            key={layer.id}
            id={layer.id}
            layerEditId={props.layerEditId}
            refresh={refresh}
            action={action}
            eventCoord={eventCoord}
            isDrawing={isDrawing}
          />
        ))}
        {polylines.map((polyline, index) => (
          <Polyline key={index} coordinates={polyline} strokeColor="red" strokeWidth={2} />
        ))}
        <Polyline coordinates={recordedCoordinates} strokeColor="red" strokeWidth={5} />
        <Geojson
          geojson={props.geoJson}
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
          {
            position: 'absolute',
            backgroundColor: isDrawing ? "rgba(74, 74, 74, 0.5)" : "white",
          }
        ]}
      >
        <FontAwesomeI name="pencil" size={30} color="gray" />
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
          styles.recordButton,
          {
            position: 'absolute',
          }
        ]}
      >
        <MaterialCommunityIconsI name="record-rec" size={50} color={isRecording ? "red" : "gray"} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  circleButton: {
    width: 60,
    height: 60, // same as height 
    borderRadius: 60, // Half of the width/height
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  pencilButton: {
    backgroundColor: 'white',
    bottom: 30,
    right: 30,
  },
  recordButton: {
    backgroundColor: 'white',
    bottom: 110,
    right: 30,
    display: 'flex',
  }
});