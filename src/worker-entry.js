import assets from './assets.generated.js';
import worker,{setStaticAssets} from './backend.js';
setStaticAssets(assets);
export default worker;
