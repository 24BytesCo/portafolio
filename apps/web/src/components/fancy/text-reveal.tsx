"use client";

import type { JSX } from "react";
import React from "react";
import { Reveal } from "@/components/reveal";

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  wordGap?: string;
  spanClassName?: string;
}

const TextReveal: React.FC<TextRevealProps> = ({
  children,
  className = "",
  as = "div",
  // "0.25rem" fijo en <Reveal> se ve bien en texto pequeño pero deja los
  // titulares grandes con las palabras casi pegadas; en "em" escala con
  // el tamaño de fuente de cada sección.
  wordGap = "0.25em",
  spanClassName,
}) => {
  const generatePhrases = (child: React.ReactNode): string[] => {
    if (typeof child === "string") {
      // Split by words but preserve natural line breaks
      return child.split(/\s+/).filter((word) => word.length > 0);
    } else if (React.isValidElement(child)) {
      const element = child as React.ReactElement & {
        props?: {
          children?: React.ReactNode;
        };
      };

      if (element.props && "children" in element.props) {
        return generatePhrases(element.props.children);
      }
      return [];
    } else if (Array.isArray(child)) {
      return child.flatMap((nestedChild: React.ReactNode) =>
        generatePhrases(nestedChild),
      );
    }
    return [];
  };

  const phrases = generatePhrases(children);

  return (
    <Reveal
      phrases={phrases}
      className={className}
      as={as}
      wordGap={wordGap}
      spanClassName={spanClassName}
    />
  );
};

export default TextReveal;
