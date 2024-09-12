import React from 'react';
import { View, Text } from 'react-native';
import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Animated } from 'react-native';
import { useState } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import { TouchableOpacity } from 'react-native';
import FontAwesomeI from 'react-native-vector-icons/MaterialCommunityIcons'
import * as FileSystem from 'expo-file-system';

import { getLocalFile, shareFile, downloadKML } from './LocalFiles';
import * as translate from './GeoDocs';
import { styles } from './styles';



const { width, height } = Dimensions.get('window');

export default function Sidebar(props) {
  const [translateX] = useState(new Animated.Value(props.open ? 0.6 * width : width));

  const [hasSavedFile, setHasSavedFile] = useState(false);

  const checkSavedFile = async () => {
    const directories = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    if (directories.find((dir) => dir === "recordedPath.json")) {
      setHasSavedFile(true);
    }
    else setHasSavedFile(false);
  }

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: props.open ? 0.6 * width : width,
      duration: 100,
      useNativeDriver: true,
    }).start();

    const checkSavedFile = async () => {
      const directories = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      if (directories.find((dir) => dir === "recordedPath.json")) {
        setHasSavedFile(true);
      }
      else setHasSavedFile(false);
    }

    checkSavedFile();
  }, [props.open, hasSavedFile]);

  return (
    <TouchableWithoutFeedback onPressIn={() => { }}>
      <Animated.View style={{
        backgroundColor: "white",
        transform: [{ translateX }],
        position: 'absolute',
        zIndex: 100,
        height: '100%',
        width: '40%'
      }}>
        <View style={styles.sideBarWrapper}>
          <TouchableOpacity
            style={styles.sideBarTouchable}
            onPress={async () => {
              const jsonData = JSON.stringify(props.geoJson)
              let kmlData = await translate.GeoJSON2KML(jsonData);
              let fileUri = await downloadKML(kmlData, "titulo" + ".kml") // lembrar de colocar o titulo no lugar do text
              await shareFile(fileUri)
            }}
          >
            <FontAwesomeI name="export" size={25} color="black" />
            <Text style={styles.sideBarText}>Exportar KML</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sideBarTouchable}
            onPress={async () => {
              let fileKML = await getLocalFile();
              let fileGeoJSON = await translate.KML2GeoJSON(fileKML);
              props.setGeoJson(fileGeoJSON)
            }}
          >
            <FontAwesomeI name="import" size={25} color="black" />
            <Text style={styles.sideBarText}>Importar KML</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={hasSavedFile ? styles.sideBarTouchable : styles.sideBarTouchableDisabled}
            disabled={!hasSavedFile}
            onPress={async () => {
              console.log(has)
              await shareFile(FileSystem.documentDirectory + "recordedPath")
            }}
          >
            <FontAwesomeI name="map-marker-path" size={25} color="black" />
            <Text style={styles.sideBarText}>Exportar Caminho Gravado</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
