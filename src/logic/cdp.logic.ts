const getCombinations = (charsInput: string[], divider = '.'): string[] => {
  const result = [];
  const f = (prefix: string, chars: string[]): void => {
    for (let i = 0; i < chars.length; i += 1) {
      result.push(prefix + divider + chars[i]);
      f(prefix + divider + chars[i], chars.slice(i + 1));
    }
  };
  f('', charsInput);
  return result;
};

const checkSelectorsInDom = (selectors: string[] = []): Array<[string, number]> => {
  const selectorsStat = selectors.map((v) => [v, document.querySelectorAll(v).length] as [string, number]);
  return selectorsStat;
};

export const generateSelectors = (elements: HTMLElement[]): string[] => {
  const preparedElements = elements
    .filter((v) => !v.hidden)
    .filter((v) => v.tagName && !['HTML', 'BODY'].includes(v.tagName))
    .map((v) => ({
      classList: Array.from(v.classList),
      attributes: v.attributes,
      id: v.id,
      tagName: v.tagName.toLowerCase(),
      textContent: v.textContent,
    }));
  // .map((v: Partial<HTMLElement>) => {
  //   v.tagName = v.tagName.toLowerCase();
  //   return v;
  // })
  // .map((v: Partial<HTMLElement>) => {
  //   delete v.attributes?.class;
  //   return v;
  // });

  const parts = preparedElements.map((v) => {
    const set = [
      ...(v.id ? [`#${v.id}`] : []),
      ...getCombinations(v.classList)
        .map((c) => `${c}`)
        .sort((a, b) => a.length - b.length),
      // ...getCombinations(v.classList)
      //   .map(c => `${v.tagName}${c}`)
      //   .sort((a, b) => a.length - b.length),
      ...getCombinations(
        Object.entries(v.attributes).map((attr) => `[${attr[0]}='${attr[1]}']`),
        '',
      ),
      // ...getCombinations(
      //   Object.entries(v.attributes).map(attr => `[${attr[0]}='${attr[1]}']`),
      //   '',
      // ).map(c => `${v.tagName}${c}`),
      ...[v.tagName],
    ];

    return set;
  });

  let selectors = [...parts[0]];
  let combines = [...parts[0]];
  for (let i = 1; i < parts.length; i += 1) {
    // eslint-disable-next-line no-loop-func
    combines = parts[i].reduce((s, b) => {
      const summary = [...s, ...combines.map((a) => `${b} > ${a}`)];
      return summary;
    }, []);
    selectors = [...selectors, ...combines];
  }

  return selectors;
};

export const checkSelectors = async (selectors, page): Promise<number> => {
  let counts = await page.evaluate(checkSelectorsInDom, selectors);
  const sortHelper = (v: string): number => v.split('').filter((char) => ['.', '>'].includes(char)).length;
  counts = counts
    .filter((v) => v[1] === 1)
    .map((v) => v[0])
    .sort((a, b) => sortHelper(a) - sortHelper(b));
  return counts;
};
