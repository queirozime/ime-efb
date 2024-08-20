import React, { Component, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Touchable, TouchableOpacity } from 'react-native';
import { Polyline } from 'react-native-maps';
import { Button } from 'react-native';

import MapView from 'react-native-maps';
import Layer from './Layer';
import uuid from 'react-native-uuid';
import Icon from 'react-native-vector-icons/FontAwesome'
import { Polygon } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function Map(props) {

  const [isDrawing, setIsDrawing] = useState(false);
  const [DrawingColor, setDrawingColor] = useState("black");

  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [location, setLocation] = useState({ latitude: -22.9, longitude: -43.2, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });
  const [locationError, setLocationError] = useState(null);
  const [recordLocation, setRecordLocation] = useState(false);
  const [locationFile, setLocationFile] = useState(null);


  const [pathTile, setPathTile] = useState(null)

  const eventToCoordinate = async (e, map) => {
    const { locationX, locationY } = e.nativeEvent;
    const coordinate = await map.coordinateForPoint({ x: locationX, y: locationY });
    return coordinate;
  }

  const logLocation = async () => {
    getLocation();
    console.log("Record location:", recordLocation);
    console.log("Location:", location);
    local.saveLocation(location, locationFile);
  }

  const handleTouchStart = async (e) => {
    const coordinate = await eventToCoordinate(e, this.map);
    setRefresh(!refresh);
    setAction("start");
    setEventCoord(coordinate);
  }
  
  const handleTouchMove = async (e) => {
    const coordinate = await eventToCoordinate(e, this.map);
    setRefresh(!refresh);
    setAction("move");
    setEventCoord(coordinate);
  }
  
  const handleTouchEnd = async (e) => {
    const coordinate = await eventToCoordinate(e, this.map);
    setRefresh(!refresh);
    setAction("end");
    setEventCoord(coordinate);
  }

  const [eventCoord, setEventCoord] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [action, setAction] = useState("none");

  return (
    <View
      style={{width: '100%', height: '100%', position: 'relative'}}
    >
    <MapView
      style={{width: "100%", height: "100%"}}
      followsUserLocation={isFollowingUser}
      showsUserLocation={true}
      initialRegion={location}
      scrollEnabled={!isDrawing}
      ref = {map => {this.map = map}}
      mapType="normal"
      onTouchStart={(e) => handleTouchStart(e)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onRegionChange={() => {setIsFollowingUser(false)}}
    >
      {/* <UrlTile urlTemplate={'http://172.15.0.66:5000/{z}/{x}/{y}.png'} shouldReplaceMapContent={false}/> */}
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
      backgroundColor: isDrawing ? "rgba(74, 74, 74, 0.5)" : "rgba(255, 255, 255, 0.3)",
    }
  ]}
>
  <Icon name="pencil" size={30} color="#fff" />
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
    backgroundColor: "black",
    bottom: 30,
    right: 30,
  }
});