// Ambient typings to make custom Jest matchers available to the TS language server in tests.
// No external @types packages required.

type PartialExceptTheseRequired<T, K extends keyof T> = Partial<T> &
  Pick<Required<T>, K>;

declare global {
  // Minimal shape of a TextStream used by tests' helpers
  interface TextStream {
    text: string;
    font: string;
    fontSize: number;
  }

  type TextStreamMatcher = PartialExceptTheseRequired<TextStream, 'text'>;

  namespace jest {
    interface Matchers<R> {
      // Expect the PDF data array to contain a specific chunk sequence
      toContainChunk(chunk: Array<string | RegExp>): R;

      // Expect the PDF data array to contain a text stream matching the TextStream
      toContainText(textStream: TextStreamMatcher): R;
    }
  }
}

export {};
