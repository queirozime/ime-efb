import { StyleSheet, Text, View, Button, Platform, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Location from "expo-location";
import Modal from 'react-native-modal';

import MapView, { UrlTile, Geojson} from 'react-native-maps';
import { LocalTile, Marker, Polyline, Polygon } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome'

import * as local from './LocalFiles';
import Map from './Map';

// // latitude and longitude
const latitude = 37.78825;
const longitude = -122.4324;
          
export default function App() {

  return(
    <View style={styles.container}>
      <Map />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    width: '100%',
    // justifyContent: 'center',
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