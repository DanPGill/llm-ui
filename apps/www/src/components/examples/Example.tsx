import { useStreamFastSmooth } from "@/hooks/useLLMExamples";
import { cn } from "@/lib/utils";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, type LLMOutputProps } from "llm-ui/components";
import type { UseStreamWithProbabilitiesOptions } from "llm-ui/hooks";
import { useState, type ReactNode } from "react";
import type { SetRequired } from "type-fest";
import { Loader } from "../ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { H2 } from "../ui/Text";
import { codeBlockBlock } from "./CodeBlock";
import { Controls } from "./Controls";
import { Markdown } from "./Markdown";
import { throttle } from "./throttle";

const SideBySideContainer: React.FC<{
  className?: string;
  header: ReactNode;
  children: ReactNode;
}> = ({ className, header, children }) => {
  return (
    <div className={cn(className, "flex-1 ")}>
      {header}
      {children}
    </div>
  );
};

const OutputBackground: React.FC<{
  className?: string;
  children: ReactNode;
  height: number;
}> = ({ className, height, children }) => (
  <div
    style={{ height }}
    className={cn("bg-background text-left p-6 flex flex- flex-col", className)}
  >
    {children}
  </div>
);

type OutputTabsProps = {
  output: string;
  llmUi?: ReactNode;
  className?: string;
  backgroundClassName?: string;
  height: number;
};

type Tab = "markdown" | "raw" | "llm-ui";
const OutputTabs: React.FC<
  OutputTabsProps & {
    tabs?: Tab[];
  }
> = ({
  className,
  backgroundClassName,
  height,
  output,
  llmUi,
  tabs = ["llm-ui", "markdown", "raw"],
}) => {
  const showMarkdown = tabs.includes("markdown");
  const showRaw = tabs.includes("raw");
  const showLlmUi = tabs.includes("llm-ui") && llmUi;
  const defaultValue = tabs[0];
  return (
    <Tabs defaultValue={defaultValue} className={className}>
      {showLlmUi && (
        <TabsContent
          value="llm-ui"
          forceMount // keepMounted so we keep streaming the content
          className="data-[state=active]:block hidden"
        >
          <div style={{ height }}>{llmUi}</div>
        </TabsContent>
      )}
      {showMarkdown && (
        <TabsContent value="markdown">
          <OutputBackground className={backgroundClassName} height={height}>
            <Markdown isComplete={false} llmOutput={output} />
          </OutputBackground>
        </TabsContent>
      )}
      {showRaw && (
        <TabsContent value="raw">
          <OutputBackground className={backgroundClassName} height={height}>
            <pre className="overflow-x-auto not-shiki">{output}</pre>
          </OutputBackground>
        </TabsContent>
      )}
      {tabs.length > 1 && (
        <div className="flex flex-row items-center mt-2 justify-center md:justify-start">
          <TabsList>
            {showLlmUi && <TabsTrigger value="llm-ui">llm-ui</TabsTrigger>}
            {showMarkdown && (
              <TabsTrigger value="markdown">markdown</TabsTrigger>
            )}
            {showRaw && <TabsTrigger value="raw">raw</TabsTrigger>}
          </TabsList>
        </div>
      )}
    </Tabs>
  );
};

export type ExampleProps = {
  className?: string;
  outputHeight: number;
  tabs: Tab[];
  backgroundClassName?: string;
  showPlayPause?: boolean;
} & UseExampleProps;

const LLMUI = ({
  isStreamFinished,
  height,
  isPlaying,
  backgroundClassName,
  ...props
}: SetRequired<Partial<LLMOutputProps>, "isStreamFinished" | "llmOutput"> & {
  height: number;
  backgroundClassName?: string;
  isPlaying: boolean;
}) => {
  const { blockMatches, visibleText } = useLLMOutput({
    blocks: [codeBlockBlock],
    fallbackBlock: {
      component: Markdown,
      lookBack: markdownLookBack,
    },
    throttle,
    isStreamFinished,
    ...props,
  });
  const blocks = blockMatches.map((blockMatch, index) => {
    const Component = blockMatch.block.component;
    return (
      <Component
        key={index}
        llmOutput={blockMatch.match.outputAfterLookback}
        isComplete={isStreamFinished}
      />
    );
  });
  return (
    <OutputBackground className={backgroundClassName} height={height}>
      {visibleText.length === 0 && isPlaying ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader />
        </div>
      ) : (
        blocks
      )}
    </OutputBackground>
  );
};
type UseExampleProps = {
  example: string;
  options?: Partial<UseStreamWithProbabilitiesOptions>;
};
const useExample = ({ example, options = {} }: UseExampleProps) => {
  const [delayMultiplier, setDelayMultiplier] = useState(
    options.delayMultiplier ?? 1,
  );
  const result = useStreamFastSmooth(example, {
    loop: true,
    autoStart: true,
    autoStartDelayMs: 0,
    loopDelayMs: 3000,
    ...options,
    delayMultiplier,
  });
  return { ...result, setDelayMultiplier, delayMultiplier };
};

