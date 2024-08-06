/* @file English/Japanese cross-translation via GAS
 * @arg 0 {string} - Target sentence. "cursor" | "edit" | "select"
 * @return - Translated sentence
 */

import {validArgs} from '@ppmdev/modules/argument.ts';
import {useLanguage} from '@ppmdev/modules/data.ts';
import {runStdout} from '@ppmdev/modules/run.ts';
import {langTranslation} from './mod/language.ts';
import debug from '@ppmdev/modules/debug.ts';

const GAS_TOKEN = 'AKfycbxyhNr2JunKRnGwXhZLUpOTssHPgKsYSKrUuBTreK5z7K4rqmeKwymcaFYImvmzr7UGXA';
const URL = 'https://script.google.com/macros/s';
const lang = langTranslation[useLanguage()];

const main = (): string => {
  const [arg] = validArgs();
  const sentence = PPx.Extract(getMacro(arg));

  if (/^\s*$/.test(sentence)) {
    PPx.linemessage(`!"[WARN] ${lang.emptyTerm}`);
    PPx.Quit(1);
  }

  const searchTerm = convertURI(sentence);
  const [errorlevel, data] = runStdout({cmdline: `curl -sL ${URL}/${GAS_TOKEN}/exec?word=${searchTerm}`, hide: true});

  if (errorlevel > 0) {
    PPx.linemessage(`!"[ERROR] ${lang.curlError}`);
    PPx.Quit(1);
  }

  return data.replace(/{"result":"(.*)"}/, '$1');
};

const getMacro = (target?: string): string => {
  if (target === 'edit') {
    return '%*edittext()';
  } else if (target === 'select') {
    return '%*selecttext()';
  }

  return '%*cursortext()';
};

const convertURI = (v: string): string => {
  const rgx = /(%25|%E3%80%80)/g;
  const conv = {'%25': '%25%25', '%E3%80%80': '+'};

  return encodeURI(v).replace(rgx, (m) => conv[m as keyof typeof conv]);
};

PPx.result = main();
