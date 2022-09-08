import drips from '../drips';
import workstreamsStore from '../workstreams';

export default function () {
  drips.disconnect();
  workstreamsStore.disconnect();
}
