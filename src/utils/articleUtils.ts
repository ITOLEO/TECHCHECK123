import { Guide, ArticleBlock, GuideStep } from '../types';

export function normalizeGuideBlocks(guide: Guide): ArticleBlock[] {
  if (guide.blocks && guide.blocks.length > 0) {
    return guide.blocks;
  }

  // Convert legacy steps / fields into structured document blocks
  const blocks: ArticleBlock[] = [];

  if (guide.intro) {
    blocks.push({
      id: `block-intro-${guide.id}`,
      type: 'paragraph',
      content: guide.intro,
    });
  }

  if (guide.callout) {
    blocks.push({
      id: `block-callout-${guide.id}`,
      type: 'callout',
      content: guide.callout,
    });
  }

  if (Array.isArray(guide.steps)) {
    guide.steps.forEach((step, idx) => {
      blocks.push({
        id: `block-step-heading-${guide.id}-${idx}`,
        type: 'heading',
        level: 2,
        content: step.title ? (step.number && !step.title.startsWith(step.number) ? `${step.number} ${step.title}` : step.title) : `Section 0${idx + 1}`,
      });

      if (step.text) {
        blocks.push({
          id: `block-step-text-${guide.id}-${idx}`,
          type: 'paragraph',
          content: step.text,
          recommendedProductSlug: step.recommendedProductSlug,
        });
      }

      if (step.image) {
        blocks.push({
          id: `block-step-image-${guide.id}-${idx}`,
          type: 'image',
          src: step.image,
          caption: step.title || 'Setup visualization',
          alt: step.title || 'Section Image',
        });
      }
    });
  }

  if (guide.summary) {
    blocks.push({
      id: `block-summary-${guide.id}`,
      type: 'paragraph',
      content: guide.summary,
    });
  }

  return blocks;
}

export function syncBlocksToLegacyGuide(guide: Guide, blocks: ArticleBlock[]): Guide {
  // Re-derive legacy steps array for backwards compatibility
  const steps: GuideStep[] = [];
  let currentStep: Partial<GuideStep> | null = null;
  let stepCount = 1;

  blocks.forEach((block) => {
    if (block.type === 'heading') {
      if (currentStep && (currentStep.title || currentStep.text)) {
        steps.push({
          number: currentStep.number || (stepCount < 10 ? `0${stepCount}` : `${stepCount}`),
          title: currentStep.title || '',
          text: currentStep.text || '',
          image: currentStep.image,
          recommendedProductSlug: currentStep.recommendedProductSlug,
        });
        stepCount++;
      }
      currentStep = {
        number: stepCount < 10 ? `0${stepCount}` : `${stepCount}`,
        title: block.content ? block.content.replace(/^\d+\s*/, '') : '',
      };
    } else if (block.type === 'paragraph' && currentStep) {
      currentStep.text = currentStep.text ? `${currentStep.text}\n\n${block.content || ''}` : block.content || '';
      if (block.recommendedProductSlug) {
        currentStep.recommendedProductSlug = block.recommendedProductSlug;
      }
    } else if (block.type === 'image' && currentStep) {
      if (!currentStep.image) {
        currentStep.image = block.src;
      }
    }
  });

  if (currentStep && (currentStep.title || currentStep.text)) {
    steps.push({
      number: currentStep.number || (stepCount < 10 ? `0${stepCount}` : `${stepCount}`),
      title: currentStep.title || '',
      text: currentStep.text || '',
      image: currentStep.image,
      recommendedProductSlug: currentStep.recommendedProductSlug,
    });
  }

  return {
    ...guide,
    blocks,
    steps: steps.length > 0 ? steps : guide.steps,
  };
}
