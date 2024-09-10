import React from 'react';
import { View, Text, StyleSheet, Dimensions, Touchable, TouchableOpacity } from 'react-native';
import { Modal } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { getLocalFile, shareFile, downloadKML } from './LocalFiles';
import * as translate from './GeoDocs'
import * as FileSystem from 'expo-file-system';


export default function Export(props) {
  const toggleModal = () => {
    props.setModalVisible(!props.modalVisible);
  }
  

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={toggleModal}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback
            style={styles.option}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.option}
                onPress={async () => {
                  // local.downloadFolder("http://techslides.com/demos/sample-videos","testeFolder")
                    let fileKML = await getLocalFile();
                    let fileGeoJSON = await translate.KML2GeoJSON(fileKML);
                    props.setGeoJson(fileGeoJSON)
                }}
              >
                <Text style={styles.optionText}>Import KML</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                onPress={async () => {
                    const jsonData = JSON.stringify(props.geoJson)
                    let kmlData = await translate.GeoJSON2KML(jsonData);
                    let fileUri = await downloadKML(kmlData, "titulo" + ".kml") // lembrar de colocar o titulo no lugar do text
                    await shareFile(fileUri)
                }}
              >
                <Text style={styles.optionText}>Export KML</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                //disabled={!hasSavedFile}
                onPress={async () => {
                  await shareFile(FileSystem.documentDirectory + "recordedPath")
                }}
              >
                <Text style={styles.optionText}>Export Recorded Path</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = {
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '40%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white', // Modal content background
    alignItems: 'center',
  },
  option: {
    padding: 10,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    color: 'black',
  },
};