import { generateSelectors } from '../logic/cdpLogic';
import { sendDataToDialog, switchLoader } from '../logic/pageLogic';

async function eventHandler(data, checkSelectors, client, resolve): Promise<void> {
  if (data.type === 'selectorClick') {
    const selectors = generateSelectors(data.path);
    const selectorsVariants = await checkSelectors(selectors);
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
      await this.page.evaluate(switchLoader, false);
      await client.detach();
      resolve();
    }
  }
}

export default eventHandler;
