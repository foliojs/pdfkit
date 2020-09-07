import matcher from './toContainChunk';
import { setupJestScreenshot } from 'jest-screenshot';

expect.extend(matcher);
setupJestScreenshot();
