import { prefillZiyadahBerikutnya, bangunUrutanHafalan } from './src/lib/quranMapper'
const hendriSeq = bangunUrutanHafalan([30, 29, 28]);
const sudiSeq = bangunUrutanHafalan([30, 29]);
console.log('Hendri next:', prefillZiyadahBerikutnya({ surahNomor: 66, ayat: 12 }, hendriSeq));
console.log('Sudi next:', prefillZiyadahBerikutnya({ surahNomor: 77, ayat: 50 }, sudiSeq));
