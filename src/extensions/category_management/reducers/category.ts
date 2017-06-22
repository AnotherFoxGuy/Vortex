import { IReducerSpec } from '../../../types/IExtensionContext';
import {deleteOrNop, getSafe, setOrNop, setSafe} from '../../../util/storeHelper';

import * as actions from '../actions/category';

/**
 * reducer for changes to ephemeral session state
 */
export const categoryReducer: IReducerSpec = {
  reducers: {
    [actions.loadCategories as any]: (state, payload) =>
      setOrNop(state, [payload.gameId], payload.gameCategories),
    [actions.setCategory as any]: (state, payload) =>
      setSafe(state, [payload.gameId, payload.id], payload.category),
    [actions.removeCategory as any]: (state, payload) =>
      deleteOrNop(state, [payload.gameId, payload.id]),
    [actions.updateCategories as any]: (state, payload) =>
      setSafe(state, [payload.gameId], payload.gameCategories),
    [actions.renameCategory as any]: (state, payload) =>
      setOrNop(state, [payload.gameId, payload.categoryId, 'name'], payload.name),
    [actions.setCategoryOrder as any]: (state, payload) => {
      const { gameId, categoryIds }: { gameId: string, categoryIds: string[] } = payload;
      let newState = state;
      categoryIds.forEach((id, idx) => {
        const oldOrder = getSafe(newState, [gameId, id, 'order'], undefined);
        if (oldOrder === undefined) {
          return;
        }
        if (oldOrder !== idx) {
          newState = setSafe(newState, [gameId, id, 'order'], idx);
        }
      });
      return newState;
    },
  },
  defaults: {
  },
};
