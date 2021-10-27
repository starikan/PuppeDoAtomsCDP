export const onPageSwitchLoader = (flag = true): void => {
  const loader = document.getElementById('ppd-wait-data-process-wraper');
  loader.style.setProperty('display', flag ? 'grid' : 'none');
};

export const onPageAddLoader = ({ loaderId, loaderHtml }): void => {
  const body = document.getElementsByTagName('body');
  const waiter = document.createElement('div');
  waiter.setAttribute('id', loaderId);
  waiter.innerHTML = loaderHtml;
  body[0].appendChild(waiter);
};
