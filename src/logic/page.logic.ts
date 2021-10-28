type myWindow = Window &
  typeof globalThis & { ppdClickHandler: any; ppdElementClicked: any; ppdPreviousBorder: any; xpath: any };

export const onPageJsEvalOnClick = (): void => {
  (window as myWindow).ppdClickHandler = (event): boolean => {
    if (!event.ctrlKey) {
      return false;
    }
    event.stopPropagation();
    event.preventDefault();

    if ((window as myWindow).ppdElementClicked) {
      (window as myWindow).ppdElementClicked.style.border = (window as myWindow).ppdPreviousBorder;
    }

    (window as myWindow).ppdElementClicked = event.target;
    (window as myWindow).ppdElementClicked.style.setProperty('border', (window as myWindow).ppdPreviousBorder);

    const exportData: any = {
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

      const path: any = {
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
        for (const attr of p.attributes) {
          path.attributes[attr.name] = attr.value;
        }
      }

      path.classList = p.classList && p.classList.length ? [...p.classList] : [];

      exportData.path.push(path);
    });

    const { target } = event;
    exportData.xpath = [(window as myWindow).xpath.getXPath(target), (window as myWindow).xpath.getUniqueXPath(target)];
    exportData.type = 'selectorClick';

    // console.log(exportData);
    console.log(JSON.stringify(exportData));

    target.style.setProperty('border', '2px solid red');
    return true;
  };

  (window as myWindow).ppdPreviousBorder = null;
  (window as myWindow).ppdElementClicked = null;

  (window as myWindow).removeEventListener('click', (window as myWindow).ppdClickHandler);
  (window as myWindow).addEventListener('click', (window as myWindow).ppdClickHandler, true);
};
