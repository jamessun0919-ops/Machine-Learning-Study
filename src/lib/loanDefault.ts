export interface LoanRecord {
  debtToIncomeRatio: number;
  creditScore: number;
  isDefault: 0 | 1;
}

const N = 200;

// 決定性線性同餘生成器（LCG，非 Math.random()），確保合成資料集在每次建置都完全一致可重現。
function makeLcg(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

// Box-Muller transform：把兩個均勻分布亂數轉成一個常態分布亂數，並快取另一個副產品值供下次呼叫使用。
function makeGaussian(rng: () => number): (mean: number, std: number) => number {
  let spare: number | null = null;
  return function next(mean: number, std: number): number {
    if (spare !== null) {
      const value = spare;
      spare = null;
      return mean + std * value;
    }
    let u1 = 0;
    do {
      u1 = rng();
    } while (u1 <= 1e-12);
    const u2 = rng();
    const mag = Math.sqrt(-2 * Math.log(u1));
    spare = mag * Math.sin(2 * Math.PI * u2);
    return mean + std * mag * Math.cos(2 * Math.PI * u2);
  };
}

function clip(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

const rng = makeLcg(42);
const gaussian = makeGaussian(rng);

const rawDti: number[] = [];
const rawCreditScore: number[] = [];
for (let i = 0; i < N; i++) {
  rawDti.push(clip(gaussian(0.38, 0.16), 0.05, 0.85));
  rawCreditScore.push(clip(gaussian(620, 85), 350, 850));
}

// 真實的底層生成關係（只用於產生標籤，不是模型要學習還原的「正確答案」，且不對外匯出）：
// 負債比越高、信用分數越低，違約對數勝算越高。TRUE_INTERCEPT 是用二分搜尋校準到母體
// 平均違約機率 25% 所得到的值（設計階段驗證腳本算出，此處直接沿用結果，不在此重新搜尋）。
const TRUE_INTERCEPT = 7.4149621442728595;
const TRUE_DTI_WEIGHT = 11.0;
const TRUE_CREDIT_WEIGHT = -0.022;

export const loans: LoanRecord[] = Array.from({ length: N }, (_, i) => {
  const z = TRUE_INTERCEPT + TRUE_DTI_WEIGHT * rawDti[i] + TRUE_CREDIT_WEIGHT * rawCreditScore[i];
  const probability = sigmoid(z);
  const isDefault: 0 | 1 = rng() < probability ? 1 : 0;
  return { debtToIncomeRatio: rawDti[i], creditScore: rawCreditScore[i], isDefault };
});

export const fieldLabels: Record<'debtToIncomeRatio' | 'creditScore', string> = {
  debtToIncomeRatio: '負債佔收入比（Debt-to-Income Ratio）',
  creditScore: '信用分數（Credit Score）',
};

// 固定仿射排列 i -> (i*97+13) mod 200（gcd(97,200)=1，為合法排列）。與 dataSplit.ts 既有
// 的 50 筆版本（不同公式、不同長度）各自獨立，不修改、也不依賴那個檔案。
export const SHUFFLED_INDICES: number[] = Array.from({ length: N }, (_, i) => (i * 97 + 13) % N);

const TRAIN_COUNT = 150;
export const trainIndices: number[] = SHUFFLED_INDICES.slice(0, TRAIN_COUNT);
export const testIndices: number[] = SHUFFLED_INDICES.slice(TRAIN_COUNT);
