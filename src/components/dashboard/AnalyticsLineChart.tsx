import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Highcharts from "highcharts";
import HighchartsWrapper from "@/components/charts/HighchartsWrapper";

interface AnalyticsLineChartProps {
  title: string;
  data: Array<{
    date: string;
    value: number;
  }>;
  period?: string;
  onPeriodChange?: (period: string) => void;
  color?: string;
}

const AnalyticsLineChart = ({
  title,
  data,
  period = "week",
  onPeriodChange,
  color = "#F59E0B"
}: AnalyticsLineChartProps) => {
  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
      height: 350,
      backgroundColor: 'transparent',
    },
    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: data.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      labels: {
        style: {
          color: '#6B7280',
          fontSize: '12px',
        },
      },
      gridLineColor: '#F3F4F6',
    },
    yAxis: {
      title: {
        text: '',
      },
      labels: {
        style: {
          color: '#6B7280',
          fontSize: '12px',
        },
        formatter: function() {
          const value = this.value as number;
          if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toString();
        },
      },
      gridLineColor: '#F3F4F6',
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderRadius: 8,
      shadow: {
        color: 'rgba(0, 0, 0, 0.1)',
        offsetX: 0,
        offsetY: 2,
        opacity: 0.1,
        width: 3,
      },
      style: {
        color: '#111827',
      },
      formatter: function() {
        return `<div style="padding: 4px;">
          <strong>${this.x}</strong><br/>
          ${this.series.name}: <strong>${this.y?.toLocaleString()}</strong>
        </div>`;
      },
    },
    plotOptions: {
      line: {
        lineWidth: 3,
        marker: {
          enabled: true,
          radius: 4,
          fillColor: '#FFFFFF',
          lineWidth: 2,
          lineColor: color,
        },
        states: {
          hover: {
            lineWidth: 4,
          },
        },
      },
      area: {
        fillOpacity: 0.3,
      },
    },
    series: [
      {
        name: title,
        type: 'line',
        data: data.map(d => d.value),
        color: color,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, `${color}40`],
            [1, `${color}05`],
          ],
        },
      },
    ],
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-bold text-gray-900">{title}</CardTitle>
        {onPeriodChange && (
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[100px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        <HighchartsWrapper options={chartOptions} />
      </CardContent>
    </Card>
  );
};

export default AnalyticsLineChart;

