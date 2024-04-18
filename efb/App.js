import { StyleSheet, Text, View, Button } from 'react-native';
import Map from './Map';
        
export default function App() {
  return(
    <Map />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});