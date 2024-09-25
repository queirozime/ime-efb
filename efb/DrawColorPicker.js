import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import ColorPicker, { Panel3, Swatches, Preview, OpacitySlider, HueSlider, BrightnessSlider } from 'reanimated-color-picker';
import { styles } from './styles';

export default function DrawColorPicker(props) {
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
        style={{flex: 1}}
        activeOpacity={1}
        onPress={toggleModal}
      >
      <View style={styles.modalContainer}>
          <TouchableWithoutFeedback
            style={styles.option}
          >
            <View style={[styles.modalContent, {backgroundColor: 'transparent', width: '50%'}]}>
            <ColorPicker style={{ width: '100%' }} value={props.currentColor} onComplete={props.onSelectColor}>
              <Preview hideInitialColor={true}/>
              <Panel3 />
              <BrightnessSlider />
            </ColorPicker>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
