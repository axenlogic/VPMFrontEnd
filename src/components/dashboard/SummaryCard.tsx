import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import Highcharts from "highcharts";
import HighchartsWrapper from "@/components/charts/HighchartsWrapper";

interface SummaryCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  trendData?: number[];
  icon?: React.ReactNode;
  color?: string;
}

const SummaryCard = ({ 
  title, 
  value, 
  change, 
  trendData = [],
  icon,
  color = "#294a4a"
}: SummaryCardProps) => {
  // Generate dates for trend graph (last 7 days)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Generate dates for trend graph (last 7 days)
  const trendDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Mini trend chart options
  const miniChartOptions: Highcharts.Options = {
    chart: {
      type: 'areaspline',
      height: 60,
      spacing: [0, 0, 0, 0],
      margin: [0, 0, 0, 0],
      backgroundColor: 'transparent',
    },
    title: { text: '' },
    credits: { enabled: false },
    legend: { enabled: false },
    tooltip: {
      enabled: true,
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderRadius: 6,
      borderWidth: 1,
      shadow: {
        color: 'rgba(0, 0, 0, 0.1)',
        offsetX: 0,
        offsetY: 2,
        opacity: 0.1,
        width: 2,
      },
      style: {
        color: '#111827',
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
      },
      formatter: function() {
        const pointIndex = this.point.index;
        const date = trendDates[pointIndex] || `Day ${pointIndex + 1}`;
        return `<div style="padding: 2px 4px;">
          <strong>${date}</strong><br/>
          ${title}: <strong>${this.y?.toLocaleString() || 0}</strong>
        </div>`;
      },
      positioner: function(boxWidth, boxHeight, point) {
        const chart = this.chart;
        const plotX = point.plotX || 0;
        const plotY = point.plotY || 0;
        
        // Calculate position relative to chart
        let x = plotX - boxWidth / 2;
        let y = plotY - boxHeight - 10;
        
        // Ensure tooltip stays within chart bounds
        const padding = 5;
        if (x < padding) {
          x = padding;
        } else if (x + boxWidth > chart.plotWidth - padding) {
          x = chart.plotWidth - boxWidth - padding;
        }
        
        // Position above the point, or below if not enough space
        if (y < padding) {
          y = plotY + 20; // Show below point if not enough space above
        }
        
        return {
          x: x,
          y: y
        };
      },
      outside: true, // Allow tooltip to render outside chart area
    },
    xAxis: {
      categories: trendDates,
      labels: { enabled: false },
      lineWidth: 0,
      tickLength: 0,
      min: 0,
      max: trendDates.length - 1,
      startOnTick: true,
      endOnTick: true,
    },
    yAxis: {
      labels: { enabled: false },
      gridLineWidth: 0,
      title: { text: '' },
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.2,
        lineWidth: 2,
        marker: { 
          enabled: true,
          radius: 2,
          states: {
            hover: {
              radius: 3,
            },
          },
        },
        threshold: null,
        states: {
          hover: {
            lineWidth: 3,
          },
        },
      },
    },
    series: [{
      name: title,
      type: 'areaspline',
      data: trendData.length > 0 ? trendData : Array(7).fill(0),
      color: change?.isPositive ? '#10B981' : change?.isPositive === false ? '#EF4444' : color,
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, change?.isPositive ? 'rgba(16, 185, 129, 0.2)' : change?.isPositive === false ? 'rgba(239, 68, 68, 0.2)' : `${color}20`],
          [1, 'transparent']
        ]
      },
    }],
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div 
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: `${color}15` }}
              >
                <div style={{ color: color }}>
                  {icon}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {title}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </div>
          </div>
        </div>

        {change && (
          <div className="flex items-center gap-2 mb-3">
            {change.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.value} {change.label || 'vs yesterday'}
            </span>
          </div>
        )}

        {/* Mini Trend Chart */}
        <div className="h-[60px] -mx-6 overflow-visible relative">
          <HighchartsWrapper options={miniChartOptions} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;

