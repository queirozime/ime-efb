import { StyleSheet, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';

import Icon from 'react-native-vector-icons/FontAwesome'

import Map from './Map';
import Sidebar from './Sidebar';
import { Animated } from 'react-native';


export default function App() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [geoJson, setGeoJson] = useState({
    "type": "FeatureCollection",
    "features": [],
  })

  const [opacity] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: sidebarOpen ? 0.5 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen]);

  const handleOutsidePress = () => {
    setSidebarOpen(false);
  };

  return (
    <TouchableWithoutFeedback onPressIn={handleOutsidePress}>
      <View style={styles.container}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <View style={{
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 500,
            width: 60,
            height: 60,
            backgroundColor: 'white',
            borderRadius: 30,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {!sidebarOpen && <TouchableOpacity
              onPress={() => {
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <Icon name="bars" size={30} color="rgba(0,0,0,0.5)" />
            </TouchableOpacity>}
          </View>
          <Map
            geoJson={geoJson}
          />
        </Animated.View>
        <Sidebar
          open={sidebarOpen}
          setGeoJson={setGeoJson}
          geoJson={geoJson}
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