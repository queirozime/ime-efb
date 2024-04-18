import { StyleSheet, Text, View, Button } from 'react-native';
// use effect
import React, { useEffect, useState } from 'react';
import * as Location from "expo-location";
// // react native maps
import MapView from 'react-native-maps';
import { UrlTile, Marker, Polyline, Polygon } from 'react-native-maps';

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
// polyline coordinates

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
          
export default function App() {
            
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const [pathTile,setPathTile] = useState(null)

  useEffect(() => {
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
    getLocation();
  }, []);

  console.log(location);

  const { latitude, longitude } = location?.coords || {};

  // return map on current location
  return(
    <View style={styles.container}>
      <MapView
        style={{width: "100%", height: "80%"}}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
      {pathTile?
        <LocalTile
          pathTemplate={pathTile}
          tileSize={256}
        />:
        null}
        <Marker
          coordinate={{latitude: latitude, longitude: longitude}}
          title={'My Marker'}
          description={'This is my marker'}
        />
      </MapView>
      <Button
        // onPress={}
        title="Load Map"
        color="#fff"
        accessibilityLabel="Take Url From"
      />
    </View>
  );
  // return(
  //   // draw polygon
  //   // tiles
  //   <View style={styles.container}>
  //     <Text>Open up App.js to start working on your app!</Text>
  //     <MapView
  //       style={{width: 400, height: 400}}
  //       initialRegion={{
  //         latitude: 37.78825,
  //         longitude: -122.4324,
  //         latitudeDelta: 0.0922,
  //         longitudeDelta: 0.0421,
  //       }}
  //     >
  //       <Polygon
  //         coordinates={polygon}
  //         fillColor={'rgba(100, 200, 200, 0.3)'}
  //         strokeWidth={2}
  //       />
  //     </MapView>
  //   </View>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});