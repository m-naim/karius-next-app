import {
  CoreChartOptions,
  DatasetChartOptions,
  ElementChartOptions,
  LineControllerChartOptions,
  PluginChartOptions,
  ScaleChartOptions,
} from 'chart.js/dist/types/index'
import { _DeepPartialObject } from 'chart.js/dist/types/utils'

type ChartOptions =
  | _DeepPartialObject<
      CoreChartOptions<'line'> &
        ElementChartOptions<'line'> &
        PluginChartOptions<'line'> &
        DatasetChartOptions<'line'> &
        ScaleChartOptions &
        LineControllerChartOptions
    >
  | undefined

export default ChartOptions
