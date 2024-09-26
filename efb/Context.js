import React, { createContext, useState } from 'react';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [isDrawingCircle, setIsDrawingCircle] = useState(false);
    const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [mapLayerValue, setMapLayerValue] = useState('ctm250');
    const [geoJson, setGeoJson] = useState({
        "type": "FeatureCollection",
        "features": [],
    })

    return (
        <GlobalStateContext.Provider
            value={{
                isDrawing, setIsDrawing,
                isDrawingCircle, setIsDrawingCircle,
                isDrawingPolygon, setIsDrawingPolygon,
                isErasing, setIsErasing,
                mapLayerValue, setMapLayerValue,
                geoJson, setGeoJson,
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    );
};