// Camera lifecycle is independent of the UI so late permission grants cannot leak a stream.
export function createCameraResource(devices){let generation=0,current=null;
 const stopTracks=s=>s?.getTracks().forEach(t=>t.stop());
 return {stop(){generation++;stopTracks(current);current=null;},async start(facing='environment'){
  this.stop();const turn=generation;if(!devices?.getUserMedia)throw Error('Camera access is unavailable in this browser. Use the HTTPS app directly in Safari or Chrome.');let stream;
  try{stream=await devices.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:720}}});}
  catch(error){if(error.name!=='OverconstrainedError'||turn!==generation)throw error;stream=await devices.getUserMedia({audio:false,video:true});}
  if(turn!==generation){stopTracks(stream);return null;}current=stream;return stream;
 }};
}
