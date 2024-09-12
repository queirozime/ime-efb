import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Modal } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import * as FileSystem from 'expo-file-system';

import { styles } from './styles';

export default function RecordManager(props) {
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
                    >
                        <View style={styles.modalContent}>
                            <Text style={{ fontSize: 20 }}>Você possui uma gravação salva, deseja deletar a gravação existente?</Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.modalTouchable}
                                    onPress={() => {
                                        props.setModalVisible(false);
                                    }}
                                >
                                    <Text>Não</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalTouchable}
                                    onPress={async () => {
                                        await FileSystem.deleteAsync(FileSystem.documentDirectory + "recordedPath.json");
                                        props.setHasSavedFile(false);
                                        props.setModalVisible(false);
                                        console.log(await FileSystem.readDirectoryAsync(FileSystem.documentDirectory));
                                    }}
                                >
                                    <Text>Sim</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};
