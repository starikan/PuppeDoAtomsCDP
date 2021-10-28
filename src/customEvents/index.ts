import { generateSelectors, checkSelectors } from '../logic/cdp.logic';
import { sendDataToDialog } from '../dialog/dialog.logic';
import { onPageSwitchLoader } from '../loader/loader.logic';

async function eventHandler(data, client, resolve): Promise<void> {
  if (data.type === 'selectorClick') {
    const selectors = generateSelectors(data.path);
    const selectorsVariants = await checkSelectors(selectors, this.page);
    // const { x, y } = data;
    // const { nodeId } = await client.send('DOM.getNodeForLocation', { x, y });
    // const nodeIdDescribe = await client.send('DOM.describeNode', { nodeId });

    // const sendData = {
    // data: selectorsVariants,
    // type: 'atom',
    // name: 'cdpGetSelector',
    // envsId: this.envsId,
    // stepId: this.stepId,
    // };
    // this.socket.sendYAML(sendData);
    await this.page.evaluate(sendDataToDialog, { selectorsVariants });

    console.log(selectorsVariants);
  }
  if (data.type === 'servise') {
    if (data.button === 'ok') {
      await this.page.evaluate(onPageSwitchLoader, false);
      await client.detach();
      resolve();
    }
  }
}

export default eventHandler;
