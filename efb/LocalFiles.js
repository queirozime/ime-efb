import * as DocumentPickerExpo from 'expo-document-picker';
// import DocumentPicker from 'react-native-document-picker';

import  * as FileSystem from 'expo-file-system';

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

async function createFolder(path){
  try {
    await FileSystem.makeDirectoryAsync(path);
    console.log('Diretório criado:', path);
  } catch (error) {
    console.error('Falha ao criar diretório:', error);
    // terminar o codigo aqui, se o error é pq ja existe informar o usuario
  }
}

async function startDownaload(downloadResumable){
  try {
    console.log("Start download")
    const { uri } = await downloadResumable.downloadAsync();
    console.log('Finished downloading to ', uri);
    //criar um loading aqui para o cara n ficar clicando infinito
  } catch (e) {
    console.error(e);
  }
}

async function pauseDownload(downloadResumable){
  try {
    await downloadResumable.pauseAsync();
    console.log('Paused download operation, saving for future retrieval');
    AsyncStorage.setItem('pausedDownload', JSON.stringify(downloadResumable.savable()));
  } catch (e) {
    console.error(e);
  }
}

async function resumeDownload(downloadResumable){
  try {
    const { uri } = await downloadResumable.resumeAsync();
    console.log('Finished downloading to ', uri);
  } catch (e) {
    console.error(e);
  }
}

async function readDirectory(path){
  try {
    const files = await FileSystem.readDirectoryAsync(path);
    console.log(files);
  } catch (error) {
    console.error(error);
  }
}

const callback = (downloadProgress) => {
  const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
  console.log(progress)
  this.setState({
    downloadProgress: progress,
  });
};

export async function downloadFolder(uriDownload,title){


  const path =FileSystem.documentDirectory 
  await createFolder(path+title)
  console.log(path+title)
  const downloadResumable = FileSystem.createDownloadResumable(
    uriDownload,
    path + title,
    {},
    callback
  );
  
  await readDirectory(path)
  await startDownaload(downloadResumable)
  console.log("Criou o diretorio?")
  await readDirectory(path)
  console.log("Tem arquivos nele?")
  await readDirectory(path+title)

  //criar os casos de parar o download e continuar o download
  // await pauseDownload(downloadResumable)
  // await resumeDownload(downloadResumable)
  
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