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
  },
  {
    slug: 'simple-linear-regression',
    stage: '監督式學習－迴歸',
    nextSlug: 'multiple-linear-regression',
  },
  {
    slug: 'multiple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'simple-linear-regression',
  },
];
