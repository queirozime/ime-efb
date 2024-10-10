import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import * as Location from "expo-location";
import { UrlTile, Geojson, Polyline, Circle, Polygon } from 'react-native-maps';
import MapView from 'react-native-maps';
import * as FileSystem from 'expo-file-system';
import FontAwesomeI from 'react-native-vector-icons/FontAwesome'
import FontAwesome5I from 'react-native-vector-icons/FontAwesome5'
import MaterialCommunityIconsI from 'react-native-vector-icons/MaterialCommunityIcons'
import uuid from 'react-native-uuid';
import * as Network from 'expo-network';

import { buildGeoJsonFromCoordinates, updateGeoJsonFromDrawing, getDistanceHaversine, removePolygonsAndLineStrings, removeFromGeoJsonById } from './utils';
import RecordManager from './RecordManager';
import DrawColorPicker from './DrawColorPicker';
import { styles } from './styles';
import { GlobalStateContext } from './Context';

export default function Map(props) {

  const {
    isDrawing,
    setIsDrawing,
    isDrawingCircle,
    setIsDrawingCircle,
    isDrawingPolygon,
    setIsDrawingPolygon,
    isErasing,
    setIsErasing,
    mapLayerValue,
    geoJson,
    setGeoJson,
    offlineMode,
  } = useContext(GlobalStateContext);

  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [location, setLocation] = useState({ latitude: -22.9, longitude: -43.2, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });

  const [isRecording, setIsRecording] = useState(false);
  const [recordedCoordinates, setRecordedCoordinates] = useState([0.0, 0.0, 0.0]);
  const [hasSavedFile, setHasSavedFile] = useState(false);

  function addOpacityToColor(color, opacity) {
    const rgbValues = color.match(/\d+/g);
    const [r, g, b] = rgbValues.map(Number);
    return `rgba(${r},${g},${b},${opacity})`;
  }

  const [drawColor, setDrawColor] = useState("rgba(255,255,0,1)");
  const [drawWidth, setDrawWidth] = useState(2);
  const [fillColor, setFillColor] = useState(addOpacityToColor(drawColor, 0.3));

  const handleColorChange = (color) => {
    setDrawColor(color.rgb);
    setFillColor(addOpacityToColor(color.rgb, 0.3));
  }

  const [polylines, setPolylines] = useState([]);
  const [polyline, setPolyline] = useState({});

  const [circles, setCircles] = useState([]);
  const [circle, setCircle] = useState({});

  const [polygons, setPolygons] = useState([]);
  const [polygon, setPolygon] = useState({});

  const [recordManagerModalOpen, setRecordManagerModalOpen] = useState(false);
  const [colorModalOpen, setColorModalOpen] = useState(false);

  const intervalRef = useRef(null);

  const savePolyline = () => {
    if (polyline.coords && polyline.coords.length > 1) {
      setPolylines([...polylines, polyline]);
      let updatedGeoJson = updateGeoJsonFromDrawing(geoJson, "polyline", polyline);
      setGeoJson(updatedGeoJson);
    }
    setPolyline({});
  }

  const savePolygon = () => {
    if (polygon.coords && polygon.coords.length > 1) {
      setPolygons([...polygons, polygon]);
      let updatedGeoJson = updateGeoJsonFromDrawing(geoJson, "polygon", polygon);
      setGeoJson(updatedGeoJson);
    }
    setPolygon({});
  }

  const saveCircle = () => {
    if (circle.center && circle.radius > 0) {
      setCircles([...circles, circle]);
      let updatedGeoJson = updateGeoJsonFromDrawing(geoJson, "circle", circle);
      setGeoJson(updatedGeoJson);
    }
    setCircle({});
  }


  function onTouchStart(coordinate) {
    if (isDrawing) {
      setPolyline({ coords: [coordinate], strokeColor: drawColor, strokeWidth: drawWidth, id: uuid.v1() });
    } else if (isDrawingCircle) {
      setCircle({ center: coordinate, radius: 0, strokeColor: drawColor, strokeWidth: drawWidth, fillColor: fillColor, id: uuid.v1() });
    } else if (isDrawingPolygon) {
      setPolygon({ coords: [coordinate], strokeColor: drawColor, strokeWidth: drawWidth, fillColor: fillColor, id: uuid.v1() });
    }
  }

  function onTouchMove(coordinate) {
    if (isDrawing)
      setPolyline((prevPolyline) => ({ ...prevPolyline, coords: [...prevPolyline.coords, coordinate] }));
    else if (isDrawingCircle) {
      let radius = getDistanceHaversine(circle.center, coordinate);
      setCircle((prevCircle) => ({ ...prevCircle, radius: radius }));
    } else if (isDrawingPolygon)
      setPolygon((prevPolygon) => ({ ...prevPolygon, coords: [...prevPolygon.coords, coordinate] }));
  }

  function onTouchEnd(eventDetails) {
    if (isDrawing)
      savePolyline();
    else if (isDrawingCircle)
      saveCircle();
    else if (isDrawingPolygon)
      savePolygon();
  }

  const eventToCoordinate = async (e, map) => {
    const { locationX, locationY } = e.nativeEvent;
    const coordinate = await map.coordinateForPoint({ x: locationX, y: locationY });
    return coordinate;
  }


  const handleTouchStart = async (e) => {
    const coordinate = await eventToCoordinate(e, this.map);
    onTouchStart(coordinate);
  }

  const handleTouchMove = async (e) => {
    const coordinate = await eventToCoordinate(e, this.map);
    onTouchMove(coordinate);
  }

  const handleTouchEnd = async (e) => {
    const coordinate = await eventToCoordinate(e, this.map);
    onTouchEnd(coordinate);
  }

  const updateLocation = async () => {
    console.log("Updating location...");
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      coordinates = [location.coords.longitude.toFixed(4), location.coords.latitude.toFixed(4), 0];

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

    await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "recordedPath.json", JSON.stringify(geoJsonData));
    setHasSavedFile(true);

    const directories = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    console.log("Directories:", directories);
    const fileContent = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + "recordedPath.json");
    console.log("File content:", fileContent);
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      if (hasSavedFile) {
        setRecordManagerModalOpen(true);
      }
      else {
        await startRecording();
      }
    }
  };

  const handleToggleDrawing = () => {
    setIsDrawing(!isDrawing);
    setIsDrawingCircle(false);
    setIsDrawingPolygon(false);
    setIsErasing(false);
  }

  const handleCircleDrawing = () => {
    setIsDrawing(false);
    setIsDrawingCircle(!isDrawingCircle);
    setIsDrawingPolygon(false);
    setIsErasing(false);
  }

  const handlePolygonDrawing = () => {
    setIsDrawing(false);
    setIsDrawingCircle(false);
    setIsDrawingPolygon(!isDrawingPolygon);
    setIsErasing(false);
  }

  const handleToggleErasing = () => {
    setIsDrawing(false);
    setIsDrawingCircle(false);
    setIsDrawingPolygon(false);
    setIsErasing(!isErasing);
  }

  const handleToggleColorPicker = () => {
    setColorModalOpen(!colorModalOpen);
  }

  const shouldScrollMap = () => {
    return !isDrawing && !isDrawingCircle && !isDrawingPolygon && !isErasing;
  }

  const handleGeoJsonPress = (event) => {
    if (isErasing) {
      removeFromGeoJsonById(geoJson, setGeoJson, event.feature.properties.id);
    }
  }

  useEffect(() => {
    const checkExistingFile = async () => {
      const { exists } = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "recordedPath.json");
      setHasSavedFile(exists);
    };

    checkExistingFile();
  }, [hasSavedFile, isDrawing, mapLayerValue, offlineMode]);


  return (
    <View
      style={styles.container}
    >
      <MapView
        style={styles.mapView}
        followsUserLocation={isFollowingUser}
        showsUserLocation={true}
        initialRegion={location}
        scrollEnabled={shouldScrollMap()}
        ref={map => { this.map = map }}
        mapType="normal"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onRegionChange={() => { setIsFollowingUser(false) }}
      >
        <UrlTile urlTemplate={`http://3.141.195.194:5000/{z}/{x}/{y}?&layer=${mapLayerValue}`} shouldReplaceMapContent={false}
          zIndex={0}
          key={`url-${mapLayerValue}`}
          offlineMode={offlineMode}
          tileCacheMaxAge={86400}
          tileCachePath={FileSystem.cacheDirectory + mapLayerValue}
        />
        {polyline.coords && polyline.coords.length > 1 && <Polyline coordinates={polyline.coords} strokeColor={drawColor} strokeWidth={drawWidth} key={`geojson-${mapLayerValue}-${polyline.coords}`}
          zIndex={1}
        />}
        {polygon.coords && polygon.coords.length > 1 && <Polygon coordinates={polygon.coords} strokeColor={drawColor} strokeWidth={drawWidth} fillColor={fillColor} key={`gon-${mapLayerValue}-${polygon.coords}`} zIndex={1} />}
        {circle.radius > 0 && <Circle center={circle.center} radius={circle.radius} strokeColor={drawColor} strokeWidth={drawWidth} fillColor={fillColor} key={`circle-${mapLayerValue}-${circle.center}`} zIndex={1} />}
        <Geojson
          geojson={geoJson}
          tracksViewChanges={true}
          key={`geojson-${mapLayerValue}`}
          zIndex={1}
          onPress={handleGeoJsonPress}
        />
      </MapView>
      <TouchableOpacity
        onPress={handleToggleDrawing}
        onLongPress={handleToggleColorPicker}
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
        onPress={handleToggleRecording}
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
      <TouchableOpacity
        onPress={handleCircleDrawing}
        onLongPress={handleToggleColorPicker}
        style={[
          styles.circleButton,
          styles.drawCircleButton,
          {
            position: 'absolute',
            backgroundColor: isDrawingCircle ? "rgba(74, 74, 74, 0.3)" : "white"
          }
        ]}
      >
        <MaterialCommunityIconsI name="radius-outline" size={45} color={isDrawingCircle ? "white" : "gray"} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handlePolygonDrawing}
        onLongPress={handleToggleColorPicker}
        style={[
          styles.circleButton,
          styles.drawPolygonButton,
          {
            position: 'absolute',
            backgroundColor: isDrawingPolygon ? "rgba(74, 74, 74, 0.3)" : "white"
          }
        ]}
      >
        <FontAwesome5I name="draw-polygon" size={40} color={isDrawingPolygon ? "white" : "gray"} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleToggleErasing}
        style={[
          styles.circleButton,
          styles.eraserButton,
          {
            position: 'absolute',
            backgroundColor: isErasing ? "rgba(74, 74, 74, 0.3)" : "white"
          }
        ]}
      >
        <FontAwesome5I name="eraser" size={40} color={isErasing ? "white" : "gray"} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleToggleColorPicker}
        style={[
          styles.circleButton,
          styles.colorPickerButton,
          { backgroundColor: drawColor }
        ]}
      >
        <MaterialCommunityIconsI name="palette-outline" size={30} color='black' position='absolute' />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => removePolygonsAndLineStrings(geoJson, setGeoJson)}
        style={[
          styles.circleButton,
          styles.garbageButton,
        ]}
      >
        <MaterialCommunityIconsI name="delete" size={30} color='gray' position='absolute' />
      </TouchableOpacity>
      <RecordManager
        modalVisible={recordManagerModalOpen}
        setModalVisible={setRecordManagerModalOpen}
        setHasSavedFile={setHasSavedFile}
      />
      <DrawColorPicker
        modalVisible={colorModalOpen}
        setModalVisible={setColorModalOpen}
        onSelectColor={handleColorChange}
        currentColor={drawColor}
      />
    </View>
  );
}
