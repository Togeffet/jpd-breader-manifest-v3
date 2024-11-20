import { JpdbWordData } from './content/word.js';
import { Config } from './types.js';

export const PARTS_OF_SPEECH: { [k: string]: string } = {
  n: 'Noun', // JMDict: "noun (common) (futsuumeishi)"
  pn: 'Pronoun', // JMDict: "pronoun"
  pref: 'Prefix', // JMDict: "prefix"
  suf: 'Suffix', // JMDict: "suffix"
  // 'n-adv': '', // Not used in jpdb: n + adv instead. JMDict: "adverbial noun (fukushitekimeishi)"
  // 'n-pr': '', // Not used in jpdb: name instead. JMDict: "proper noun"
  // 'n-pref': '', // Not used in jpdb: n + pref instead. JMDict: "noun, used as a prefix"
  // 'n-suf': '', // Not used in jpdb: n + suf instead. JMDict: "noun, used as a suffix"
  // 'n-t': '', // Not used in jpdb: n instead. JMDict: "noun (temporal) (jisoumeishi)"

  // 'n-pr': '', // JMDict: "proper noun"
  name: 'Name', // Not from JMDict
  'name-fem': 'Name (Feminine)', // Not from JMDict
  'name-male': 'Name (Masculine)', // Not from JMDict
  'name-surname': 'Surname', // Not from JMDict
  'name-person': 'Personal Name', // Not from JMDict
  'name-place': 'Place Name', // Not from JMDict
  'name-company': 'Company Name', // Not from JMDict
  'name-product': 'Product Name', // Not from JMDict

  'adj-i': 'Adjective', // JMDict: "adjective (keiyoushi)"
  'adj-na': 'な-Adjective', // JMDict: "adjectival nouns or quasi-adjectives (keiyodoshi)"
  'adj-no': 'の-Adjective', // JMDict: "nouns which may take the genitive case particle 'no'"
  'adj-pn': 'Adjectival', // JMDict: "pre-noun adjectival (rentaishi)"
  'adj-nari': 'なり-Adjective (Archaic/Formal)', // JMDict: "archaic/formal form of na-adjective"
  'adj-ku': 'く-Adjective (Archaic)', // JMDict: "'ku' adjective (archaic)"
  'adj-shiku': 'しく-Adjective (Archaic)', // JMDict: "'shiku' adjective (archaic)"
  // 'adj-ix': 'Adjective (いい/よい irregular)', // Not used in jpdb, adj-i instead. JMDict: "adjective (keiyoushi) - yoi/ii class"
  // 'adj-f': '', // Not used in jpdb. JMDict: "noun or verb acting prenominally"
  // 'adj-t': '', // Not used in jpdb. JMDict: "'taru' adjective"
  // 'adj-kari': '', // Not used in jpdb. JMDict: "'kari' adjective (archaic)"

  adv: 'Adverb', // JMDict: "adverb (fukushi)"
  // 'adv-to': '', // Not used in jpdb: adv instead. JMDict: "adverb taking the `to' particle"

  aux: 'Auxiliary', // JMDict: "auxiliary"
  'aux-v': 'Auxiliary Verb', // JMDict: "auxiliary verb"
  'aux-adj': 'Auxiliary Adjective', // JMDict: "auxiliary adjective"
  conj: 'Conjunction', // JMDict: "conjunction"
  cop: 'Copula', // JMDict: "copula"
  ctr: 'Counter', // JMDict: "counter"
  exp: 'Expression', // JMDict: "expressions (phrases, clauses, etc.)"
  int: 'Interjection', // JMDict: "interjection (kandoushi)"
  num: 'Numeric', // JMDict: "numeric"
  prt: 'Particle', // JMDict: "particle"
  // 'cop-da': '',  // Not used in jpdb: cop instead. JMDict: "copula"

  vt: 'Transitive Verb', // JMDict: "transitive verb"
  vi: 'Intransitive Verb', // JMDict: "intransitive verb"

  v1: 'Ichidan Verb', // JMDict: "Ichidan verb"
  'v1-s': 'Ichidan Verb (くれる Irregular)', // JMDict: "Ichidan verb - kureru special class"

  v5: 'Godan Verb', // Not from JMDict
  v5u: 'う Godan Verb', // JMDict: "Godan verb with `u' ending"
  'v5u-s': 'う Godan Verb (Irregular)', // JMDict: "Godan verb with `u' ending (special class)"
  v5k: 'く Godan Verb', // JMDict: "Godan verb with `ku' ending"
  'v5k-s': 'く Godan Verb (いく/ゆく Irregular)', // JMDict: "Godan verb - Iku/Yuku special class"
  v5g: 'ぐ Godan Verb', // JMDict: "Godan verb with `gu' ending"
  v5s: 'す Godan Verb', // JMDict: "Godan verb with `su' ending"
  v5t: 'つ Godan Verb', // JMDict: "Godan verb with `tsu' ending"
  v5n: 'ぬ Godan Verb', // JMDict: "Godan verb with `nu' ending"
  v5b: 'ぶ Godan Verb', // JMDict: "Godan verb with `bu' ending"
  v5m: 'む Godan Verb', // JMDict: "Godan verb with `mu' ending"
  v5r: 'る Godan Verb', // JMDict: "Godan verb with `ru' ending"
  'v5r-i': 'る Godan Verb (Irregular)', // JMDict: "Godan verb with `ru' ending (irregular verb)"
  v5aru: 'る Godan Verb (-ある Irregular)', // JMDict: "Godan verb - -aru special class"
  // 'v5uru': '', // JMDict: "Godan verb - Uru old class verb (old form of Eru)"

  vk: 'Irregular Verb (くる)', // JMDict: "Kuru verb - special class"
  // vn: '', // Not used in jpdb. JMDict: "irregular nu verb"
  // vr: '', // Not used in jpdb. JMDict: "irregular ru verb, plain form ends with -ri"

  vs: 'する Verb', // JMDict: "noun or participle which takes the aux. verb suru"
  vz: 'ずる Verb', // JMDict: "Ichidan verb - zuru verb (alternative form of -jiru verbs)"
  'vs-c': 'す Verb (Archaic)', // JMDict: "su verb - precursor to the modern suru"
  // 'vs-s': '', // Not used in jpdb. JMDict: "suru verb - special class"
  // 'vs-i': '', // JMDict: "suru verb - included"

  // iv: '',  // Not used in jpdb. JMDict: "irregular verb"
  // 'v-unspec': '', // Not used in jpdb. JMDIct: "verb unspecified"

  v2: 'Nidan Verb (Archaic)', // Not from JMDict
  // 'v2a-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb with 'u' ending (archaic)"
  // 'v2b-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'bu' ending (archaic)"
  // 'v2b-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'bu' ending (archaic)"
  // 'v2d-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'dzu' ending (archaic)"
  // 'v2d-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'dzu' ending (archaic)"
  // 'v2g-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'gu' ending (archaic)"
  // 'v2g-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'gu' ending (archaic)"
  // 'v2h-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'hu/fu' ending (archaic)"
  // 'v2h-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'hu/fu' ending (archaic)"
  // 'v2k-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'ku' ending (archaic)"
  // 'v2k-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'ku' ending (archaic)"
  // 'v2m-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'mu' ending (archaic)"
  // 'v2m-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'mu' ending (archaic)"
  // 'v2n-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'nu' ending (archaic)"
  // 'v2r-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'ru' ending (archaic)"
  // 'v2r-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'ru' ending (archaic)"
  // 'v2s-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'su' ending (archaic)"
  // 'v2t-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'tsu' ending (archaic)"
  // 'v2t-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'tsu' ending (archaic)"
  // 'v2w-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'u' ending and 'we' conjugation (archaic)"
  // 'v2y-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'yu' ending (archaic)"
  // 'v2y-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'yu' ending (archaic)"
  // 'v2z-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'zu' ending (archaic)"

  v4: 'Yodan Verb (Archaic)', // Not from JMDict
  v4k: '', // JMDict: "Yodan verb with 'ku' ending (archaic)"
  v4g: '', // JMDict: "Yodan verb with 'gu' ending (archaic)"
  v4s: '', // JMDict: "Yodan verb with 'su' ending (archaic)"
  v4t: '', // JMDict: "Yodan verb with 'tsu' ending (archaic)"
  v4h: '', // JMDict: "Yodan verb with `hu/fu' ending (archaic)"
  v4b: '', // JMDict: "Yodan verb with 'bu' ending (archaic)"
  v4m: '', // JMDict: "Yodan verb with 'mu' ending (archaic)"
  v4r: '', // JMDict: "Yodan verb with 'ru' ending (archaic)"
  // v4n: '', // Not used in jpdb. JMDict: "Yodan verb with 'nu' ending (archaic)"

  va: 'Archaic', // Not from JMDict? TODO Don't understand this one, seems identical to #v4n ?

  // 'unc': '', // Not used in jpdb: empty list instead. JMDict: "unclassified"
};

