import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import Highcharts from "highcharts";
import HighchartsWrapper from "@/components/charts/HighchartsWrapper";

// Import Highcharts data module for CSV parsing
if (typeof window !== 'undefined') {
  import("highcharts/modules/data").then((dataModule) => {
    dataModule.default(Highcharts);
  });
}

interface CSVDataChartProps {
  title: string;
  csvUrl?: string;
  csvData?: string;
  period?: string;
  onPeriodChange?: (period: string) => void;
}

const CSVDataChart = ({
  title,
  csvUrl,
  csvData,
  period = "week",
  onPeriodChange,
}: CSVDataChartProps) => {
  const [csvContent, setCsvContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCSVData = async () => {
      if (csvUrl) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(csvUrl);
          if (!response.ok) {
            throw new Error("Failed to fetch CSV data");
          }
          const text = await response.text();
          setCsvContent(text);
        } catch (err: any) {
          setError(err.message || "Failed to load CSV data");
          // Use dummy CSV data as fallback
          setCsvContent(generateDummyCSV());
        } finally {
          setIsLoading(false);
        }
      } else if (csvData) {
        setCsvContent(csvData);
      } else {
        // Use dummy CSV data if no source provided
        setCsvContent(generateDummyCSV());
      }
    };

    loadCSVData();
  }, [csvUrl, csvData]);

  const generateDummyCSV = () => {
    // Generate dummy CSV data with time format like HH:MM:SS
    const now = new Date();
    const dates: string[] = [];
    const values: number[] = [];
    
    for (let i = 8; i >= 0; i--) {
      const date = new Date(now);
      date.setSeconds(date.getSeconds() - i);
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      dates.push(timeStr);
      // Generate values similar to screenshot (-4 to 6 range)
      values.push(Number((Math.random() * 10 - 4).toFixed(1)));
    }

    return `Time,Values\n${dates.map((date, i) => `${date},${values[i]}`).join('\n')}`;
  };

  const handleRefresh = () => {
    if (csvUrl) {
      const loadCSVData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(csvUrl, { cache: 'no-cache' });
          if (!response.ok) {
            throw new Error("Failed to fetch CSV data");
          }
          const text = await response.text();
          setCsvContent(text);
        } catch (err: any) {
          setError(err.message || "Failed to load CSV data");
        } finally {
          setIsLoading(false);
        }
      };
      loadCSVData();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Parse CSV data manually
  const parseCSVData = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return { categories: [], data: [] };
    
    const headers = lines[0].split(',').map(h => h.trim());
    const dateIndex = headers.findIndex(h => 
      h.toLowerCase().includes('date') || 
      h.toLowerCase().includes('time') ||
      h.toLowerCase().includes('timestamp')
    );
    const valueIndex = headers.findIndex((h, i) => 
      i !== dateIndex && (
        h.toLowerCase().includes('value') ||
        h.toLowerCase().includes('values') ||
        h.toLowerCase().includes('data') ||
        h.toLowerCase().includes('sessions')
      )
    );
    
    const categories: string[] = [];
    const data: number[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length > Math.max(dateIndex, valueIndex)) {
        if (dateIndex >= 0) categories.push(values[dateIndex]);
        if (valueIndex >= 0) data.push(parseFloat(values[valueIndex]) || 0);
      }
    }
    
    return { categories, data };
  };

  const { categories, data } = parseCSVData(csvContent || generateDummyCSV());

  // Orange color scheme for Session Counts Analytics
  const chartLineColor = '#ff8548'; // Orange border line color
  const chartFillColor = 'rgba(255, 133, 72, 0.15)'; // Light orange/peach fill with transparency that complements the orange line

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'area',
      height: 280,
      backgroundColor: 'transparent',
      spacing: [15, 15, 15, 15],
    },
    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: categories.length > 0 ? categories : undefined,
      labels: {
        style: {
          color: '#6B7280',
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif',
        },
      },
      gridLineColor: '#E5E7EB',
      gridLineWidth: 1,
      lineColor: '#E5E7EB',
      tickColor: '#E5E7EB',
    },
    yAxis: {
      title: {
        text: 'Values',
        style: {
          color: '#6B7280',
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif',
        },
      },
      labels: {
        style: {
          color: '#6B7280',
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif',
        },
        formatter: function() {
          const value = this.value as number;
          return value.toString();
        },
      },
      gridLineColor: '#E5E7EB',
      gridLineWidth: 1,
      lineColor: '#E5E7EB',
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderRadius: 8,
      borderWidth: 1,
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
        fontSize: '11px',
      },
      formatter: function() {
        return `<div style="padding: 4px;">
          <strong>${this.x}</strong><br/>
          Value: <strong>${this.y?.toFixed(1)}</strong>
        </div>`;
      },
    },
    plotOptions: {
      area: {
        lineWidth: 2,
        marker: {
          enabled: true,
          radius: 4,
          fillColor: '#FFFFFF',
          lineWidth: 2,
          lineColor: chartLineColor,
          symbol: 'circle',
          states: {
            hover: {
              radius: 5,
            },
          },
        },
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, chartFillColor],
            [1, 'rgba(255, 133, 72, 0.05)'], // Fade to almost transparent at the bottom
          ],
        },
        states: {
          hover: {
            lineWidth: 3,
          },
        },
        threshold: null,
      },
    },
    colors: [chartLineColor],
    series: [
      {
        name: 'Live Data',
        type: 'area',
        data: data.length > 0 ? data : undefined,
        color: chartLineColor,
        fillOpacity: 1,
      },
    ],
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-bold text-gray-900">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {onPeriodChange && (
            <Select value={period} onValueChange={onPeriodChange}>
              <SelectTrigger 
                className="w-[100px] h-8 text-sm text-white rounded-lg"
                style={{ backgroundColor: '#375b59' }}
              >
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
          {csvUrl && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-8 w-8"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="h-8 w-8"
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            {error} - Using sample data
          </div>
        )}
        <HighchartsWrapper options={chartOptions} />
      </CardContent>
    </Card>
  );
};

export default CSVDataChart;
