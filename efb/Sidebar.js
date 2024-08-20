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
import { Modal } from 'react-native';
import Editor from './Editor';

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
            visible: true,
        }

        props.setLayers((prev) => [...prev, newLayer]);
        if(props.layerEditId === null)
          props.setLayerEditId(newLayer.id);
    }

    const toggleLayerVisibility = (id) => {
      props.setLayers((prev) => prev.map((layer) => {
        if(layer.id === id)
          return { ...layer, visible: !layer.visible };
        return layer;
      }));
    }

    const [ layerSelectId, setlayerSelectId ] = useState(null);

    const renderLayer = ({item}) => (
        <TouchableOpacity 
          onLongPress={() => {
            setlayerSelectId(item.id);
            toggleModal();
          }}
          onPress={() => {
            toggleLayerVisibility(item.id);
          }}
          style={{
            flex: 1,
          }}
        > 
        <View style={[
          styles.layerContainer, 
          item.id === layerSelectId ? {backgroundColor: 'rgba(0,0,0,0.3)'} : {},
          !item.visible ? {opacity: 0.2} : {} // Apply opacity if the layer is not visible
        ]}>
        <Text style={item.id === props.layerEditId ? {fontWeight: 'bold'} : {}}>
          {item.name}
          </Text>
        </View>
        </TouchableOpacity>
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
      if(modalVisible)
        setlayerSelectId(null);
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
                    onBackButtonPress={toggleModal}
                    // keyExtractor={item => item.id.toString()}
                />
                </View>
                <Editor 
                  modalVisible={modalVisible} 
                  toggleModal={toggleModal} 
                  setLayers={props.setLayers} 
                  layers={props.layers} 
                  layerSelectId={layerSelectId}
                  setLayerEditId={props.setLayerEditId}
                />
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
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalContent: {
      width: '80%',
      padding: 20,
      borderRadius: 10,
      backgroundColor: 'blue', // Modal content background
      alignItems: 'center',
    },
    option: {
      padding: 10,
      backgroundColor: 'blue',
      borderRadius: 5,
    },
    optionText: {
      color: 'white',
    },
};