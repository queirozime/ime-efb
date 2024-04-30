import * as DocumentPickerExpo from 'expo-document-picker';
// import DocumentPicker from 'react-native-document-picker';

import { FileSystem } from 'expo-file-system';

async function getFilePath() {
    try {
        const document = await DocumentPickerExpo.getDocumentAsync({
        });
        console.log(document.assets["uri"])
        console.log(document.assets[0].uri)

        fileUri = document.assets[0].uri
        return fileUri
      } catch (e) {
        console.log('error: ', e.message);
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


export async function downloadFolder(uriDownload,title){
  const callback = downloadProgress => {
    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
    this.setState({
      downloadProgress: progress,
    });
  };
  console.log("Enter in downlaod")
  console.log(FileSystem.documentDirectory)
  
  const downloadResumable = FileSystem.createDownloadResumable(
    uriDownload,
    FileSystem.documentDirectory + title +'/tiles/{z}/{x}/{y}.png',
    {},
    callback
  );
  try {
    console.log("Start download")
    const { uri } = await downloadResumable.downloadAsync();
    console.log('Finished downloading to ', uri);
  } catch (e) {
    console.error(e);
  }
  
  try {
    await downloadResumable.pauseAsync();
    console.log('Paused download operation, saving for future retrieval');
    AsyncStorage.setItem('pausedDownload', JSON.stringify(downloadResumable.savable()));
  } catch (e) {
    console.error(e);
  }
  
  try {
    const { uri } = await downloadResumable.resumeAsync();
    console.log('Finished downloading to ', uri);
  } catch (e) {
    console.error(e);
  }
}

export async function GetLocalFile() {
  console.log('Get file');
  fileUri = await getFilePath()
  return fileUri
}

export async function GetLocalFolder(){
  console.log('Get folder');
  folderUri = await getDirectoryPath()
  return folderUri
}