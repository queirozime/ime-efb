import { StyleSheet, Text, View, Button, Platform, TouchableOpacity, TextInput, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Location from "expo-location";
import Modal from 'react-native-modal';

import MapView, { UrlTile, Geojson} from 'react-native-maps';
import { LocalTile, Marker, Polyline, Polygon } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome'

import * as local from './LocalFiles';
import Map from './Map';
import Sidebar from './Sidebar';
import { Animated } from 'react-native';
import { useRef } from 'react';

// // latitude and longitude
const latitude = 37.78825;
const longitude = -122.4324;
          
export default function App() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [opacity] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: sidebarOpen ? 0.5 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen, layers]);

  const handleOutsidePress = () => {
    setSidebarOpen(false);
  };

  const [layers, setLayers] = useState([]);
  const [layerEditId, setLayerEditId] = useState(null);

  return(
    <TouchableWithoutFeedback onPressIn={handleOutsidePress}>
      <View style={styles.container}>
        <Animated.View style={[styles.overlay, {opacity}]}>
          <View style={{position:'absolute', top:50, right: 20, zIndex: 500}}>
            {!sidebarOpen && <TouchableOpacity
              onPress={() => {
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <Icon name="bars" size={30} color="rgba(0,0,0,0.5)" />
            </TouchableOpacity>}
          </View>
          <Map layerEditId={layerEditId} layers={layers} setLayers={setLayers} />
        </Animated.View>
        <Sidebar 
          open={sidebarOpen} 
          layers={layers} 
          setLayers={setLayers} 
          layerEditId={layerEditId}
          setLayerEditId={setLayerEditId}
        />
        </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    marginTop: '100px',
    paddingBottom: '100px',
    backgroundColor: 'black',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 0,
  },
  circleButton: {
    width: '100%', 
    height: '100%', // same as height 
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