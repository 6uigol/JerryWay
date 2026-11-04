// Cópia do arquivo principal js/names.js do site (site-song-of-moonlight): mantenha as duas iguais.
// Verificador de nomes impróprios (o mesmo arquivo no site, no servidor do site, no Jerry's Way e no Song of Moonlight).
// Compara sem maiúsculas e sem acento, desfaz truques comuns (p0rr4, c.u, buuurro, f u c k) e procura palavrões,
// ofensas e termos de ódio em português e inglês. Use: isBadName('nome') -> true se não pode.
// As regras do banco (firebase/firestore.rules) usam uma expressão gerada desta mesma lista (scripts/gen-name-rules.mjs).
// Parte da lista vem do projeto LDNOOBW, "List of Dirty, Naughty, Obscene and Otherwise Bad Words" (licença CC-BY 4.0,
// https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words), sem as palavras neutras.

// partes que não podem aparecer em lugar nenhum do nome (já escritas na forma "normalizada": sem acento e sem letra repetida)
export const BAD_PARTS = [
  // português
  'pora', 'caralh', 'karalh', 'buceta', 'boceta', 'bucet', 'xoxot', 'xerec', 'piroc', 'punhet', 'siriric', 'cacet', 'foder', 'fodas', 'fodid',
  'foda', 'fude', 'fudid', 'puta', 'puto', 'putaria', 'viad', 'arombad', 'desgrac', 'merd', 'bosta', 'cuzao', 'cuzinh', 'babaca', 'otario',
  'imbecil', 'idiota', 'retardad', 'mongoloid', 'vagabund', 'vadia', 'corno', 'corna', 'chifrud', 'estupr', 'pedofil', 'crioul', 'sapatao',
  'traveco', 'boiola', 'baitola', 'bichona', 'safad', 'tesao', 'penis', 'vagina', 'sexo', 'porno', 'nazist', 'nazism', 'hitler',
  // inglês
  'fuck', 'fuk', 'shit', 'bitch', 'cunt', 'dickhead', 'pusy', 'whore', 'slut', 'fagot', 'faget', 'niger', 'niga', 'retard', 'rape', 'porn',
  // da lista LDNOOBW em português e combinações vulgares
  'biscate', 'cabrao', 'chochota', 'xochota', 'colhoes', 'esporra', 'paneleiro', 'sacanagem', 'vibrador', 'clitoris', 'bastard', 'bundud', 'bucetud', 'paugra', 'pauduro', 'paumol', 'paunoc', 'paunacu', 'paunobur', 'pausud', 'rolagra', 'rolud', 'pirocud', 'picud', 'picagra', 'pintud', 'chuparol', 'chupapau', 'chupapic', 'chupapir', 'tomanoc', 'vaitomar', 'filhodaput', 'fdput',

];
// mais termos em inglês da lista LDNOOBW (sem as palavras neutras): valem no site, no servidor e nos jogos;
// as regras do banco usam só a lista principal acima (uma expressão menor, que o Firebase aceita)
export const BAD_PARTS_EXTRA = [
  'acrotomophilia', 'anilingus', 'apeshit', 'arsehole', 'asshole', 'assmunch', 'autoerotic', 'bangbros', 'bangbus', 'bareback', 'barenaked', 'beaner', 'beaners', 'beastiality', 'bestiality', 'bimbos', 'birdlock', 'bitches', 'blowjob', 'blumpkin', 'bollocks', 'bondage', 'boner', 'boobs', 'bukkake', 'bulldyke', 'bullshit', 'bunghole', 'busty', 'buttcheeks', 'butthole', 'camgirl', 'camslut', 'camwhore', 'carpetmuncher', 'cialis', 'circlejerk', 'clusterfuck', 'cocks', 'coprolagnia', 'coprophilia', 'cornhole', 'creampie', 'cumming', 'cumshot', 'cumshots', 'cunnilingus', 'darkie', 'daterape', 'deepthroat', 'dendrophilia', 'dildo', 'dingleberry', 'dingleberries', 'doggiestyle', 'doggystyle', 'dommes', 'ecchi', 'ejaculation', 'erotic', 'eunuch', 'faggot', 'fecal', 'felch', 'fellatio', 'feltch', 'femdom', 'fingerbang', 'fingering', 'fisting', 'footjob', 'frotting', 'fuckin', 'fucking', 'fucktards', 'fudgepacker', 'futanari', 'gangbang', 'genitals', 'goatse', 'gokkun', 'goodpoop', 'goregasm', 'grope', 'handjob', 'hardcore', 'hentai', 'honkey', 'hooker', 'horny', 'humping', 'incest', 'intercourse', 'jailbait', 'jigaboo', 'jiggaboo', 'jiggerboo', 'juggs', 'kinkster', 'kinky', 'knobbing', 'livesex', 'lovemaking', 'masturbate', 'masturbating', 'masturbation', 'motherfucker', 'muffdiving', 'neonazi', 'nigga', 'nigger', 'nimphomania', 'nipple', 'nipples', 'nudity', 'nympho', 'nymphomania', 'omorashi', 'orgasm', 'paedophile', 'panties', 'panty', 'pedobear', 'pedophile', 'pegging', 'pikey', 'pissing', 'pisspig', 'ponyplay', 'poontang', 'punany', 'poopchute', 'pornography', 'pubes', 'pussy', 'queaf', 'queef', 'raghead', 'raping', 'rapist', 'rectum', 'rimjob', 'rimming', 'schlong', 'scissoring', 'semen', 'sexcam', 'shemale', 'shitblimp', 'shitty', 'shota', 'skeet', 'slanteye', 'snatch', 'snowballing', 'sodomize', 'sodomy', 'spastic', 'splooge', 'spooge', 'spunk', 'strapon', 'sucks', 'swastika', 'swinger', 'threesome', 'throating', 'titties', 'titty', 'topless', 'tosser', 'towelhead', 'tranny', 'tribadism', 'tubgirl', 'tushy', 'undressing', 'upskirt', 'urophilia', 'viagra', 'vibrator', 'vorarephilia', 'voyeur', 'voyuer', 'vulva', 'wetback', 'worldsex', 'yiffy', 'zoophilia',
];
// nomes que não podem ser só isto (palavras curtas, que dentro de outros nomes são normais)
export const BAD_WHOLE = ['cu', 'cus', 'pau', 'pica', 'rola', 'kct', 'krl', 'crl', 'fdp', 'vsf', 'vtnc', 'tnc', 'pqp', 'vtmnc', 'sex', 'gay', 'anal', 'ass', 'tit', 'tits', 'xxx', 'nazi', 'fag', 'dick', 'cock', 'dic', 'coc', 'queca', 'xana', 'cona', 'cagar', 'gozar', 'grelo', 'bicha', 'mama', 'rolas', 'anus', 'bbw', 'bdsm', 'boob', 'butt', 'clit', 'coon', 'cum', 'cunt', 'dvda', 'fuck', 'guro', 'jizz', 'kike', 'milf', 'mong', 'nsfw', 'nude', 'orgy', 'paki', 'poof', 'poon', 'porn', 'pthc', 'quim', 'rape', 'scat', 'sexo', 'sexy', 'shit', 'slut', 'smut', 'spic', 'suck', 'twat', 'wank', 'yaoi'];

