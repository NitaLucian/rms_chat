import { createContext, useContext } from "react";

import MedicStore from "./medicStore";

interface Store{
    medicStore: MedicStore,

}

export const store:Store={

    medicStore: new MedicStore(),
    
}
export const StoreContext = createContext(store);

export function useStore(){
    return useContext(StoreContext);
}