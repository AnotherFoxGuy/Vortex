import {IDeploymentMethod} from '../types/IDeploymentMethod';

function allTypesSupported(activator: IDeploymentMethod, state: any,
                           gameId: string, types: string[]): string {
  if (activator === undefined) {
    return 'No deployment method selected';
  }
  let reason: string;
  types.find(type => {
    reason = activator.isSupported(state, gameId, type);
    return reason !== undefined;
  });
  return reason;
}

export default allTypesSupported;