const LEET = { 0: 'o', 1: 'i', 2: 'z', 3: 'e', 4: 'a', 5: 's', 6: 'g', 7: 't', 8: 'b', 9: 'g', '@': 'a', $: 's', '!': 'i', '|': 'i', '€': 'e', '£': 'l' };
// forma usada na comparação: minúsculas, sem acento, truques de número/símbolo desfeitos, sem separadores e sem letra repetida
export function normalizeName(s) {
  let t = String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  t = [...t].map((ch) => LEET[ch] || ch).join('');
  t = t.replace(/[^a-z]/g, '');                 // tira espaços, pontos, traços...
  t = t.replace(/ph/g, 'f').replace(/k/g, 'c').replace(/y/g, 'i').replace(/w/g, 'u');   // mesmos sons
  return t.replace(/(.)\1+/g, '$1');            // "buuuurro" -> "buro", "porra" -> "pora", "fuck" -> "fuc"
}
const norm = (w) => normalizeName(w);
const PARTS = [...BAD_PARTS, ...BAD_PARTS_EXTRA].map(norm), WHOLE = BAD_WHOLE.map(norm);
export function isBadName(name) {
  const t = normalizeName(name);
  if (!t) return false;
  if (WHOLE.includes(t)) return true;
  return PARTS.some((p) => p && t.includes(p));
}
