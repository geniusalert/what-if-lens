import {XRDevice,metaQuest3} from 'iwer';
import {DevUI} from '@iwer/devui';
const device=new XRDevice(metaQuest3);device.installRuntime();device.primaryInputMode='hand';const emulatorUI=new DevUI(device);document.body.append(emulatorUI.devUIContainer);export {device,emulatorUI};
