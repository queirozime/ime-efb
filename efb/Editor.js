import React from 'react';
import { View, Text, StyleSheet, Dimensions, Touchable, TouchableOpacity } from 'react-native';
import { Polyline } from 'react-native-maps';
import { Button } from 'react-native';
import { Modal } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { Alert } from 'react-native';


export default function Editor(props) {

  const deleteLayer = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this layer?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            props.setLayers((prev) => prev.filter((layer) => layer.id !== id));
            props.toggleModal();
            props.setLayerEditId(null);
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  }

  const renameLayer = (id) => {
    const layer = props.layers.find(layer => layer.id === id);
    const currentName = layer ? layer.name : '';
  
    Alert.prompt(
      "Rename Layer",
      "Enter a new name for the layer",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Rename cancelled"),
          style: "cancel"
        },
        {
          text: "Rename",
          onPress: (newName) => {
            // if size is 0, dont rename...
            if(newName.length === 0)
              return;
            props.setLayers((prev) => prev.map((layer) => {
              if(layer.id === id)
                return { ...layer, name: newName };
              return layer;
            }));
            props.toggleModal();
          },
          style: "default"
        }
      ],
      "plain-text",
      currentName,
      "default"
    );
  }

  const handleEdit = (id) => {
    props.setLayerEditId(id);
    props.toggleModal();
  }

    return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={props.modalVisible}
        >
          <TouchableOpacity 
            style={{flex: 1}}
            activeOpacity={1}
            onPress={props.toggleModal}
          >
          <View style={styles.modalContainer}>
              <TouchableWithoutFeedback
                style={styles.option}
              >
                <View style={styles.modalContent}>
                  <TouchableOpacity 
                    onPress={() => {renameLayer(props.layerSelectId)}} 
                    style={[styles.option]}>
                    <Text style={styles.optionText}>Rename</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {handleEdit(props.layerSelectId)}} style={styles.option}>
                    <Text style={styles.optionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {deleteLayer(props.layerSelectId)}} style={[styles.option, {backgroundColor:'rgba(255,0,0,0.5)'}]}>
                    <Text style={styles.optionText}>Delete</Text>
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