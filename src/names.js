// Cópia do arquivo principal js/names.js do site (site-song-of-moonlight): mantenha as duas iguais.
// Verificador de nomes impróprios (o mesmo arquivo no site, no servidor do site, no Jerry's Way e no Song of Moonlight).
// Compara sem maiúsculas e sem acento, desfaz truques comuns (p0rr4, c.u, buuurro, f u c k) e procura palavrões,
// ofensas e termos de ódio em português e inglês. Use: isBadName('nome') -> true se não pode.
// As regras do banco (firebase/firestore.rules) usam a expressão BAD_NAME_REGEX gerada a partir desta mesma lista.

// partes que não podem aparecer em lugar nenhum do nome (já escritas na forma "normalizada": sem acento e sem letra repetida)
export const BAD_PARTS = [
  // português
  'pora', 'caralh', 'karalh', 'buceta', 'boceta', 'bucet', 'xoxot', 'xerec', 'piroc', 'punhet', 'siriric', 'cacet', 'foder', 'fodas', 'fodid',
  'foda', 'fude', 'fudid', 'puta', 'puto', 'putaria', 'viad', 'arombad', 'desgrac', 'merd', 'bosta', 'cuzao', 'cuzinh', 'babaca', 'otario',
  'imbecil', 'idiota', 'retardad', 'mongoloid', 'vagabund', 'vadia', 'corno', 'corna', 'chifrud', 'estupr', 'pedofil', 'crioul', 'sapatao',
  'traveco', 'boiola', 'baitola', 'bichona', 'safad', 'tesao', 'penis', 'vagina', 'sexo', 'porno', 'nazist', 'nazism', 'hitler',
  // inglês
  'fuck', 'fuk', 'shit', 'bitch', 'cunt', 'dickhead', 'pusy', 'whore', 'slut', 'fagot', 'faget', 'niger', 'niga', 'retard', 'rape', 'porn',
];
// nomes que não podem ser só isto (palavras curtas, que dentro de outros nomes são normais)
export const BAD_WHOLE = ['cu', 'cus', 'pau', 'pica', 'rola', 'kct', 'krl', 'crl', 'fdp', 'vsf', 'vtnc', 'tnc', 'pqp', 'vtmnc', 'sex', 'gay', 'anal', 'ass', 'tit', 'tits', 'xxx', 'nazi', 'fag', 'dick', 'cock', 'dic', 'coc'] ;

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
const PARTS = BAD_PARTS.map(norm), WHOLE = BAD_WHOLE.map(norm);
export function isBadName(name) {
  const t = normalizeName(name);
  if (!t) return false;
  if (WHOLE.includes(t)) return true;
  return PARTS.some((p) => p && t.includes(p));
}
