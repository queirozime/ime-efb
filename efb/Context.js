import React, { createContext, useState } from 'react';

// Create a context
export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [isDrawingCircle, setIsDrawingCircle] = useState(false);
    const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);

    return (
        <GlobalStateContext.Provider value={{ isDrawing, setIsDrawing, 
                                              isDrawingCircle, setIsDrawingCircle, 
                                              isDrawingPolygon, setIsDrawingPolygon }}>
            {children}
        </GlobalStateContext.Provider>
    );
};