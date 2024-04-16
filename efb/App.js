import { StyleSheet } from 'react-native';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import React from 'react';
//import { getCurrentPosition } from 'react-native-geolocation-service'

const markerIcon = '../assets/airplane.png';


export default function App() {
  //const [position, setPosition] = React.useState({latitude: 0, longitude: 0})
  // React.useEffect(() => {
  //   const positionalListeners = getCurrentPosition(
  //     (res) => {
  //       const position = {
  //         latitude: res.latitude,
  //         longitude: res.longitude,
  //       };
  //       console.log(position);
  //       setPosition(position);
  //     },
  //     (err) => {
  //       console.log(err);
  //     },
  //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  //   )
  //   return positionalListeners;
  // }, [])
  // console.log(position);

  return (
      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          />
        <Marker position={[51.505, -0.09]} icon={new Icon({iconUrl: markerIcon, iconAnchor:[12,41], iconSize:[24,41]}) }>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 'auto',
    width: 'auto',
  },
});
