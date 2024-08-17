import * as DocumentPickerExpo from 'expo-document-picker';

import * as FileSystem from 'expo-file-system';

import * as Sharing from 'expo-sharing';

async function getFilePath() {
  const document = await DocumentPickerExpo.getDocumentAsync({
  });

  fileUri = document.assets[0].uri
  return fileUri

}

export async function saveLocation(location, timestamp) {
  try {
    console.log('Saving location:', location);
    var path = FileSystem.documentDirectory + '/flights/';
    path += timestamp + ".txt";
    console.log("writing to file:", path);
  } catch (error) {
    console.error(error);
  }
}

export async function readLocationFile() {
  try {
    // get list of entries in FileSystem.documentDirectory/flights
    const content = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + '/flights/');
    console.log(content);
  } catch (error) {
    console.error(error);
  }
}

// async function getDirectoryPath() {
//     try {
//       const result = await DocumentPicker.pickMultiple({
//         type: 'folder',
//       });
//       if (result.length > 0) {
//         const sourcePath = result[0].uri;
//         console.log('Pasta selecionada:', sourcePath);
//         return sourcePath

//       }
//     } catch (error) {
//       console.error('Erro ao selecionar a pasta:', error);
//     }
// }

async function createFolder(path) {
  try {
    await FileSystem.makeDirectoryAsync(path);
  } catch (error) {
    console.error('Falha ao criar diretório:', error);
    // terminar o codigo aqui, se o error é pq ja existe informar o usuario
  }
}

async function startDownload(downloadResumable) {
  try {
    const { uri } = await downloadResumable.downloadAsync();
    //criar um loading aqui para o cara n ficar clicando infinito
  } catch (e) {
    console.error(e);
  }
}

async function pauseDownload(downloadResumable) {
  try {
    await downloadResumable.pauseAsync();
    AsyncStorage.setItem('pausedDownload', JSON.stringify(downloadResumable.savable()));
  } catch (e) {
    console.error(e);
  }
}

async function resumeDownload(downloadResumable) {
  try {
    const { uri } = await downloadResumable.resumeAsync();
  } catch (e) {
    console.error(e);
  }
}

async function readDirectory(path) {
  try {
    const files = await FileSystem.readDirectoryAsync(path);
  } catch (error) {
    console.error(error);
  }
}

const callback = (downloadProgress) => {
  const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
  this.setState({
    downloadProgress: progress,
  });
};

export async function downloadFolder(uriDownload, title) {


  const path = FileSystem.documentDirectory
  await createFolder(path + title)
  const downloadResumable = FileSystem.createDownloadResumable(
    uriDownload,
    path + title,
    {},
    callback
  );

  await readDirectory(path)
  await startDownload(downloadResumable)
  await readDirectory(path)
  await readDirectory(path + title)

  //criar os casos de parar o download e continuar o download
  // await pauseDownload(downloadResumable)
  // await resumeDownload(downloadResumable)

}


export async function downloadKML(data, title) {
  const path = FileSystem.documentDirectory
  const fileUri = path + title
  await FileSystem.writeAsStringAsync(fileUri, data);
  return fileUri;
}

export async function shareFile(fileUri) {
  await Sharing.shareAsync(fileUri);
}

export async function getLocalFile() {
  fileUri = await getFilePath()
  const kmlContent = await FileSystem.readAsStringAsync(fileUri);
  return kmlContent
}

export async function getLocalFolder() {
  folderUri = await getDirectoryPath()
  return folderUri
}