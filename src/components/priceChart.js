import { useEffect } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts';

const PriceChart = ({ graphData }) => {
  let candleSeries
  useEffect(() => {
    const chart = createChart(document.getElementsByClassName("tradingview-chart")[0], {
      width: 600,
      height: 300,
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
      },
      timeScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
        timeVisible: true,
        secondsVisible: false,
      },
    })

    candleSeries = chart.addCandlestickSeries({
      priceFormat: {
        type: "custom",
        formatter: (price) => price,
        minMove: 0.000000001,
      },
    });

  }, [])

  useEffect(() => {
    candleSeries.setData(graphData);
  }, [graphData])

  return <div className="tradingview-chart"></div>
}

export default PriceChart