export const ExampleTabs: React.FC<ExampleProps> = ({
  example,
  outputHeight,
  tabs,
  className,
  backgroundClassName,
  options,
  showPlayPause = true,
}) => {
  const {
    output,
    isStreamFinished,
    isPlaying,
    loopIndex,
    setDelayMultiplier,
    delayMultiplier,
    pause,
    start,
  } = useExample({ example, options });
  const llmUi = (
    <LLMUI
      isStreamFinished={isStreamFinished}
      llmOutput={output}
      loopIndex={loopIndex}
      height={outputHeight}
      backgroundClassName={backgroundClassName}
      isPlaying={isPlaying}
    />
  );
  return (
    <div className={cn("grid grid-cols-1", className)}>
      <OutputTabs
        className="hidden md:block"
        output={output}
        llmUi={llmUi}
        tabs={tabs}
        height={outputHeight}
        backgroundClassName={backgroundClassName}
      />
      <div className="flex flex-col items-center">
        <Controls
          className="md:-mt-6"
          delayMultiplier={delayMultiplier}
          onDelayMultiplier={setDelayMultiplier}
          onPause={pause}
          onStart={start}
          showPlayPause={showPlayPause}
          isPlaying={isPlaying}
        />
      </div>
    </div>
  );
};

export type ExampleSideBySideProps = ExampleProps & {
  showHeaders?: boolean;
};

export const ExampleSideBySide: React.FC<ExampleSideBySideProps> = ({
  className,
  showHeaders = false,
  tabs = ["llm-ui", "markdown", "raw"],
  outputHeight,
  backgroundClassName,
  showPlayPause = true,
  ...props
}) => {
  if (!tabs.includes("llm-ui")) {
    throw new Error("llm-ui tab is required for ExampleSideBySide");
  }
  const {
    output,
    isStreamFinished,
    pause,
    start,
    isPlaying,
    loopIndex,
    setDelayMultiplier,
    delayMultiplier,
  } = useExample(props);
  const llmUi = (
    <LLMUI
      isStreamFinished={isStreamFinished}
      llmOutput={output}
      loopIndex={loopIndex}
      height={outputHeight}
      backgroundClassName={backgroundClassName}
      isPlaying={isPlaying}
    />
  );
  return (
    <div className={className}>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
        <SideBySideContainer
          header={
            showHeaders && (
              <H2 className="mb-8 text-muted-foreground text-center">
                LLM Output
              </H2>
            )
          }
        >
          <OutputTabs
            className="hidden md:block"
            output={output}
            tabs={tabs.filter((tab) => tab !== "llm-ui")}
            height={outputHeight}
            backgroundClassName={backgroundClassName}
          />
          <OutputTabs
            className="md:hidden"
            output={output}
            llmUi={llmUi}
            tabs={tabs}
            height={outputHeight}
            backgroundClassName={backgroundClassName}
          />
        </SideBySideContainer>
        <SideBySideContainer
          className="hidden md:block"
          header={
            showHeaders && (
              <H2 className="mb-8 text-center">
                <span className="font-black text-gradient_indigo-purple">
                  llm-ui
                </span>{" "}
                ✨
              </H2>
            )
          }
        >
          {llmUi}
        </SideBySideContainer>
      </div>
      <Controls
        className={tabs.length > 2 ? "md:-mt-8" : "mt-4"}
        delayMultiplier={delayMultiplier}
        onDelayMultiplier={setDelayMultiplier}
        isPlaying={isPlaying}
        showPlayPause={showPlayPause}
        onPause={pause}
        onStart={start}
      />
    </div>
  );
};
