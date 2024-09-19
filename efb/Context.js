import React, { createContext, useState } from 'react';

// Create a context
export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const [isDrawing, setIsDrawing] = useState(false);

    return (
        <GlobalStateContext.Provider value={{ isDrawing, setIsDrawing }}>
            {children}
        </GlobalStateContext.Provider>
    );
};