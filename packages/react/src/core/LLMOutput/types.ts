export type LLMOutputMatch = {
  startIndex: number;
  endIndex: number;
  outputRaw: string;
};

export type LLMOutputMatchWithLookBack = LLMOutputMatch & {
  outputAfterLookback: string;
  visibleText: string;
};

export type MaybeLLMOutputMatch = LLMOutputMatch | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LLMOutputComponent<Props = any> = React.FC<
  { llmOutput: string; isComplete: boolean } & Props
>;

export type LLMOutputMatcher = (llmOutput: string) => MaybeLLMOutputMatch;

export type LookBack = {
  output: string;
  visibleText: string;
};

export type LookBackFunctionParams = {
  output: string;
  isComplete: boolean;
  visibleTextLengthTarget: number;
  isStreamFinished: boolean;
};

export type LookBackFunction = (params: LookBackFunctionParams) => LookBack;

export type LLMOutputFallbackBlock = {
  component: LLMOutputComponent;
  lookBack: LookBackFunction;
};

export type LLMOutputBlock = {
  isPartialMatch: LLMOutputMatcher;
  isCompleteMatch: LLMOutputMatcher;
} & LLMOutputFallbackBlock;

export type ThrottleParams = {
  outputRaw: string;
  outputRendered: string;
  outputAll: string;
  visibleText: string;
  visibleTextAll: string;
  isStreamFinished: boolean;
  frameTime: DOMHighResTimeStamp;
  frameTimePrevious: DOMHighResTimeStamp | undefined;
  startStreamTime: DOMHighResTimeStamp;
  finishStreamTime: DOMHighResTimeStamp | undefined;
  visibleTextLengthsAll: number[];
  outputLengths: number[];
  visibleTextIncrements: number[];
};

export type ThrottleResponse = {
  visibleTextIncrement: number;
};

export type ThrottleFunction = (params: ThrottleParams) => ThrottleResponse;