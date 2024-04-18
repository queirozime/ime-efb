import * as Location from "expo-location";
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { useState, useEffect } from "react";
import { StyleSheet, View, Button } from "react-native";

const Map = () => {
    const [location, setLocation] = useState(
        {
            latitude: -22.9, 
            longitude: -43.2, 
            latitudeDelta: 0.0922, 
            longitudeDelta: 0.0421
        }
    );
    const [locationError, setLocationError] = useState(null);
    const [pathTile,setPathTile] = useState(null);
    const [region, setRegion] = useState(null);

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

    useEffect(() => {
        getLocation();
    }, []);

    console.log(location);

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    });

    const { latitude, longitude } = location?.coords || {};
    return (
        <View style={styles.container}>
            <MapView
            style={{width: "100%", height: "80%"}}
            followsUserLocation={true}
            showsUserLocation={true}
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
        </View>
    )
}

export default Map;