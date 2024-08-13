import React from 'react';
import { View, Text } from 'react-native';
import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Animated } from 'react-native';
import { useState } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import { TouchableOpacity } from 'react-native';
import uuid from 'react-native-uuid';
import { FlatList } from 'react-native';
import { Alert } from 'react-native';
import { TextInput } from 'react-native';
import { Modal } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Sidebar(props) {
    const [translateX] = useState(new Animated.Value(props.open ? 0.6 * width : width));

    const handleLayerAdd = () => {
        let currentNames = props.layers.map((layer) => layer.name);
        let proposedNumber = props.layers.length + 1;

        while(currentNames.includes("Camada " + proposedNumber))
            proposedNumber++;
        
        let newLayer = {
            id: uuid.v4(),
            name: "Camada " + proposedNumber,
        }

        props.setLayers((prev) => [...prev, newLayer]);
    }

    const handleLayerEdit = (id) => {
        let layer = props.layers.find((layer) => layer.id === id);
    }

    const renderLayer = ({ item }) => (
        <View style={styles.layerContainer}>
          <TouchableOpacity onLongPress={toggleModal}> 
            <Text>{item.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            props.setLayers((prev) => prev.filter((layer) => layer.id !== item.id));
          }}>
            <Text>Remove</Text>
            </TouchableOpacity>
        </View>
      );

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: props.open ? 0.6 * width : width,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [props.open]);

    const [modalVisible, setModalVisible] = useState(false);
    const toggleModal = () => {
      setModalVisible(!modalVisible);
    };

    return (
        <TouchableWithoutFeedback onPressIn={() => {}}>
            <Animated.View style={{
                backgroundColor: "white",
                transform: [{ translateX }],
                position: 'absolute',
                zIndex: 100,
                height: '100%',
                width: '40%'
            }}>
                <View>
                <TouchableOpacity style={{margin:50}} onPress={handleLayerAdd}>
                <Text>Add Layer</Text>
                </TouchableOpacity>
                <FlatList
                    data={props.layers}
                    renderItem={renderLayer}
                    keyExtractor={item => item.id.toString()}
                />
                </View>
                <Modal
                    // animationType="slide"
                    visible={modalVisible}
                    onBackdropPress={toggleModal}
                    // style={styles.modal}
                >
                  <View style={styles.modalContent}>
                    <View style={styles.modalaaaa}>
                    <TouchableOpacity 
                      style={styles.option}  
                      onPress={toggleModal}
                    >
                      <Text style={styles.optionText}>Import KML</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.option} 
                      onPress={toggleModal}
                    >
                      <Text style={styles.optionText}>Export KML</Text>
                    </TouchableOpacity>
                  </View> 
                  </View>
                </Modal>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

const styles = {
    layerContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        margin: 5,
    },
    modal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transaprent',
      margin: 0,
      position: 'fixed',
      // zIndex:
    },
    modalContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      borderRadius: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 200,
      // width: '80%',
      // height: '80%',
      // alignItems: 'center',
    },
    modalaaaa: {
      backgroundColor: 'blue',
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
};