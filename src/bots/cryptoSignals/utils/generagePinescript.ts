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

export type PointWithLabel =
  | {
      timestamp: number // Unix timestamp in milliseconds
      price: number
      label: string
      labelColor: PineColor
      type: 'dot'
    }
  | {
      type: 'line' // добавлено поле для типа элемента
      price: number
      label: string
      labelColor: PineColor
    }
  | {
      type: 'vline' // добавлено поле для вертикальной линии
      timestamp: number // Unix timestamp in milliseconds
      label: string
      labelColor: PineColor
    }

export function generatePineScriptCode(points: PointWithLabel[]): string {
  const codeForPoints = points
    .map((point) => {
      const roundedTimestamp = `floor(${
        // @ts-ignore
        point.timestamp || new Date().getTime()
      } / currentResolution) * currentResolution`

      let shapeCode = ''
      if (point.type === 'dot') {
        shapeCode = `
plotshape(series=isBarForPoint${point.label.replace(/\s/g, '')} ? ${
          point.price
        } : na, style=shape.circle, location=location.absolute, color=${
          point.labelColor
        }, title="Point")`
      } else if (point.type === 'line') {
        shapeCode = `
hline(price=${point.price}, color=${point.labelColor}, linestyle=hline.style_solid, linewidth=1, title="Line ${point.label}")`
      } else if (point.type === 'vline') {
        const roundedTimestamp = `floor(${point.timestamp} / currentResolution) * currentResolution`

        shapeCode = `
if (bar_index == ${roundedTimestamp})
    line.new(x1=bar_index, x2=bar_index, y1=high + 1, y2=low - 1, color=${point.labelColor}, width=1)
`
      }

      // Код для отрисовки метки (если это не вертикальная линия)
      const labelCode =
        point.type !== 'vline'
          ? `
if (isBarForPoint${point.label.replace(/\s/g, '')})
    label.new(x=bar_index, y=${
      point.price ? point.price : 'na'
    } + syminfo.mintick * 2, text="${
              point.label
            }", style=label.style_labeldown, color=${
              point.labelColor
            }, xloc=xloc.bar_index, yloc=yloc.price)
    `
          : ''

      return `
${
  point.type !== 'vline'
    ? `isBarForPoint${point.label.replace(
        /\s/g,
        ''
      )} = time == ${roundedTimestamp}`
    : ''
}
${shapeCode}
${labelCode}
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
//
// // Пример использования:
// const pointsData: PointWithLabel[] = [
//   {
//     timestamp: new Date().getTime() - 240000, // +1 minute
//     price: 0.793,
//     label: 'PointA',
//     labelColor: 'color.blue',
//   },
//   {
//     timestamp: new Date().getTime() - 60000, // +1 minute
//     price: 0.795,
//     label: 'PointB',
//     labelColor: 'color.red',
//   },
//   {
//     timestamp: new Date().getTime() - 180000, // +1 minute
//     price: 0.793,
//     label: 'PointC',
//     labelColor: 'color.aqua',
//   },
//   {
//     timestamp: new Date().getTime() - 120000, // +1 minute
//     price: 0.795,
//     label: 'PointD',
//     labelColor: 'color.green',
//   },
// ]
//
// console.log(generatePineScriptCode(pointsData))
