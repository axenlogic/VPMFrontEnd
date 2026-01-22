import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Highcharts from "highcharts";
import HighchartsWrapper from "@/components/charts/HighchartsWrapper";

interface BreakdownItem {
  name: string;
  value: number;
  percentage: number;
  count: number;
  total: number;
}

interface BreakdownDonutChartProps {
  title: string;
  data: BreakdownItem[];
  period?: string;
  onPeriodChange?: (period: string) => void;
  totalLabel?: string;
  colors?: string[];
}

const BreakdownDonutChart = ({
  title,
  data,
  period = "week",
  onPeriodChange,
  totalLabel = "Total",
  colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]
}: BreakdownDonutChartProps) => {
  const totalValue = data.reduce((sum, item) => sum + item.total, 0);

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      height: 320,
      backgroundColor: 'transparent',
      spacing: [0, 0, 0, 0],
    },
    title: {
      text: '',
    },
    credits: {
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
        fontFamily: 'Inter, sans-serif',
      },
      formatter: function() {
        const point = this.point as any;
        return `<div style="padding: 4px;">
          <strong>${point.name}</strong><br/>
          Percentage: <strong>${point.percentage.toFixed(2)}%</strong><br/>
          Count: <strong>${point.count.toLocaleString()}</strong><br/>
          Total: <strong>${point.total.toLocaleString()}</strong>
        </div>`;
      },
    },
    plotOptions: {
      pie: {
        innerSize: '60%',
        dataLabels: {
          enabled: false,
        },
        showInLegend: false,
        colors: colors,
      },
    },
    series: [
      {
        name: title,
        type: 'pie',
        data: data.map((item, index) => ({
          name: item.name,
          y: item.percentage,
          count: item.count,
          total: item.total,
          color: colors[index % colors.length],
        })),
        center: ['50%', '50%'],
        size: '85%',
      },
    ],
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <p className="text-xs text-gray-500">School distribution summary</p>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-6">
          {/* Donut Chart with Center Text - Left Aligned */}
          <div className="relative w-full lg:w-[50%] flex-shrink-0 flex items-center justify-center" style={{ minHeight: '320px' }}>
            <div className="relative w-full" style={{ height: '320px' }}>
              <HighchartsWrapper options={chartOptions} />
              {/* Center Text Overlay - Positioned relative to chart center */}
              <div 
                className="absolute flex flex-col items-center justify-center pointer-events-none z-10"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <p className="text-3xl font-bold text-gray-900 leading-tight text-center whitespace-nowrap">
                  {totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 font-medium text-center">{totalLabel}</p>
              </div>
            </div>
          </div>

          {/* Legend - Vertically centered with chart, larger bullets */}
          <div className="flex-1 w-full lg:w-auto flex flex-col justify-center" style={{ margin: '10px 10px 0px 0px' }}>
            <div className="relative">
              <div className="space-y-4 max-h-[260px] overflow-y-auto pr-3 rounded-lg border border-gray-100 bg-white/80 shadow-inner">
                {data.map((item, index) => (
                  <div key={item.name} className="flex items-start gap-3 px-3 py-2">
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 shadow-md border-2 border-white"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {item.name}
                      </p>
                      <p className="text-sm font-medium text-gray-600 ml-2 whitespace-nowrap">
                        ({item.percentage.toFixed(2)}%)
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs text-gray-500">
                        {item.count.toLocaleString()} {title.includes('District') ? 'DISTRICTS' : title.includes('School') ? 'SCHOOLS' : 'ITEMS'}
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs font-medium text-gray-700">
                        {item.total.toLocaleString()} Total
                      </p>
                    </div>
                  </div>
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent rounded-b-lg" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreakdownDonutChart;

