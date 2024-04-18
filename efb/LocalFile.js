import * as DocumentPicker from 'expo-document-picker';


async function pickFile() {
    try {
        const document = await DocumentPicker.getDocumentAsync({
        });
        if (document.type !== 'success') {
          throw new Error('User did not select a document');
        }
        console.log(document.uri)
      } catch (e) {
        console.log('error: ', e.message);
      }
}

export default async function GetLocalFile() {
  console.log('Get local');
  fileUri = await pickFile()
  
}
