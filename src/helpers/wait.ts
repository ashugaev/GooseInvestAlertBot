export const wait = (minTime: number, maxTime?: number) => new Promise((resolve) => {
  if (maxTime) {
    minTime = Math.floor(Math.random() * (maxTime - minTime) + minTime);
  }

  setTimeout(resolve, minTime);
});
