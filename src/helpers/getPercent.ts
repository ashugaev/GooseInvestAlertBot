interface GetPercentParams {
    initialValue: number,
    diff: number,
}

function getPercent({initialValue, diff}: GetPercentParams) {
    const onePercent = initialValue / 100;

    return parseFloat((diff / onePercent).toFixed(2))
}
