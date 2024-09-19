import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, Modal, Text, TouchableOpacity } from 'react-native';
import * as translate from './GeoDocs';
import { getLocalFile, shareFile, downloadKML } from './LocalFiles';


// colocar no export


const ExportFileButton = (props) => {
    
    const [fileName, setFileName] = useState('');
    const handleExport = async () => {
    if (fileName.trim() === '') {
      Alert.alert('Erro', 'O nome do arquivo não pode estar vazio!');
    } else {
      try{
        
        const jsonData = JSON.stringify(props.geoJson)
        let kmlData = await translate.GeoJSON2KML(jsonData);
        let fileUri = await downloadKML(kmlData, fileName + ".kml") 
        await shareFile(fileUri)
        props.setModalVisible(!props.modalVisible);
      }
      catch(e){
        console.log('err:',e)
      }
        setFileName('')
    }
  };

  return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={props.modalVisible}
        onRequestClose={() => {
            props.setModalVisible(!props.modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Digite o nome do arquivo:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do arquivo"
              value={fileName}
              onChangeText={(text) => setFileName(text)}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                  style={[styles.closeButton, styles.button]}
                  onPress={() => props.setModalVisible(!props.modalVisible)}
                >
                <Text style={styles.textStyle}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.exportButton,styles.button]} onPress={async ()=>{await handleExport()}}>
                <Text style={styles.textStyle}>Exportar</Text>
              </TouchableOpacity>
              
            </View>
            <View />
          </View>
        </View>
      </Modal>
  );
};

const styles = StyleSheet.create({

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalButtons: {
    flexDirection:"row",
    justifyContent: 'center',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  input: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  exportButton: {
    backgroundColor: '#2196F3',
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
  },
  closeButton: {
    backgroundColor: '#f44336',
    marginRight: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ExportFileButton;
