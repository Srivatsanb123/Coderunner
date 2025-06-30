// src/hooks/useResizablePanels.js
import { useState, useCallback } from 'react';

export const useResizablePanels = (initialWidth = "60%") => {
    const [editorWidth, setEditorWidth] = useState(initialWidth);

    const handleDrag = useCallback((clientX) => {
        document.body.style.userSelect = "none"; // Prevent text selection during drag
        const newWidth = `${Math.min(Math.max((clientX / window.innerWidth) * 100, 30), 70)}%`;
        setEditorWidth(newWidth);
    }, []);

    const onMouseMove = useCallback((e) => handleDrag(e.clientX), [handleDrag]);
    const onTouchMove = useCallback((e) => handleDrag(e.touches[0].clientX), [handleDrag]);

    const stopDrag = useCallback(() => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", stopDrag);
        document.body.style.userSelect = "";
    }, [onMouseMove, onTouchMove]);

    const startDrag = useCallback(() => {
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", stopDrag);
        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("touchend", stopDrag);
    }, [onMouseMove, onTouchMove, stopDrag]);

    return { editorWidth, startDrag };
};