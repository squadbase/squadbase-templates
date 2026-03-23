"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export type EChartsWrapperProps = {
  option: EChartsOption;
  height?: string;
  className?: string;
  theme?: string;
};

export function EChartsWrapper({
  option,
  height = "400px",
  className,
  theme,
}: EChartsWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={className}
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#999", fontSize: 14 }}>Loading chart...</span>
      </div>
    );
  }

  return (
    <ReactECharts
      option={option}
      style={{ height }}
      className={className}
      theme={theme}
      notMerge={true}
      opts={{ renderer: "svg" }}
    />
  );
}
