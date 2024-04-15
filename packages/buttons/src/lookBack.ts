import { LookBackFunction } from "llm-ui/components";
import { Button, parseCompleteButtons } from "./parse";

const buttonsToVisibleText = (buttons: string[] | undefined): string =>
  buttons?.join(" ") ?? "";

const buttonsToXml = (buttons: Button[] | undefined): string => {
  if (!buttons) {
    return "";
  }
  const buttonXmlTags = buttons.map((button) => `<button>${button}</button>`);
  return `<buttons>${buttonXmlTags.join("")}</buttons>`;
};

export const buttonsLookBack = (): LookBackFunction => {
  return ({ output, visibleTextLengthTarget }) => {
    const buttons = parseCompleteButtons(output)?.reduce((acc, button) => {
      const visibleTextSoFar = buttonsToVisibleText(acc);
      if (visibleTextSoFar.length >= visibleTextLengthTarget) {
        return acc;
      }
      return [
        ...acc,
        button.slice(0, visibleTextLengthTarget - visibleTextSoFar.length - 1), // 1 is for the space
      ];
    }, [] as Button[]);
    return {
      output: buttonsToXml(buttons),
      visibleText: buttonsToVisibleText(buttons),
    };
  };
};
