export interface ChapterMeta {
  slug: string;
  stage: string;
  prerequisiteSlug?: string;
  nextSlug?: string;
}

export const chapterOrder: ChapterMeta[] = [
  {
    slug: 'machine-learning-introduction',
    stage: '課程導覽',
    nextSlug: 'crisp-dm',
  },
  {
    slug: 'crisp-dm',
    stage: '課程導覽',
    prerequisiteSlug: 'machine-learning-introduction',
    nextSlug: 'feature-engineering-standardization',
  },
  {
    slug: 'feature-engineering-standardization',
    stage: '方法論基礎',
    prerequisiteSlug: 'crisp-dm',
    nextSlug: 'train-test-split-cross-validation',
  },
  {
    slug: 'train-test-split-cross-validation',
    stage: '方法論基礎',
    prerequisiteSlug: 'feature-engineering-standardization',
    nextSlug: 'overfitting-underfitting-bias-variance',
  },
  {
    slug: 'overfitting-underfitting-bias-variance',
    stage: '方法論基礎',
    prerequisiteSlug: 'train-test-split-cross-validation',
    nextSlug: 'simple-linear-regression',
  },
  {
    slug: 'simple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'overfitting-underfitting-bias-variance',
    nextSlug: 'multiple-linear-regression',
  },
  {
    slug: 'multiple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'simple-linear-regression',
  },
];
