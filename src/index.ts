/* eslint-disable no-return-await */
/* eslint-disable no-async-promise-executor */
/* eslint-disable implicit-arrow-linebreak */
import fs from 'fs';
import path from 'path';

import { ppdDialogBox } from './dialog/dialog';
import { onPageJsEvalOnClick } from './logic/page.logic';
import ppdEventHandler from './customEvents';
import { onPageSwitchLoader, onPageAddLoader } from './loader/loader.logic';
import { onPageAddDialogHTML, onPageRunDialog, onPageDialogDrawer } from './dialog/dialog.logic';

import './index.scss';

const loadingRoot = path.resolve(path.join('.', 'dist'));

const loaderId = 'ppd-wait-data-process-wraper';
const loaderHtml = fs.readFileSync(path.join(loadingRoot, 'loader.html')).toString();

const dialogId = 'dialog-ppd';
const dialogHtml = fs.readFileSync(path.join(loadingRoot, 'dialog.html')).toString();
const dialogCss = fs.readFileSync(path.join(loadingRoot, 'cdpGetSelector.css')).toString();

// https://github.com/johannhof/xpath-dom
const xpathFile = 'https://cdn.rawgit.com/johannhof/xpath-dom/master/dist/xpath-dom.min.js';

export async function cdpGetSelector(): Promise<void> {
  // await this.browser.on('disconnected', async (data) => {
  //   debugger;
  // });

  const messageAdded = async ({ event, client, resolve }): Promise<void> => {
    if (!event.args.length) {
      return;
    }
    try {
      const textLog = event.args[0].value;
      const data = JSON.parse(textLog);
      await this.page.evaluate(onPageSwitchLoader, true);

      const ppdEvent = ppdEventHandler.bind(this);
      await ppdEvent(data, client, resolve);

      await this.page.evaluate(onPageSwitchLoader, false);
    } catch (err) {
      // debugger;
    }
  };

  this.run = (): Promise<void> =>
    new Promise(async (resolve, reject) => {
      try {
        await this.page.addScriptTag({ url: xpathFile });
        await this.page.addStyleTag({ content: dialogCss });

        await this.page.evaluate(onPageJsEvalOnClick);
        await this.page.evaluate(ppdDialogBox);
        await this.page.evaluate(onPageDialogDrawer, dialogId);
        await this.page.evaluate(onPageAddDialogHTML, { dialogId, dialogHtml });
        await this.page.evaluate(onPageAddLoader, { loaderId, loaderHtml });
        await this.page.evaluate(onPageRunDialog, dialogId);

        const engine = this.getEngine();

        let client;
        if (engine === 'playwright') {
          client = await this.page.context().newCDPSession(this.page);
        } else if (engine === 'puppeteer') {
          client = await this.page.target().createCDPSession();
        }

        await client.send('Runtime.enable');
        client.on('Runtime.consoleAPICalled', async (event) => await messageAdded({ event, client, resolve }));

        await client.send('DOM.enable');
        client.on('DOM.documentUpdated', this.run);

        // const targets = await client.send('Target.getTargets');
        // client.on('Runtime.executionContextsCleared', async (e) => {
        //   debugger;
        // });
      } catch (err) {
        // debugger;
        reject();
      }
    });

  await this.run();
}
