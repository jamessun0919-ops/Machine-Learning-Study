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
    nextSlug: 'simple-linear-regression',
  },
  {
    slug: 'simple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'crisp-dm',
    nextSlug: 'multiple-linear-regression',
  },
  {
    slug: 'multiple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'simple-linear-regression',
  },
];
