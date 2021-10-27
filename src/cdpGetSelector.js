const fs = require('fs');
const path = require('path');

const dialogId = 'dialog-ppd';

const dialogCss = fs.readFileSync(path.resolve(path.join('.', 'dist', 'cdpGetSelector.css'))).toString();

const { dialogBox } = require('./dialog/main');
const { runDialog, jsEvalOnClick, switchLoader } = require('./logic/pageLogic');
const { checkSelectorsInDom } = require('./logic/cdpLogic');
const ppdEventHandler = require('./customEvents').default;

async function cdpGetSelector() {
  const addDialogHTML = (dialogId) => {
    const body = document.getElementsByTagName('body');
    const div = document.createElement('div');
    div.setAttribute('id', dialogId);
    div.setAttribute('class', 'dialog');
    div.innerHTML = `
    <div class="titlebar">PPD Creator</div>
    <button name="collapse"></button>
    <button name="fullscreen"></button>
      <div id="content" class="content"></div>
      <div class="buttonpane">
        <div class="buttonset">
          <button name="ok">OK</button>
          <button name="cancel">Cancel</button>
        </div>
      </div>
    `;
    body[0].appendChild(div);
    const waiter = document.createElement('div');
    waiter.setAttribute('id', 'ppd-wait-data-process-wraper');
    waiter.innerHTML = `
      <div id="ppd-wait-data-process">
        <?xml version="1.0" encoding="utf-8"?>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: rgb(241, 242, 243); display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <g transform="rotate(0 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.9166666666666666s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(30 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.8333333333333334s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(60 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.75s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(90 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.6666666666666666s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(120 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5833333333333334s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(150 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(180 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.4166666666666667s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(210 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.3333333333333333s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(240 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.25s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(270 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.16666666666666666s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(300 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.08333333333333333s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(330 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animate>
          </rect>
        </g>
        </svg>
      </div>
    `;
    body[0].appendChild(waiter);
  };

  const checkSelectors = async (selectors) => {
    let counts = await this.page.evaluate(checkSelectorsInDom, selectors);
    counts = counts
      .filter((v) => v[1] === 1)
      .map((v) => v[0])
      .sort(
        (a, b) =>
          a.split('').filter((v) => ['.', '>'].includes(v)).length -
          b.split('').filter((v) => ['.', '>'].includes(v)).length,
      );
    return counts;
  };

  const dialogDrawer = (dialogId) => {
    window.dialogDrawer = (data) => {
      const content = document.querySelector(`#${dialogId} .content`);
      content.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    };
  };

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
      await ppdEvent(data, checkSelectors, client, resolve);

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