export const POPUP_EXAMPLE_DATA: JpdbWordData = {
  context: '',
  contextOffset: 0,
  token: {
    start: 0,
    end: 0,
    length: 0,
    rubies: [],
    card: {
      vid: 1386060,
      sid: 1337383451,
      rid: 0,
      spelling: '設定',
      reading: 'せってい',
      pitchAccent: ['LHHHH'],
      meanings: [
        {
          partOfSpeech: ['n', 'vs'],
          glosses: ['establishment', 'creation', 'posing (a problem)', 'setting (movie, novel, etc.)', 'scene'],
        },
        {
          partOfSpeech: ['n', 'vs'],
          glosses: ['options setting', 'preference settings', 'configuration', 'setup'],
        },
      ],
      state: ['locked', 'new'],
      frequencyRank: 2400,
    },
  },
};

export const CURRENT_SCHEMA_VERSION = 1;

export const defaultConfig: Config = {
  schemaVersion: CURRENT_SCHEMA_VERSION,

  apiToken: null,

  miningDeckId: null,
  forqDeckId: 'forq',
  blacklistDeckId: 'blacklist',
  neverForgetDeckId: 'never-forget',
  contextWidth: 1,
  forqOnMine: true,

  customWordCSS: `/***** On by default *****
These are easily editable or deletable styling options that I'm leaving on by default and think others would like too.
Feel free to delete them or surround the options you don't want with /* and */

/***** Don't change colors for known, blacklisted, or unparsed words *****
 * This keeps all colors for JPDB.io pages (for 2D reviewing etc.)  */

.jpdb-word.known:not(div.vocabulary-list .jpdb-word.known) { color: inherit }
.jpdb-word.blacklisted:not(div.vocabulary-list .jpdb-word.blacklisted) { color: inherit }
.jpdb-word.unparsed:not(div.vocabulary-list .jpdb-word.unparsed) { color: inherit }

/***** Dim known vocab in JPDB *****/

.vocabulary-list .entry:has(.known),
.vocabulary-list .entry:has(.learning) { opacity: 0.25 }

/***** Black screen for OLED on JPDB *****/

html.dark-mode, html.dark-mode body {
  background-color: black !important
}

/***** Hide furigana on known/learning words unless hovering *****/

.jpdb-word.known:not(:hover) .jpdb-furi { visibility: hidden; }
.jpdb-word.learning:not(:hover) .jpdb-furi { visibility: hidden; }
.jpdb-word.due .jpdb-furi { visibility: hidden; }
.jpdb-word.failed .jpdb-furi { visibility: hidden; }


/**** Ideas & Options *****
 * Remove the slash+asterisks surrounding the code parts below to enable experimental styling ideas.
 * These are all off by default! */

/***** E-ink screen new word visibility border - horizontal text version *****/
/*
.jpdb-word.new { border-bottom: 2px solid }
.jpdb-word.not-in-deck { border-bottom: 2px dashed }
*/

/***** E-ink screen new word visibility border - vertical text version *****/
/*
.jpdb-word.new{ border-left: 2px solid }
.jpdb-word.not-in-deck{ border-left: 2px dashed }
*/`,

  customPopupCSS: `/* Make review/mining buttons bigger for mobile */

button { padding:20px 10px; font-size: 14px; flex-grow:1 }
#mine-buttons button { padding: 10px 0; }
article { max-height: 50vh }


/* Hide never forget and edit buttons */
/*
button.edit-add-review,
button.never-forget,
button.blacklist { 
    display:none;
}
*/`,

  showPopupOnHover: false,
  touchscreenSupport: false,
  disableFadeAnimation: false,

  disableExtraSpace: false,
  disablePopupAutoClose: false,
  hideVocabOSuccessfulGrade: false,
  hideProgressBar: false,

  disable2DReviewing: false,
  disableJPDBAutoParsing: false,

  closeOnPopupClick: true,
  useShorterButtonNames: true,
  moveLinksToPopup: true,
  gradeButtonsAtBottom: true,
  prioritizePopupAboveWord: true,
  prioritizePopupToRightOfWord: true,

  showPopupKey: { key: 'Shift', code: 'ShiftLeft', modifiers: [] },
  addKey: null,
  dialogKey: null,
  blacklistKey: null,
  neverForgetKey: null,
  nothingKey: null,
  somethingKey: null,
  hardKey: null,
  goodKey: null,
  easyKey: null,
};
