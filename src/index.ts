/* eslint-disable no-return-await */
/* eslint-disable no-async-promise-executor */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import path from 'path';

import { ppdDialogBox } from './dialog/dialog';
import { runDialog, jsEvalOnClick, switchLoader, dialogDrawer, addDialogHTML, addLoader } from './logic/pageLogic';
import ppdEventHandler from './customEvents';

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
      await this.page.evaluate(switchLoader, true);

      const ppdEvent = ppdEventHandler.bind(this);
      await ppdEvent(data, client, resolve);

      await this.page.evaluate(switchLoader, false);
    } catch (err) {
      // debugger;
    }
  };

  this.run = (): Promise<void> =>
    new Promise(async (resolve, reject) => {
      try {
        await this.page.addScriptTag({ url: xpathFile });
        await this.page.addStyleTag({ content: dialogCss });

        await this.page.evaluate(jsEvalOnClick);
        await this.page.evaluate(ppdDialogBox);
        await this.page.evaluate(dialogDrawer, dialogId);
        await this.page.evaluate(addDialogHTML, { dialogId, dialogHtml });
        await this.page.evaluate(addLoader, { loaderId, loaderHtml });
        await this.page.evaluate(runDialog, dialogId);

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
