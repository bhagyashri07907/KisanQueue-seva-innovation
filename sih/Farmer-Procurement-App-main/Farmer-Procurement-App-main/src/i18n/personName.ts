const commonNames: Record<string, { hi: string; mr: string }> = {
  bhagyashri: { hi: 'भाग्यश्री', mr: 'भाग्यश्री' },
  patil: { hi: 'पाटील', mr: 'पाटील' },
  ramesh: { hi: 'रमेश', mr: 'रमेश' },
  balasaheb: { hi: 'बालासाहेब', mr: 'बाळासाहेब' },
  jadhav: { hi: 'जाधव', mr: 'जाधव' },
  suresh: { hi: 'सुरेश', mr: 'सुरेश' },
  narayan: { hi: 'नारायण', mr: 'नारायण' },
  more: { hi: 'मोरे', mr: 'मोरे' },
  ananda: { hi: 'आनंद', mr: 'आनंद' },
  tukaram: { hi: 'तुकाराम', mr: 'तुकाराम' },
  deshmukh: { hi: 'देशमुख', mr: 'देशमुख' },
  sunita: { hi: 'सुनीता', mr: 'सुनीता' },
  dnyaneshwar: { hi: 'ज्ञानेश्वर', mr: 'ज्ञानेश्वर' },
  shinde: { hi: 'शिंदे', mr: 'शिंदे' },
  pandurang: { hi: 'पांडुरंग', mr: 'पांडुरंग' },
  shamrao: { hi: 'शामराव', mr: 'शामराव' },
  kadam: { hi: 'कदम', mr: 'कदम' },
  kavita: { hi: 'कविता', mr: 'कविता' },
  ashok: { hi: 'अशोक', mr: 'अशोक' },
  gaikwad: { hi: 'गायकवाड', mr: 'गायकवाड' },
  ganesh: { hi: 'गणेश', mr: 'गणेश' },
  vithalrao: { hi: 'विठ्ठलराव', mr: 'विठ्ठलराव' },
  pawar: { hi: 'पवार', mr: 'पवार' },
  mahesh: { hi: 'महेश', mr: 'महेश' },
  babanrao: { hi: 'बाबनराव', mr: 'बाबनराव' },
  salunkhe: { hi: 'साळुंखे', mr: 'साळुंखे' },
  santosh: { hi: 'संतोष', mr: 'संतोष' },
  namdeo: { hi: 'नामदेव', mr: 'नामदेव' },
  jagtap: { hi: 'जगताप', mr: 'जगताप' },
};

const consonants: Record<string, string> = {
  dny: 'ज्ञ', jny: 'ज्ञ', ksh: 'क्ष', kh: 'ख', gh: 'घ', chh: 'छ', ch: 'च', jh: 'झ',
  th: 'थ', dh: 'ध', ph: 'फ', bh: 'भ', sh: 'श', zh: 'ष', ny: 'ञ', ng: 'ंग',
  k: 'क', g: 'ग', c: 'क', j: 'ज', t: 'त', d: 'द', p: 'प', b: 'ब', m: 'म',
  n: 'न', y: 'य', r: 'र', l: 'ल', v: 'व', w: 'व', s: 'स', h: 'ह', f: 'फ़',
  z: 'ज़', q: 'क', x: 'क्स',
};

const vowels: Record<string, { independent: string; matra: string }> = {
  aa: { independent: 'आ', matra: 'ा' }, ai: { independent: 'ऐ', matra: 'ै' }, au: { independent: 'औ', matra: 'ौ' },
  ee: { independent: 'ई', matra: 'ी' }, oo: { independent: 'ऊ', matra: 'ू' },
  a: { independent: 'अ', matra: '' }, i: { independent: 'इ', matra: 'ि' },
  e: { independent: 'ए', matra: 'े' }, u: { independent: 'उ', matra: 'ु' },
  o: { independent: 'ओ', matra: 'ो' },
};

const consonantTokens = Object.keys(consonants).sort((a, b) => b.length - a.length);
const vowelTokens = Object.keys(vowels).sort((a, b) => b.length - a.length);

function transliterateWord(word: string): string {
  const source = word.toLowerCase();
  let result = '';
  let pendingConsonant = '';
  let index = 0;

  while (index < source.length) {
    const vowel = vowelTokens.find((token) => source.startsWith(token, index));
    if (vowel) {
      const entry = vowels[vowel];
      result += pendingConsonant ? pendingConsonant + entry.matra : entry.independent;
      pendingConsonant = '';
      index += vowel.length;
      continue;
    }

    const consonant = consonantTokens.find((token) => source.startsWith(token, index));
    if (consonant) {
      if (pendingConsonant) result += `${pendingConsonant}्`;
      pendingConsonant = consonants[consonant];
      index += consonant.length;
      continue;
    }

    if (pendingConsonant) {
      result += pendingConsonant;
      pendingConsonant = '';
    }
    result += word[index];
    index += 1;
  }

  return result + pendingConsonant;
}

/** Display-only phonetic rendering. The stored/login name is never changed. */
export function localizePersonName(name: string | undefined, language: string): string {
  if (!name || !['hi', 'mr'].includes(language.split('-')[0])) return name || '';
  if (/[\u0900-\u097F]/.test(name)) return name;

  const locale = language.split('-')[0] as 'hi' | 'mr';
  return name.replace(/[A-Za-z]+/g, (word) => {
    const known = commonNames[word.toLowerCase()];
    return known ? known[locale] : transliterateWord(word);
  });
}
