function getGradient(ctx, chartArea) {
  let width, height, gradient
  const chartWidth = chartArea.right - chartArea.left
  const chartHeight = chartArea.bottom - chartArea.top
  if (!gradient || width !== chartWidth || height !== chartHeight) {
    // Create the gradient because this is either the first render
    // or the size of the chart has changed
    width = chartWidth
    height = chartHeight
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    gradient.addColorStop(0, 'rgb(109, 99, 255, 0.05)')
    gradient.addColorStop(0.5, 'rgb(109, 99, 255, 0.1)')
    gradient.addColorStop(1, 'rgb(109, 99, 255, 0.2)')
  }

  return gradient
}

export function gradientbg(context) {
  const chart = context.chart
  const { ctx, chartArea } = chart

  if (!chartArea) {
    return
  }
  return getGradient(ctx, chartArea)
}
