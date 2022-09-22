//!*script
/**
 * English/Japanese cross-translation via GAS
 *
 * @arg {string} 0 Target strings. "cursor" | "edit" | "select"
 * @return {string} Translate strings
 * NOTE:On oneline-editor, press Enter-key to copy text to clipboard.
 */

var GAS =
  'https://script.google.com/macros/s/AKfycbxyhNr2JunKRnGwXhZLUpOTssHPgKsYSKrUuBTreK5z7K4rqmeKwymcaFYImvmzr7UGXA/exec?word=';

var ppx_id = PPx.Extract('%n').substring(0, 1) || 'C';

var encode_strings = (function (arg) {
  var target = arg.length ? arg.Item(0) : 'cursor';
  var cmd = {
    cursor: '%*cursortext()',
    edit: '%*edittext()',
    select: '%*selecttext()'
  }[target];

  if (typeof cmd === 'undefined') {
    PPx.Execute('*script "%*getcust(S_ppm#global:lib)\\errors.js",arg,' + PPx.ScriptName);
    PPx.Quit(1);
  }

  var targetStrings = PPx.Extract(cmd);

  if (/^\s*$/.test(targetStrings)) {
    PPx.SetPopLineMessage('!"Translation abort. Empty string.');
    PPx.Quit(1);
  }

  return encodeURI(targetStrings).replace(/(%25|%E3%80%80)/g, function (match) {
    return {
      '%25': '%25%25',
      '%E3%80%80': '+'
    }[match];
  });
})(PPx.Arguments);

PPx.Execute(
  '%Obd curl -sL %(' +
    GAS +
    encode_strings +
    '%) |%0pptrayw -c *execute ' +
    ppx_id +
    ',*string p,result=%(%*stdin(-utf8)%)%&'
);

PPx.result = PPx.getProcessValue('result').replace(/{"result":"(.*)"}/, '$1');

PPx.SetProcessValue('result', '');
