import React, { Component, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Polyline } from 'react-native-maps';
import { Polygon } from 'react-native-maps';
import { Marker } from 'react-native-maps';

const polygon = [
  { latitude: -22.966500, longitude: -43.16773115 },
  { latitude: -22.966600, longitude: -43.16773115 },
  { latitude: -22.966600, longitude: -43.16763115 },
  { latitude: -22.966500, longitude: -43.16763115 },
];

const tmp = [{ "latitude": -22.97555554871973, "longitude": -43.17478883081127 }, { "latitude": -22.974340970581675, "longitude": -43.175624339211055 }, { "latitude": -22.973450271774134, "longitude": -43.17637190062957 }, { "latitude": -22.97207372823489, "longitude": -43.177515227489586 }, { "latitude": -22.970494733850302, "longitude": -43.17857060736835 }, { "latitude": -22.96879425773164, "longitude": -43.17936214227749 }, { "latitude": -22.967053272543815, "longitude": -43.18002175470178 }, { "latitude": -22.965514707669403, "longitude": -43.18072534262966 }, { "latitude": -22.964542973854932, "longitude": -43.18116508357486 }, { "latitude": -22.964300039310093, "longitude": -43.181209057065495 }, { "latitude": -22.964219060413683, "longitude": -43.18116508357486 }, { "latitude": -22.964057104328816, "longitude": -43.181033161090006 }, { "latitude": -22.963976125286916, "longitude": -43.18098918759937 }, { "latitude": -22.963895148049954, "longitude": -43.18098918759937 }];
export default function Layer(props) {
  const [polylines, setPolylines] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [polyline, setPolyline] = useState([]);

  const savePolyline = () => {
    if (polyline.length > 1)
      setPolylines([...polylines, polyline]);
    setPolyline([]);
  }

  function onTouchStart(eventDetails) {
  }

  function onTouchMove(eventDetails) {
    setPolyline([...polyline, eventDetails]);
  }

  function onTouchEnd(eventDetails) {
    savePolyline();
  }

  useEffect(() => {
    if (props.layerEditId === props.id && props.isDrawing) {
      switch (props.action) {
        case "none":
          break;
        case "start":
          onTouchStart(props.eventCoord);
          break;
        case "move":
          onTouchMove(props.eventCoord);
          break;
        case "end":
          onTouchEnd(props.eventCoord);
          break;
      }
    }
  }, [props.layerEditId, props.refresh, props.action]);

  return (
    <View>
      <Polyline coordinates={tmp} strokeColor="red" strokeWidth={5} />
      {polylines.map((polyline, index) => (
        <Polyline key={index} coordinates={polyline} strokeColor="blue" strokeWidth={2} />
      ))}
    </View>
  )
}