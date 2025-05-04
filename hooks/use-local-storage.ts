"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Use a ref to prevent the effect from running on every render
  const initialRender = useRef(true)
  
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return initialValue
    }
  })
  
  // Memoize the setValue function to prevent it from changing on every render
  const setValue = useCallback((value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }, [key, storedValue])
  
  // Effect only runs when storedValue changes and it's not the initial render
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    try {
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(storedValue))
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }, [key, storedValue])
  
  return [storedValue, setValue]
}
