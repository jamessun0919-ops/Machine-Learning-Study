import { curriculum, findTopicByName, type CurriculumTopic } from '../config/curriculum';

const paradigmLabels: Record<string, string> = {
  foundational: '基礎',
  supervised: '監督式',
  unsupervised: '非監督式',
  other: '進階',
};

function RelatedLinks({ names, base }: { names: string[]; base: string }) {
  return (
    <p className="knowledge-map__related">
      相關：
      {names.map((name, index) => {
        const related = findTopicByName(name);
        return (
          <span key={name}>
            {index > 0 && '、'}
            {related?.slug ? <a href={`${base}chapters/${related.slug}/`}>{name}</a> : name}
          </span>
        );
      })}
    </p>
  );
}

function TopicItem({ topic, base }: { topic: CurriculumTopic; base: string }) {
  const isBuilt = Boolean(topic.slug);
  return (
    <li className={`knowledge-map__topic ${isBuilt ? 'is-built' : 'is-upcoming'}`}>
      {isBuilt ? (
        <a href={`${base}chapters/${topic.slug}/`}>{topic.name}</a>
      ) : (
        <>
          {topic.name}
          <span className="knowledge-map__badge">即將推出</span>
        </>
      )}
      {topic.relatedTo && topic.relatedTo.length > 0 && (
        <RelatedLinks names={topic.relatedTo} base={base} />
      )}
    </li>
  );
}

export default function CourseKnowledgeMap() {
  const base = import.meta.env.BASE_URL;

  return (
    <div className="knowledge-map">
      {curriculum.map((stageGroup) => (
        <section key={stageGroup.stage} className="knowledge-map__stage">
          <h3 className="knowledge-map__stage-title">
            {stageGroup.stage}
            <span className={`knowledge-map__paradigm-badge is-${stageGroup.paradigm}`}>
              {paradigmLabels[stageGroup.paradigm]}
            </span>
          </h3>
          <ul className="knowledge-map__topics">
            {stageGroup.topics.map((topic) => (
              <TopicItem key={topic.name} topic={topic} base={base} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
