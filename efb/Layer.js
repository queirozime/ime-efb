import React, { Component, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Polyline } from 'react-native-maps';

export default function Layer(props) {
  const [polylines, setPolylines] = useState([]);
  const [markers, setMarkers] = useState([]);

  function onTouchStart(eventDetails) {
    console.log( "start" );
  }

  function onTouchMove(eventDetails) {
    console.log( "move" );
  }

  function onTouchEnd(eventDetails) {
    console.log( "end" );
  }

  useEffect(() => {
    if(props.editId === props.id){
      switch(props.action){
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
    }, [props.editId, props.refresh]);

  return (
    <View>
      {polylines.map((polyline, index) => (
        <Polyline key={index} coordinates={polyline} strokeColor="red" strokeWidth={2} />
      ))}
    </View>
  )
}