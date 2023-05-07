'use client';
import { climate_risk } from '../../climate_risk';
import Chart, { ChartTypeRegistry, scales } from 'chart.js/auto';
import React, { useState, useEffect } from 'react';

interface Props {
  data: climate_risk[];
}

type LocationData = {
  [location: string]: {
    [year: string]: climate_risk[];
  };
};

function generateChartData(data: climate_risk[]) {
  // Aggregate the data by year
  const yearData = data.reduce(
    (acc: { [key: string]: climate_risk[] }, item: climate_risk) => {
      const year = item.year.toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(item);
      return acc;
    },
    {}
  );

  // Create an array of chart data objects
  const chartData = Object.entries(yearData).map(([year, items]) => {
    const risk_rate =
      items.reduce((acc, item) => acc + item.risk_rate, 0) / items.length;

    const asset = items.reduce((acc: string[], item) => {
      if (!acc.includes(item.asset_name)) {
        acc.push(item.asset_name);
      }
      return acc;
    }, []);
    const factors = items.reduce((acc: { [key: string]: number }, item) => {
      if (item.risk_factor) {
        Object.keys(item.risk_factor).forEach((factor) => {
          if (!acc[factor]) {
            acc[factor] = item.risk_factor[factor];
          } else {
            acc[factor] += item.risk_factor[factor];
          }
        });
      }
      return acc;
    }, {});

    return { x: year, y: risk_rate, assetName: asset, factors: factors };
  });

  return chartData;
}

const Graph: React.FC<Props> = ({ data }) => {
  const [chart, setChart] =
    useState<Chart<'line', { x: string; y: number }[] | null, unknown>>();

  useEffect(() => {
    const canvas = document.getElementById('lineChart') as HTMLCanvasElement;

    if (chart) {
      chart.destroy();
    }

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const chartData = generateChartData(data);

    Chart.defaults.backgroundColor = 'red';
    Chart.defaults.borderColor = ' #a5a5a5 ';
    Chart.defaults.color = '#000';
    const newChart = new Chart<
      'line',
      { x: string; y: number }[] | null,
      unknown
    >(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Risk rate over years',
            data: chartData.filter((e) => [e.x, e.y]),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'white',
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#a5a5a5',
            },
          },
          y: {
            ticks: {
              color: ' #a5a5a5 ',
            },
          },
        },
      },
    });

    setChart(newChart);

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [data]);

  useEffect(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const canvas = document.getElementById('lineChart') as HTMLCanvasElement;
      if (!canvas) {
        return;
      }
      if (chart) {
        chart.destroy();
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      //setChart(null);
    });
  }, []);

  return (
    <>
      <div id="chartContainer">
        <canvas className="h-full w-5/6" id="lineChart"></canvas>
      </div>
    </>
  );
};

export default Graph;
