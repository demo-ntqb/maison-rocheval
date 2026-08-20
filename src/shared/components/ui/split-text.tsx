"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/shared/lib/utils";

type SupportedTags = "div" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "section" | "article" | "header" | "footer" | "nav";

const motionComponents = {
  div: motion.div,
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  p: motion.p,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  footer: motion.footer,
  nav: motion.nav,
} as const;

interface SplitTextProps extends Omit<HTMLMotionProps<"div">, "children" | "as"> {
  children: string;
  /** Thẻ HTML bọc ngoài (mặc định: "div") */
  as?: SupportedTags;
  /** Tách text theo từ (words) hoặc ký tự (chars) */
  by?: "words" | "chars";
  /** Độ trễ chạy animation giữa mỗi phần tử (ms) */
  stagger?: number;
  /** Độ trễ ban đầu trước khi bắt đầu chạy (ms) */
  delay?: number;
  /** Thời gian chạy animation của mỗi phần tử (ms) */
  duration?: number;
  /** Kiểu hoạt họa */
  animation?: "slide-up" | "fade" | "slide-up-fade";
  /** Ngưỡng hiển thị (0 đến 1) để kích hoạt in-view */
  threshold?: number;
  /** Lề viewport để kích hoạt in-view (ví dụ: "0px 0px -10% 0px") */
  margin?: string;
}

export function SplitText({
  children,
  as = "div",
  by = "words",
  stagger = 30,
  delay = 0,
  duration = 600,
  animation = "slide-up-fade",
  threshold = 0.05,
  margin = "0px 0px -8% 0px",
  className,
  ...props
}: SplitTextProps) {
  const shouldReduceMotion = useReducedMotion();

  // Lấy Motion Component động từ bảng ánh xạ tĩnh ngoài render
  const MotionComponent = motionComponents[as] || motion.div;

  // Định nghĩa các variants cho container (để kích hoạt stagger)
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : stagger / 1000,
        delayChildren: shouldReduceMotion ? 0 : delay / 1000,
      },
    },
  };

  // Định nghĩa các variants cho các phần tử con (từ/ký tự)
  const itemVariants = {
    hidden: {
      y: shouldReduceMotion || animation === "fade" ? 0 : "110%",
      opacity: shouldReduceMotion || animation === "slide-up" ? 1 : 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : duration / 1000,
        ease: [0.215, 0.61, 0.355, 1] as const, // easeOutCubic
      },
    },
  };

  const lines = children.split("\n");

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold, margin }}
      className={cn("select-none", className)}
      {...props}
    >
      <span aria-hidden="true" className="contents">
        {by === "words" ? (
          lines.map((line, lineIdx) => {
            const lineWords = line.split(" ");
            return (
              <span key={lineIdx} className="block">
                {lineWords.map((word, wordIdx) => (
                  <span
                    key={wordIdx}
                    className="inline-block whitespace-nowrap overflow-hidden"
                    style={wordIdx < lineWords.length - 1 ? { marginRight: "0.25em" } : undefined}
                  >
                    <motion.span
                      variants={itemVariants}
                      className="inline-block"
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </span>
            );
          })
        ) : (
          lines.map((line, lineIdx) => {
            const lineWords = line.split(" ");
            return (
              <span key={lineIdx} className="block">
                {lineWords.map((word, wordIdx) => (
                  <span
                    key={wordIdx}
                    className="inline-block whitespace-nowrap"
                    style={wordIdx < lineWords.length - 1 ? { marginRight: "0.25em" } : undefined}
                  >
                    {word.split("").map((char, charIdx) => (
                      <span key={charIdx} className="inline-block overflow-hidden">
                        <motion.span
                          variants={itemVariants}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                      </span>
                    ))}
                  </span>
                ))}
              </span>
            );
          })
        )}
      </span>
      {/* Văn bản liền mạch cho Assistive Technologies */}
      <span className="sr-only">{children}</span>
    </MotionComponent>
  );
}
