const fs = require('fs');
const path = require('path');

const dialogId = 'dialog-ppd';

const dialogCss = fs.readFileSync(path.resolve(path.join('.', 'dist', 'cdpGetSelector.css'))).toString();

const { dialogBox } = require('./dialog/main');
const { runDialog, jsEvalOnClick, switchLoader, dialogDrawer, addDialogHTML } = require('./logic/pageLogic');
const ppdEventHandler = require('./customEvents').default;

async function cdpGetSelector() {
  // await this.browser.on('disconnected', async (data) => {
  //   debugger;
  // });

  const messageAdded = async ({ event, client, resolve }) => {
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
      debugger;
    }
  };

  this.run = () => {
    return new Promise(async (resolve, reject) => {
      // const yamlFile = 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js';
      // const lodashFile = 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.core.min.js';
      // https://github.com/johannhof/xpath-dom
      const xpathFile = 'https://cdn.rawgit.com/johannhof/xpath-dom/master/dist/xpath-dom.min.js';

      try {
        // await this.page.addScriptTag({ url: yamlFile });
        // await this.page.addScriptTag({ url: lodashFile });
        await this.page.addScriptTag({ url: xpathFile });
        await this.page.addStyleTag({ content: dialogCss });
        await this.page.evaluate(jsEvalOnClick);
        await this.page.evaluate(dialogBox);
        await this.page.evaluate(dialogDrawer, dialogId);
        await this.page.evaluate(addDialogHTML, dialogId);
        await this.page.evaluate(runDialog, dialogId);

        const engine = this.getEngine();

        let client;
        if (engine === 'playwright') {
          client = await this.page.context().newCDPSession(this.page);
        } else if (engine === 'puppeteer') {
          client = await this.page.target().createCDPSession();
        }

        // const targets = await client.send('Target.getTargets');

        // await client.send('Console.enable');
        // client.on('Console.messageAdded', messageAdded);
        await client.send('Runtime.enable');
        client.on('Runtime.consoleAPICalled', async (event) => await messageAdded({ event, client, resolve }));
        client.on('Runtime.executionContextsCleared', async (e) => {
          debugger;
        });

        await client.send('DOM.enable');
        client.on('DOM.documentUpdated', this.run);
      } catch (err) {
        debugger;
        reject();
      }
    });
  };

  await this.run();
}

module.exports = { cdpGetSelector };
