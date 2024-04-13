import { delay } from "../../lib/delay";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TokenWithDelay,
  UseStreamResponse,
  UseStreamTokenArrayOptions,
} from "./types";

export const useStreamTokenArrayOptionsDefaultOptions: UseStreamTokenArrayOptions =
  {
    autoStartDelayMs: 0,
    autoStart: true,
    loop: false,
    loopDelayMs: 1000,
    delayMultiplier: 1,
  };

export const useStreamTokenArray = (
  tokenArray: TokenWithDelay[],
  userOptions?: Partial<UseStreamTokenArrayOptions>,
): UseStreamResponse => {
  const nextTokenRef = useRef<() => void>();
  const options: UseStreamTokenArrayOptions = useMemo(
    () => ({
      ...useStreamTokenArrayOptionsDefaultOptions,
      ...(userOptions ?? {}),
    }),
    [userOptions],
  );
  const [output, setOutput] = useState<string>("");
  const [loopIndex, setLoopIndex] = useState<number>(0);

  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndex = useRef<number>(0);

  const pause = useCallback(() => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setOutput("");
    setLoopIndex((prev) => prev + 1);
    pause();
    currentIndex.current = 0;
  }, []);

  const nextToken = useCallback(async () => {
    if (!nextTokenRef.current) {
      return;
    }
    const index = currentIndex.current;
    const isFinished = index >= tokenArray.length;
    if (isFinished) {
      if (options.loop) {
        await delay(options.loopDelayMs);
        reset();
        nextTokenRef.current();
      }
    } else {
      const { token, delayMs } = tokenArray[index];
      setOutput((prevOutput) => `${prevOutput}${token}`);
      currentIndex.current = index + 1;
      clearTimeoutRef.current = setTimeout(
        nextTokenRef.current,
        delayMs * options.delayMultiplier,
      );
    }
  }, [options, setOutput, reset, tokenArray]);

  useEffect(() => {
    nextTokenRef.current = nextToken;
  });

  const start = useCallback(() => {
    if (clearTimeoutRef.current) {
      return;
    }
    nextToken();
  }, []);

  useEffect(() => {
    if (options.autoStart) {
      setTimeout(start, options.autoStartDelayMs);
    }
  }, []);
  const finishedOutput = tokenArray.map((t) => t.token).join("");
  const isFinished = output.length === finishedOutput.length;
  return {
    output,
    reset,
    pause,
    start,
    isStreamStarted: output.length > 0,
    isStreamFinished: isFinished,
    loopIndex,
  };
};