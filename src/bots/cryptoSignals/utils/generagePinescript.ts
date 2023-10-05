type PineColor =
  | 'color.aqua'
  | 'color.black'
  | 'color.blue'
  | 'color.fuchsia'
  | 'color.gray'
  | 'color.green'
  | 'color.lime'
  | 'color.maroon'
  | 'color.navy'
  | 'color.olive'
  | 'color.orange'
  | 'color.purple'
  | 'color.red'
  | 'color.silver'
  | 'color.teal'
  | 'color.white'
  | 'color.yellow'

type PointWithLabel = {
  timestamp: number // Unix timestamp in milliseconds
  price: number
  label: string
  labelColor: PineColor // New parameter for label color
}

function generatePineScriptCode(point: PointWithLabel): string {
  return `
//@version=4
study(title="Point with Label", overlay=true)

currentResolution = abs(time[1] - time)
roundedTimestamp = floor(${point.timestamp} / currentResolution) * currentResolution

isBarForPoint = time == roundedTimestamp

plotshape(series=isBarForPoint ? ${point.price} : na, style=shape.circle, location=location.absolute, color=color.black, title="Point")
if (isBarForPoint)
    label.new(x=bar_index, y=${point.price}  + syminfo.mintick * 2, text="${point.label}", style=label.style_labeldown, color=${point.labelColor}, xloc=xloc.bar_index, yloc=yloc.price)
`
}

// Пример использования:
const pointData: PointWithLabel = {
  timestamp: new Date().getTime(), // Ensure this timestamp is in milliseconds
  price: 0.793,
  label: 'My Point',
  labelColor: 'color.navy', // Passing color as a Pine Script color string
}
console.log(generatePineScriptCode(pointData))
