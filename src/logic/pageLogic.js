const jsEvalOnClick = () => {
  let ppdPreviousBorder = null;
  let ppdElementClicked = null;

  window.ppdClickHandler = function (event) {
    if (!event.ctrlKey) {
      return true;
    }
    event.stopPropagation();
    event.preventDefault();

    if (ppdElementClicked) {
      ppdElementClicked.style.border = ppdPreviousBorder;
    }

    ppdElementClicked = event.target;
    ppdElementClicked.style.setProperty('border', ppdPreviousBorder);

    const exportData = {
      x: event.x,
      y: event.y,
      button: event.button,
      clientX: event.clientX,
      clientY: event.clientY,
      ctrlKey: event.ctrlKey,
      layerX: event.layerX,
      layerY: event.layerY,
      metaKey: event.metaKey,
      movementX: event.movementX,
      movementY: event.movementY,
      offsetX: event.offsetX,
      offsetY: event.offsetY,
      pageX: event.pageX,
      pageY: event.pageY,
      screenX: event.screenX,
      screenY: event.screenY,
      shiftKey: event.shiftKey,
    };

    exportData.path = [];
    event.path.forEach((p, i) => {
      if (i > 3) return;

      const path = {
        baseURI: p.baseURI,
        childElementCount: p.childElementCount,
        className: p.className,
        clientHeight: p.clientHeight,
        clientLeft: p.clientLeft,
        clientTop: p.clientTop,
        clientWidth: p.clientWidth,
        draggable: p.draggable,
        hidden: p.hidden,
        id: p.id,
        localName: p.localName,
        nodeName: p.nodeName,
        nodeType: p.nodeType,
        nodeValue: p.nodeValue,
        offsetHeight: p.offsetHeight,
        offsetLeft: p.offsetLeft,
        offsetTop: p.offsetTop,
        offsetWidth: p.offsetWidth,
        scrollHeight: p.scrollHeight,
        scrollLeft: p.scrollLeft,
        scrollTop: p.scrollTop,
        scrollWidth: p.scrollWidth,
        tabIndex: p.tabIndex,
        tagName: p.tagName,
        textContent: p.textContent,
        title: p.title,
      };

      if (i === 0) {
        path.innerHTML = p.innerHTML;
        path.innerText = p.innerText;
        path.outerHTML = p.outerHTML;
        path.outerText = p.outerText;
        path.text = p.text;
      }

      path.attributes = {};
      if (p.attributes && p.attributes.length) {
        for (let attr of p.attributes) {
          path.attributes[attr.name] = attr.value;
        }
      }

      path.classList = p.classList && p.classList.length ? [...p.classList] : [];

      exportData.path.push(path);
    });

    const target = event.target;
    exportData.xpath = [xpath.getXPath(target), xpath.getUniqueXPath(target)];
    exportData.type = 'selectorClick';

    // console.log(exportData);
    console.log(JSON.stringify(exportData, { skipInvalid: true }));

    target.style.setProperty('border', '2px solid red');
  };
  window.removeEventListener('click', window.ppdClickHandler);
  window.addEventListener('click', window.ppdClickHandler, true);
};

const runDialog = (dialogId) => {
  const callbackFunction = (data) => {
    console.log(JSON.stringify({ button: data, type: 'servise' }));
  };
  const dialog = ppdDialogBox(dialogId, callbackFunction);
  dialog.showDialog();
};

const sendDataToDialog = (data) => {
  window.dialogDrawer(data);
};

const switchLoader = (flag = true) => {
  const loader = document.getElementById('ppd-wait-data-process-wraper');
  loader.style.setProperty('display', flag ? 'grid' : 'none');
};

const dialogDrawer = (dialogId) => {
  window.dialogDrawer = (data) => {
    const content = document.querySelector(`#${dialogId} .content`);
    content.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
  };
};

const addDialogHTML = ({ dialogId, dialogHtml }) => {
  const body = document.getElementsByTagName('body');
  const div = document.createElement('div');
  div.setAttribute('id', dialogId);
  div.setAttribute('class', 'dialog');
  div.innerHTML = dialogHtml;
  body[0].appendChild(div);
};

const addLoader = ({ loaderId, loaderHtml }) => {
  const body = document.getElementsByTagName('body');
  const waiter = document.createElement('div');
  waiter.setAttribute('id', loaderId);
  waiter.innerHTML = loaderHtml;
  body[0].appendChild(waiter);
};

module.exports = { runDialog, jsEvalOnClick, sendDataToDialog, switchLoader, dialogDrawer, addDialogHTML, addLoader };
