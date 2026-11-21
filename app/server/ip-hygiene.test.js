// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(SERVER_DIR, '..');
const REPO_ROOT = path.resolve(APP_DIR, '..');

// SHA-256 digests of the legacy cropped GGPoker preset avatars removed in C5 cleanup.
const LEGACY_AVATAR_HASHES = new Set([
  '0c4f0f1ef20ef663ecf7f822b354bd829057f59440954d9d56603d094497807b',
  '76626c295e724d1c2db0341cd290477333f20c5ce8ac1df784a26350dc4bf026',
  '6af32c7a54feb64bada5e2d1479a536d0629688253eb16c1758bceafd42c400b',
  'f0cba6078d5846a880533f6748d23eb9a8df9c2257b5aeb281e9e16097047c69',
  'a36d04463f8a81363cfa41714f2e17268f101d907c890f7ad91d4bac1c730c49',
  '4c1ced8e1fe576e227064470a7dc0f4f394ccfd9dd479f7ddd08dbb9aa9a3610',
  'b01722d4e721469d5d80a2b5ecae0ff3b384390ec627863e5478b48cab97d8ad',
  '4935da603465fd8956df7a1c6562fcbbb4776941e14004cfea66ac540a185fde',
  '67c099c2a6ce96ee8a2f32efb279615181fdc6e5053606a70808833bb4018f98',
  '0b97254f00568e0215b96cb571a7ec16ed223a441d02b50cfc324cfeb3552bf3',
  'bcc199b077ab1a575671b8209040c49b5dab8cc211c99f6a87e9f8f08dc4c09e',
  'f9aed2a52ef87c342687f409c601e1e36b43927254018a11ac2d1456cede2889',
  '8bc5163cda5e03254cdef18132241d90a73dc4d02eb0f69acb2d9763c9282aea',
  '3d92d0d63417bfb26e14439919d415d319588ce21bf1126dc645785d32a0c647',
  '266e72d303f52badd09266c36f144bb92e7687f10b78b116eab15b40194af935',
  '516a9685c6709a4e673d6448d4d9f43b8f12b38bf092223a4e31ea663d1122c4',
  'e72549593a3bbf6c5a3afaaac82f1fb7153109f01745fa5836bc067fdf98e21c',
  'e76b0d593d2491168f80a83e68a8886bd260e2b212d5eac4929db5ebfef65f3e',
  '82a59c53b822561b748811e57b60ca8ebe28d8f9f34b10e50f88e7278660691e',
  '3ca1f4a712d8054a7b8b32c5df82cbeb1b6c7155cd022507365bec9770f39c84',
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

test('reverse-engineering dossiers, extracted i18n builder and stray binaries are absent', () => {
  for (const rel of [
    'research/REVERSE_ENGINEERING.md',
    'research/brand/gg-mark.png',
    'docs/rea/bad-beat-jackpot.json',
    'docs/rea/straddle-sitout.json',
    'tools/build_i18n.py',
    'tools/person_mask',
    '.ghcache',
  ]) {
    assert.equal(fs.existsSync(path.join(REPO_ROOT, rel)), false, `${rel} must remain removed`);
  }
});

test('no third-party reference screenshots or macOS duplicate files remain tracked', () => {
  const shotFiles = walk(path.join(REPO_ROOT, 'docs', 'screenshots'));
  const refShots = shotFiles.filter((f) => path.basename(f).startsWith('reference-'));
  assert.deepEqual(refShots, [], 'no reference-* screenshots should remain');

  const appAndDocs = [...walk(path.join(REPO_ROOT, 'app', 'src')), ...walk(path.join(REPO_ROOT, 'app', 'tools')), ...walk(path.join(REPO_ROOT, 'docs'))];
  const macDupes = appAndDocs.filter((f) => / 2(\.[^.]+)?$/.test(path.basename(f)));
  assert.deepEqual(macDupes, [], 'no macOS " 2" duplicate files should remain');
});

test('all 20 preset avatars are valid original JPEGs distinct from legacy crops', () => {
  const dir = path.join(APP_DIR, 'public', 'assets', 'avatars');
  for (let i = 1; i <= 20; i += 1) {
    const file = path.join(dir, `gg-${String(i).padStart(2, '0')}.jpg`);
    assert.equal(fs.existsSync(file), true, `missing avatar ${file}`);
    const bytes = fs.readFileSync(file);
    assert.ok(bytes.length > 2000, `avatar ${file} unexpectedly small`);
    assert.equal(bytes[0], 0xff, `avatar ${file} must start with JPEG SOI`);
    assert.equal(bytes[1], 0xd8, `avatar ${file} must start with JPEG SOI`);
    assert.equal(bytes[2], 0xff, `avatar ${file} must be a valid JPEG`);
    const digest = createHash('sha256').update(bytes).digest('hex');
    assert.equal(LEGACY_AVATAR_HASHES.has(digest), false, `avatar ${file} still matches legacy cropped hash`);
  }
});

const SUPPORTED_LANGS = [
  'en', 'ro', 'de', 'fr', 'es', 'pt-br', 'ru', 'zh-cn', 'ja', 'ko',
  'tr', 'pl', 'zh-tw', 'vi', 'id', 'th', 'sv', 'et', 'lv', 'da',
  'fi', 'cs', 'nl', 'hu', 'uk-ua', 'lt', 'ar', 'bs-ba', 'bg', 'el',
];

test('i18n dictionary is original, compact, valid JSON and covers all 30 supported locales', () => {
  const file = path.join(APP_DIR, 'src', 'lib', 'i18n-dict.json');
  const raw = fs.readFileSync(file, 'utf8');
  assert.ok(Buffer.byteLength(raw, 'utf8') < 262144, 'original i18n dictionary should stay smaller than legacy extracted table');
  assert.equal(/com\.nsus|string_table|GGPoker/i.test(raw), false, 'i18n dictionary must not contain third-party client strings');
  const parsed = JSON.parse(raw);
  const keys = Object.keys(parsed);
  assert.ok(keys.length >= 300, 'i18n dictionary should cover core UI labels');
  for (const key of keys) {
    for (const lang of SUPPORTED_LANGS) {
      assert.ok(typeof parsed[key]?.[lang] === 'string' && parsed[key][lang].length > 0, `missing ${lang} translation for ${key}`);
    }
  }
  for (const key of ['Settings', 'Tournaments', 'Cashier', 'Transactions', 'Currency', 'Amount', 'Player', 'Delete']) {
    assert.ok(parsed[key]?.ro && parsed[key]?.ar && parsed[key]?.vi && parsed[key]?.['zh-tw'], `expected multi-locale translations for ${key}`);
  }
});

// SHA-256 digests of the legacy unverified C5 brand, icon, poster, casino-tile, and table-UI
// files replaced by deterministic clean-room generators under tools/original-assets/.
const LEGACY_C5_ASSET_HASHES = new Map([
  ["app/public/assets/brand/favicon.png", "a09afd33b2ab949e60cf41b2f053b3b2655603fa203e497df2b55390286585fb"],
  ["app/public/assets/brand/openpoker-intro.png", "7492ba4fceb3815a403438870758dbcfc1efea2b66bf261276e0c3751992d07e"],
  ["app/public/assets/table/ui/alarm.webp", "ee33e3dbf468a9b3a35e62bde903699af34215e0df2b7ed60202d795af0e1818"],
  ["app/public/assets/table/ui/amount-bubble.webp", "358b0775bf3118ab27c32d046c2e4da6d84328d8b3f22625ff641e2f01b96863"],
  ["app/public/assets/table/ui/badge-allin.webp", "5aa4267b43ea12123f579360ff6fb3b9a43fb20934333a6bb12b0de7ecb34032"],
  ["app/public/assets/table/ui/badge-break.webp", "fdea4175c0a0d5fd66a75e2fd2be8968da443ee77a2c125463e481dd905db0d7"],
  ["app/public/assets/table/ui/badge-offline.webp", "adf0116d49aa902782af2adb2d38d4321a82ea45bd5bff2b5d02fabce785b3ad"],
  ["app/public/assets/table/ui/badge-sitout.webp", "0db2a63e4d1541b05d047889c1b1f417e910af3475af59ff6f0031b5eb57b4c7"],
  ["app/public/assets/table/ui/badge-waitbb.webp", "05f86b0d333c38d2d22c8e183b187b939ead5a6a4704659b6c2f1d9b1f9fc56a"],
  ["app/public/assets/table/ui/badge-winner.webp", "45d6a93fd644be0ca3b5e1777f8b4a78d7b8f3c40d84fa7fb5f778e1011cf19f"],
  ["app/public/assets/table/ui/btn-call-down.webp", "f4993d8c7da4051bf37d2d0ae4cfa5cbc312087f614af599da92f6341d7e1ee3"],
  ["app/public/assets/table/ui/btn-call-sm.webp", "5d1463c198cecc4793e15d14eba8e4e96717ef71c085ffc33384d982446036eb"],
  ["app/public/assets/table/ui/btn-call.webp", "7c1b80915c48f42a5b611b545fa396e4fd902c4587bbbb8f5e2f4ee3653944ef"],
  ["app/public/assets/table/ui/btn-dark.webp", "ced99d661dae7a5240aa963aecdcafb9f45ca76eb3647162b9fd46db6d0e8cf9"],
  ["app/public/assets/table/ui/btn-fold-down.webp", "499f82e359046d422bab61d28646672d681ecb83ac40a67780e7fef206f3b735"],
  ["app/public/assets/table/ui/btn-fold-sm.webp", "dfa3381f21e018574ce8c7cb1fe4c2f05598d9698e27b6fbff772f984c8ddc83"],
  ["app/public/assets/table/ui/btn-fold.webp", "04d98e922970a34fc0ef723f14bf330ceae5c7fb5df24efe9a64df59f1ee7363"],
  ["app/public/assets/table/ui/btn-raise-down.webp", "36c49f0909cf40e6f0eff57f0d15641ff797c5fe92dedbd7da8c1bc026c609e9"],
  ["app/public/assets/table/ui/btn-raise-sm.webp", "7d41b94b37c2f6741643a99b72d2bd3e33582e17afd315f49fdd5657f4cea341"],
  ["app/public/assets/table/ui/btn-raise.webp", "01a590ff580c9c93468b5933fe851bc42909b70c30cad8ae716fc4ce9b2a78be"],
  ["app/public/assets/table/ui/cb-disabled.webp", "25929c4c59312e69f141004639a67f630f54c338e3701c9b0d945d2b635f5b97"],
  ["app/public/assets/table/ui/cb-off.webp", "ebde05a13ab187e75154a01eea556cf018d81673b2269c2733e7c87d6c862e88"],
  ["app/public/assets/table/ui/cb-on.webp", "99fd34d1de505bbcf7f41d145bd0112faa422944a3ae4834a899df034070c801"],
  ["app/public/assets/table/ui/chip-preset-on.webp", "22c0ead3bf18dee1c2115bc8cd491a5b3f50c7fc9eee2db7614abdffd6443cf1"],
  ["app/public/assets/table/ui/chip-preset.webp", "65359ac9363686a6d380b92d181fcb03f61c3b0115fbdb4b1b900c6437749e2f"],
  ["app/public/assets/table/ui/countdown-panel.webp", "a297439d3cc29f11aa2f9f754a7967e1b326ce492de3d421e6cf4647b0e91b21"],
  ["app/public/assets/table/ui/fx-comet.webp", "3fbb3eb2d647daeb1acbb26bd7ddf3aa95997c9b3c178b04165283379adc9ae6"],
  ["app/public/assets/table/ui/fx-divider.webp", "4de7caebb53fce5ac6b1ed52cfe42fc882b37f5e7484ca472a037c7840e6bb35"],
  ["app/public/assets/table/ui/fx-flare-left.webp", "362a1ca3ddad3c1f6188b1b2abfe64b668a6d1828805782bbbf1f7de2046c212"],
  ["app/public/assets/table/ui/fx-flare-right.webp", "dfa0e7a5247dd6a86e8e9ab18b347b914243acd83262d159c3df18a47ece8537"],
  ["app/public/assets/table/ui/ic-addchips.webp", "bf1a25046a337eb28bef28f1714a8c7e12b725b6f54c37953f1141621f4d1594"],
  ["app/public/assets/table/ui/ic-break.webp", "8ed69c3ae6745214f76d7eebad635b62dbbe4891ca2e19846b09930cbae12d66"],
  ["app/public/assets/table/ui/ic-edit.webp", "eba25934da7d7bb8c0266cc7013072407460f2956922952d2460e4394e28314e"],
  ["app/public/assets/table/ui/ic-gear.webp", "cc66ad2bfa9c0a8c1c26f3622f57722ea44272422719a720753994305ab17fd1"],
  ["app/public/assets/table/ui/ic-history.webp", "ce4bb40d56e8e744c23c4b161275972d00cbf3553e6e8c1eb71d571c0cb73fea"],
  ["app/public/assets/table/ui/ic-minus.webp", "bb9d44c681f39ad47425ce7bcf12a99d627addd69ec62d7797e0c7bfd8cd8935"],
  ["app/public/assets/table/ui/ic-plus.webp", "fdc48414065eb903e31436bd036be226e4053b1206b81f0f3c981c3ea700da60"],
  ["app/public/assets/table/ui/ic-rabbit.webp", "915bfd3a6a8167350194b47e735da35184b9a28bda45008611406fbbe25a23a0"],
  ["app/public/assets/table/ui/ic-runit.webp", "714c11244d84bf7a84a9040ae7a0ab6b1912daf2dae011d796f5c316a2eabfd1"],
  ["app/public/assets/table/ui/ic-show-card.webp", "8d9c0934520631bbe1638a30d1b6a8e66c01e53769609c7d7a324b9a0799a121"],
  ["app/public/assets/table/ui/ic-sitout-bb.webp", "76eaaa6598e20e8f66a2ef369ba91f007e5bf01a848415cfbad05c77e8fdd511"],
  ["app/public/assets/table/ui/ic-sitout-hand.webp", "66fada4e7863bafca5c93358f8598e9ecae09e79cb8acba79b5684f0f746bff3"],
  ["app/public/assets/table/ui/ic-straddle.webp", "d08800d0d5b80ddf1b8deaa9be18c068d24a5f0cdc4b40bb425707eab7e078f6"],
  ["app/public/assets/table/ui/label-gold.webp", "50dda9d4f0fcecff08b299553683a7071aeec688090229d5299d014eb36db9cf"],
  ["app/public/assets/table/ui/label-green.webp", "783a6d2e917bcbef8c64955c5460eecd56f4927c78362db120c1b682304f4270"],
  ["app/public/assets/table/ui/label-purple.webp", "aacde8377963621b00c996c5a9653d6ced1001586a61cdb1eadf37a058e84355"],
  ["app/public/assets/table/ui/label-red.webp", "c7f7eb005bc9983797902e8076d1989d9970e75b628fb9c23aed1247b25257fc"],
  ["app/public/assets/table/ui/level-tag.webp", "64f1ce2bd8fedcd3b8fc1ef042ccc68670d30484d89a3489b477b5be8e485dbc"],
  ["app/public/assets/table/ui/mk-bb.webp", "9eadfb242dd47d0b965cace580e4f0bc524bce041943d42503c625e5ae2ed820"],
  ["app/public/assets/table/ui/mk-bounty.webp", "3781945e983965cfeb8da572affddefe3b71442299dda4cf898c7ce129a9a9a5"],
  ["app/public/assets/table/ui/mk-dead.webp", "1fb97bc79042f796b4c8c88d1bfb06c022b27e4acaac7158becf5f0238a64902"],
  ["app/public/assets/table/ui/mk-dealer.webp", "3a25307dadb3a1f7b6f8686fa72cef272a85fedf503cbc4e8f3af0cd6d5c9376"],
  ["app/public/assets/table/ui/mk-sb.webp", "6b4d6592319e49a9687b97a6c5ffcf60a0f4228cd33463206d4114834f48a16f"],
  ["app/public/assets/table/ui/mk-straddle.webp", "622dcc97577607ee6fca5e614a368b2cdabf14b71bec7e38ed9e64afb2895279"],
  ["app/public/assets/table/ui/plate-name-active.webp", "ef0a664bbf0d0b6760c150d15580a29df6691d30af5b222999fd047c11c2f46c"],
  ["app/public/assets/table/ui/plate-name.webp", "95680439af58981206941b80ae57781d4c041a14a627db632fabde4dc7a6ed78"],
  ["app/public/assets/table/ui/pot-pill.webp", "659e795372dd27d21648d529bcba3c4bf1e623155291144a91c4885662a11411"],
  ["app/public/assets/table/ui/ring-amber.webp", "38e89adc0f99296827cfbdab0d0d12f3463b3d3b4737da5fc48beee4fa7ba24d"],
  ["app/public/assets/table/ui/ring-gold.webp", "7cd512b2bf2f186502b6f19109de7d9f925105f7782a3678c6d2365828de14a7"],
  ["app/public/assets/table/ui/ring-red.webp", "d1b99de8d3427dab929881303e5373baf27a801b6fe45a475cb47a9b4f7339a2"],
  ["app/public/assets/table/ui/seg-on.webp", "40ce7eb074e829e11ce6554a92fdf25a6d1dd7a035f6272fc98eeb3ee7ce4087"],
  ["app/public/assets/table/ui/seg-track.webp", "07cceaf6c815436816b24ca9bb88beec6d300058dcb385f36bc9ec752e972447"],
  ["app/public/assets/table/ui/slider-fill.webp", "f9c98565badf43bf6f48579fbfa3b555cf9de001160b0bdbd116c9cc70fc6c8a"],
  ["app/public/assets/table/ui/slider-thumb.webp", "d52da00fdcafebdb9f2be93bbb17bf559891e1e38934aafc4137eec98eb02bb5"],
  ["app/public/assets/table/ui/slider-track.webp", "768d2c7b3f69131d9249dc6776289ca95e76bc917833645c9a70a18122db4a5f"],
  ["app/public/assets/table/ui/sw-off.webp", "de5dc9b227f8d113c96f6c4208833eb0cf05b3c3b5ea022f0c61354c7d4977c9"],
  ["app/public/assets/table/ui/sw-on-gold.webp", "32fad386257246c2de93ed21460ddd640de87204c1ddf3698ab544dc8e84b88d"],
  ["app/public/assets/table/ui/sw-on.webp", "4ac13e8fd853957b68013c2d06c3252e5fcf5346a5abdd54b77093669d43abd2"],
  ["app/public/assets/table/ui/timebank.webp", "e6e91407d0ed0f9a33c312c1fcc8254d3219cc03297e4b551eb032034b6209c8"],
  ["app/public/assets/ui/casino-games/casino-baccarat.webp", "c633959e1ba1611b1d9828d49ba6d615bfbe78d0343f7cd3a8046ecf1c985449"],
  ["app/public/assets/ui/casino-games/casino-blackjack.webp", "17af2038898343e6501f7705e086ea0ce933092fd0813c85c141630f9b954470"],
  ["app/public/assets/ui/casino-games/casino-crash.webp", "70c7c234d19b3bb702627b2ce83bfb3e3ad543d4e3d9bca288a089e422a08441"],
  ["app/public/assets/ui/casino-games/casino-dragontiger.webp", "9d65fbcf561289a40a52d30454d0ba76579dd829c6c10272129c9bdb789d8cb6"],
  ["app/public/assets/ui/casino-games/casino-holdem.webp", "5d99dea5e64085dfa19aeb0585a8fc0cc30415026d48fd79df0f4473cb1942e5"],
  ["app/public/assets/ui/casino-games/casino-roulette.webp", "f4b8a90300056dac9091367ebaef36883af2b0b815b1af0db72525f2a8208e9a"],
  ["app/public/assets/ui/casino-games/casino-sicbo.webp", "03d3f807ee42b5352eb62c3eac817b72b4375ebd5b8e5721b56f6a5aa311c2c0"],
  ["app/public/pwa/spade-192.png", "dc55c3400126357e6107e2f6ad834860539bce4b760a2d06d0df3d153ec65db7"],
  ["app/public/pwa/spade-512.png", "ff95cfe8be27f0a4ed462791cda9c814af1d4d94e8a34d1505a711addfb990c3"],
  ["app/public/pwa/spade-apple-touch.png", "74e498e3d14b372d1880fdd92e626015205de1cc996165b3d59eebb920287f4c"],
  ["app/public/pwa/spade-maskable-512.png", "ff95cfe8be27f0a4ed462791cda9c814af1d4d94e8a34d1505a711addfb990c3"],
  ["research/brand/AppIcon.icns", "9e032aa0a5432da01db75d3dc3f4535de102568664766eb6a6b622b896bb7f15"],
  ["research/brand/AppIcon.png", "1a913639a6c8f095546449e6621a3dc4d857cf6012ce54f0835573b6d76572cf"],
]);

const LEGACY_EXTRACTED_I18N_HASH = '7bf8bba924016ee5fa281f567bf65379c7d390fcc684c3239a1f3ad05d38f868';

test('all C5 brand, icon, poster, casino-tile, and table-UI assets are original and distinct from legacy hashes', () => {
  for (const rel of [
    'app/src/assets/brand/openpoker-brand.svg',
    'tools/original-assets/brand-art.mjs',
    'tools/original-assets/casino-tiles.mjs',
    'tools/original-assets/table-ui.mjs',
    'tools/original-assets/table-ui-controls.mjs',
    'tools/original-assets/table-ui-icons.mjs',
    'docs/original-installer-art.md',
  ]) {
    assert.equal(fs.existsSync(path.join(REPO_ROOT, rel)), true, `missing generator or provenance doc ${rel}`);
  }
  for (const [rel, legacyHash] of LEGACY_C5_ASSET_HASHES) {
    const full = path.join(REPO_ROOT, rel);
    assert.equal(fs.existsSync(full), true, `missing clean-room asset ${rel}`);
    const bytes = fs.readFileSync(full);
    assert.ok(bytes.length > 500, `asset ${rel} unexpectedly small`);
    if (rel.endsWith('.webp')) {
      assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `${rel} must be valid RIFF WebP`);
      assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', `${rel} must be valid WEBP`);
    } else if (rel.endsWith('.png')) {
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${rel} must be valid PNG`);
    } else if (rel.endsWith('.icns')) {
      assert.equal(bytes.subarray(0, 4).toString('ascii'), 'icns', `${rel} must be valid macOS ICNS`);
    }
    const digest = createHash('sha256').update(bytes).digest('hex');
    assert.notEqual(digest, legacyHash, `asset ${rel} still matches legacy unverified hash`);
  }
  const i18nDigest = createHash('sha256').update(fs.readFileSync(path.join(APP_DIR, 'src', 'lib', 'i18n-dict.json'))).digest('hex');
  assert.notEqual(i18nDigest, LEGACY_EXTRACTED_I18N_HASH, 'i18n-dict.json must not match legacy extracted table');
});
