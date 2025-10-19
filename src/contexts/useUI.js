import { useContext } from "react";
import { UIContext } from "./UIContextDefinition";

export const useUI = () => useContext(UIContext);