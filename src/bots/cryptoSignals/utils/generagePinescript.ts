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
  labelColor: PineColor
}

function generatePineScriptCode(points: PointWithLabel[]): string {
  const codeForPoints = points
    .map((point) => {
      const roundedTimestamp = `floor(${point.timestamp} / currentResolution) * currentResolution`
      return `
isBarForPoint${point.label.replace(/\s/g, '')} = time == ${roundedTimestamp}
plotshape(series=isBarForPoint${point.label.replace(/\s/g, '')} ? ${
        point.price
      } : na, style=shape.circle, location=location.absolute, color=${
        point.labelColor
      }, title="Point")
if (isBarForPoint${point.label.replace(/\s/g, '')})
    label.new(x=bar_index, y=${point.price} + syminfo.mintick * 2, text="${
        point.label
      }", style=label.style_labeldown, color=${
        point.labelColor
      }, xloc=xloc.bar_index, yloc=yloc.price)
    `
    })
    .join('\n')

  return `
//@version=4
study(title="Multiple Points with Labels", overlay=true)

currentResolution = abs(time[1] - time)
${codeForPoints}
  `
}

// Пример использования:
const pointsData: PointWithLabel[] = [
  {
    timestamp: new Date().getTime(),
    price: 0.793,
    label: 'PointA',
    labelColor: 'color.blue',
  },
  {
    timestamp: new Date().getTime() + 60000, // +1 minute
    price: 0.795,
    label: 'PointB',
    labelColor: 'color.red',
  },
  {
    timestamp: new Date().getTime(),
    price: 0.793,
    label: 'PointC',
    labelColor: 'color.aqua',
  },
  {
    timestamp: new Date().getTime() + 1200000, // +1 minute
    price: 0.795,
    label: 'PointD',
    labelColor: 'color.green',
  },
]

console.log(generatePineScriptCode(pointsData))
