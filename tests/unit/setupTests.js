import toContainChunk from './toContainChunk';
import toContainText from './toContainText';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend(toContainChunk);
expect.extend(toContainText);
expect.extend({ toMatchImageSnapshot });
