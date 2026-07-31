import { describe, it, expect } from 'vitest';
import { curriculum, allTopics, findTopicByName } from './curriculum';

describe('curriculum', () => {
  it('has exactly 8 stages, matching dir.txt', () => {
    expect(curriculum).toHaveLength(8);
  });

  it('stage order matches dir.txt', () => {
    expect(curriculum[0].stage).toBe('階段一：課程導覽');
    expect(curriculum[2].stage).toBe('階段三：監督式學習－迴歸');
    expect(curriculum[7].stage).toBe('階段八：模型解釋');
  });

  it('every relatedTo reference points to an existing topic name', () => {
    allTopics.forEach((topic) => {
      (topic.relatedTo ?? []).forEach((relatedName) => {
        expect(
          findTopicByName(relatedName),
          `"${topic.name}" 的關聯項目 "${relatedName}" 找不到對應主題`
        ).toBeDefined();
      });
    });
  });

  it('marks exactly the five currently-built chapters as having a slug', () => {
    const builtNames = allTopics.filter((t) => t.slug).map((t) => t.name);
    expect(builtNames).toEqual([
      '機器學習介紹（含全課程知識地圖）',
      'CRISP-DM 資料分析方法',
      '特徵工程與標準化',
      'Simple Linear Regression（簡單線性回歸）',
      'Multiple Linear Regression（多元線性回歸）',
    ]);
  });

  it('findTopicByName returns undefined for unknown names', () => {
    expect(findTopicByName('不存在的主題')).toBeUndefined();
  });
});
