export interface CurriculumTopic {
  name: string;
  slug?: string;
  relatedTo?: string[];
}

export type CurriculumParadigm = 'foundational' | 'supervised' | 'unsupervised' | 'other';

export interface CurriculumStage {
  stage: string;
  paradigm: CurriculumParadigm;
  topics: CurriculumTopic[];
}

export const curriculum: CurriculumStage[] = [
  {
    stage: '階段一：課程導覽',
    paradigm: 'foundational',
    topics: [
      { name: '機器學習介紹（含全課程知識地圖）', slug: 'machine-learning-introduction' },
      { name: 'CRISP-DM 資料分析方法', slug: 'crisp-dm' },
    ],
  },
  {
    stage: '階段二：方法論基礎',
    paradigm: 'foundational',
    topics: [
      { name: '特徵工程與標準化', slug: 'feature-engineering-standardization' },
      { name: '訓練/測試切分與交叉驗證', slug: 'train-test-split-cross-validation' },
      { name: '過擬合/欠擬合與偏差-變異數權衡', slug: 'overfitting-underfitting-bias-variance' },
    ],
  },
  {
    stage: '階段三：監督式學習－迴歸',
    paradigm: 'supervised',
    topics: [
      { name: 'Simple Linear Regression（簡單線性回歸）', slug: 'simple-linear-regression' },
      {
        name: 'Multiple Linear Regression（多元線性回歸）',
        slug: 'multiple-linear-regression',
        relatedTo: ['Logistic Regression（邏輯斯迴歸）'],
      },
      {
        name: 'Polynomial Regression（多項式回歸）',
        slug: 'polynomial-regression',
        relatedTo: ['過擬合/欠擬合與偏差-變異數權衡'],
      },
      {
        name: 'Ridge Regression（Ridge 迴歸，正則化）',
        slug: 'ridge-regression',
        relatedTo: [
          'Polynomial Regression（多項式回歸）',
          '特徵工程與標準化',
          'Lasso Regression（Lasso 迴歸，正則化）',
        ],
      },
      {
        name: 'Lasso Regression（Lasso 迴歸，正則化）',
        slug: 'lasso-regression',
        relatedTo: ['Ridge Regression（Ridge 迴歸，正則化）'],
      },
      {
        name: 'Logistic Regression（邏輯斯迴歸）',
        slug: 'logistic-regression',
        relatedTo: ['Multiple Linear Regression（多元線性回歸）'],
      },
    ],
  },
  {
    stage: '階段四：監督式學習－分類',
    paradigm: 'supervised',
    topics: [
      { name: 'KNN（K 最近鄰）', relatedTo: ['K-Means'] },
      { name: 'Naive Bayes（樸素貝氏）' },
      { name: 'Support Vector Machine（SVM）' },
      {
        name: 'Decision Tree（決策樹）',
        relatedTo: ['Bagging（Random Forest，隨機森林）', 'Boosting（AdaBoost / Gradient Boosting）'],
      },
    ],
  },
  {
    stage: '階段五：集成方法',
    paradigm: 'supervised',
    topics: [
      { name: 'Bagging（Random Forest，隨機森林）', relatedTo: ['Decision Tree（決策樹）'] },
      { name: 'Boosting（AdaBoost / Gradient Boosting）', relatedTo: ['Decision Tree（決策樹）'] },
    ],
  },
  {
    stage: '階段六：非監督式學習',
    paradigm: 'unsupervised',
    topics: [
      { name: 'PCA（主成分分析）', relatedTo: ['K-Means'] },
      { name: 'K-Means', relatedTo: ['PCA（主成分分析）', 'KNN（K 最近鄰）'] },
      { name: 'Hierarchical Clustering（階層式分群）' },
      { name: 'DBSCAN' },
    ],
  },
  {
    stage: '階段七：神經網路',
    paradigm: 'other',
    topics: [{ name: '神經網路' }],
  },
  {
    stage: '階段八：模型解釋',
    paradigm: 'foundational',
    topics: [{ name: '模型可解釋性' }],
  },
];

export const allTopics: CurriculumTopic[] = curriculum.flatMap((s) => s.topics);

export function findTopicByName(name: string): CurriculumTopic | undefined {
  return allTopics.find((t) => t.name === name);
}
