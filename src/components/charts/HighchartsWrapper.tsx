import { useEffect, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useTheme } from "next-themes";

interface HighchartsWrapperProps {
  options: Highcharts.Options;
  containerProps?: HighchartsReact.Props;
}

const HighchartsWrapper: React.FC<HighchartsWrapperProps> = ({ options, containerProps }) => {
  const { theme } = useTheme();
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    if (chartRef.current?.chart) {
      const isDark = theme === "dark";
      chartRef.current.chart.update({
        chart: {
          backgroundColor: isDark ? "hsl(160 12% 10%)" : "#ffffff",
        },
        title: {
          style: {
            color: isDark ? "hsl(0 0% 98%)" : "hsl(160 8% 15%)",
          },
        },
        xAxis: {
          labels: {
            style: {
              color: isDark ? "hsl(0 0% 98%)" : "hsl(160 8% 15%)",
            },
          },
          title: {
            style: {
              color: isDark ? "hsl(0 0% 98%)" : "hsl(160 8% 15%)",
            },
          },
        },
        yAxis: {
          labels: {
            style: {
              color: isDark ? "hsl(0 0% 98%)" : "hsl(160 8% 15%)",
            },
          },
          title: {
            style: {
              color: isDark ? "hsl(0 0% 98%)" : "hsl(160 8% 15%)",
            },
          },
        },
        legend: {
          itemStyle: {
            color: isDark ? "hsl(0 0% 98%)" : "hsl(160 8% 15%)",
          },
        },
      });
    }
  }, [theme]);

  const chartOptions: Highcharts.Options = {
    ...options,
    chart: {
      ...options.chart,
      backgroundColor: theme === "dark" ? "hsl(160 12% 10%)" : "#ffffff",
    },
    credits: {
      enabled: false,
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef} {...containerProps} />;
};

export default HighchartsWrapper;

