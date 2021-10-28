type myWindow = Window & typeof globalThis & { ppdDialogBox: any; dialogDrawer: any };

export const onPageAddDialogHTML = ({ dialogId, dialogHtml }): void => {
  const body = document.getElementsByTagName('body');
  const div = document.createElement('div');
  div.setAttribute('id', dialogId);
  div.setAttribute('class', 'dialog');
  div.innerHTML = dialogHtml;
  body[0].appendChild(div);
};

export const onPageRunDialog = (dialogId): void => {
  const callbackFunction = (data): void => {
    console.log(JSON.stringify({ button: data, type: 'servise' }));
  };
  if ((window as myWindow).ppdDialogBox) {
    const dialog = (window as myWindow).ppdDialogBox(dialogId, callbackFunction);
    dialog.showDialog();
  }
};

export const sendDataToDialog = (data): void => {
  (window as myWindow).dialogDrawer(data);
};

export const onPageDialogDrawer = (dialogId): void => {
  (window as myWindow).dialogDrawer = (data): void => {
    const content = document.querySelector(`#${dialogId} .content`);
    content.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  };
};
