import { useState, useEffect } from 'react'

export default function useDebounce(value, wait) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, wait);
        return () => {
            clearTimeout(handler);
        }
    }, [value, wait])

    return debouncedValue;
}