import type {PiniaPluginContext, StateTree} from "pinia";
import {toRaw} from "vue";

export class UndoRedoData {
  stack: Array<StateTree>;
  index: number;

  constructor(state: StateTree) {
    this.stack = [state];
    this.index = 0;
  }

  undoPossible() {
    return this.index > 0;
  }

  redoPossible() {
    return this.index < this.stack.length - 1;
  }
}

export function PiniaUndoRedo({store}: PiniaPluginContext) {
  const cloneStoreState = () => {
    const clone = structuredClone(toRaw(store.$state));
    delete clone.undoRedoData;
    return clone;
  };
  store.undoRedoData = new UndoRedoData(cloneStoreState());
  let preventUpdateOnSubscribe = false;
  store.undo = () => {
    if (store.undoRedoData.undoPossible()) {
      preventUpdateOnSubscribe = true;
      store.undoRedoData.index--;
      console.log("undo", store.undoRedoData);
      store.$patch(store.undoRedoData.stack[store.undoRedoData.index]);
    }
  };
  store.redo = () => {
    if (store.undoRedoData.redoPossible()) {
      preventUpdateOnSubscribe = true;
      store.undoRedoData.index++;
      console.log("redo", store.undoRedoData);
      store.$patch(store.undoRedoData.stack[store.undoRedoData.index]);
    }
  };
  store.clearUndoRedo = () => {
    preventUpdateOnSubscribe = true;
    store.undoRedoData.stack = [cloneStoreState()];
    store.undoRedoData.index = 0;
    console.log("clearUndoRedo", store.undoRedoData);
  };
  store.$subscribe(
    () => {
      if (preventUpdateOnSubscribe) {
        preventUpdateOnSubscribe = false;
        return;
      }
      store.undoRedoData.stack = [
        ...store.undoRedoData.stack.splice(0, store.undoRedoData.index + 1),
        cloneStoreState(),
      ];
      store.undoRedoData.index = store.undoRedoData.stack.length - 1;
      console.log("change", toRaw(store.undoRedoData.index), toRaw(store.undoRedoData.stack));
    },
    {
      flush: "sync",
    },
  );
}

declare module "pinia" {
  // noinspection JSUnusedGlobalSymbols
  export interface PiniaCustomProperties {
    undo: () => void;
    redo: () => void;
    undoPossible: () => boolean;
    redoPossible: () => boolean;
    clearUndoRedo: () => void;
    undoRedoData: UndoRedoData;
  }
}
