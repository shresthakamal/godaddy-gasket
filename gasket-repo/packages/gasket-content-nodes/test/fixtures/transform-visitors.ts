import { ContentNode, PartType } from '../../src';
import { trackingToUnderscore } from './simple-delegate';
import { process } from './complex-delegate';
export const simpleContentVisitor = {
  [PartType.node]: (part): ContentNode => trackingToUnderscore(part)
};
export const complexContentVisitor = {
  [PartType.node]: (part): ContentNode => process(part)
};
