import { createContext } from "react";
import { Texture } from 'three';

export type FontContextType = {
  isLoaded: boolean,
  levels: Texture[]
}

export const fontDefault: FontContextType = {
  isLoaded: false,
  levels: []
}

export const FontContext = createContext<FontContextType>(fontDefault);