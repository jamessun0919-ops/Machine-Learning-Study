import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chapters = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/chapters' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      stage: z.string(),
      category: z.array(z.string()),
      interactiveComponent: z.string().optional(),
      conceptMapImage: image().optional(),
      summary: z
        .object({
          formulas: z.array(z.string()),
          keyStats: z.array(
            z.object({
              label: z.string(),
              value: z.string(),
            })
          ),
          image: image().optional(),
        })
        .optional(),
    }),
});

export const collections = { chapters };
