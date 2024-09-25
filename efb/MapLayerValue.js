import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Alert, StyleSheet, Modal, Text, TouchableOpacity } from 'react-native';
import { GlobalStateContext } from './Context';
import { ScrollView } from 'react-native';


// colocar no export

const MapLayerValue = (props) => {
  const { setMapLayerValue } = useContext(GlobalStateContext);

  const [layerValues, setLayerValues] = useState([]);

  const getLayerValues = async () => {
    try {
      const response = await fetch('http://172.15.6.130:5000/layers');
      const data = await response.json();
      setLayerValues(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getLayerValues();
    console.log(layerValues);
  }, []);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}
      onRequestClose={() => {
        props.setModalVisible(!props.modalVisible);
      }}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={() => props.setModalVisible(!props.modalVisible)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalView}>
            <Text style={styles.modalText}>Selecione a camada:</Text>
            {layerValues?.map((layer) => (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setMapLayerValue(layer.name);
                  props.setModalVisible(!props.modalVisible);
                }}
              >
                <Text style={styles.textStyle}>{layer.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 200,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: 'center',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MapLayerValue;
