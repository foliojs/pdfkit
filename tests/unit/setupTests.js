import matcher from './toContainChunk';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend(matcher);
expect.extend({ toMatchImageSnapshot });
