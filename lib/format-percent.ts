interface FormatPercentageOptions {
  fromRatio?: boolean;
}

export function formatPercentage(
  value: number,
  options: FormatPercentageOptions = {}
) {
  const percentValue = options.fromRatio ? value * 100 : value;
  const roundedValue = Math.round(percentValue * 10) / 10;

  return `${Number.isInteger(roundedValue) ? roundedValue.toFixed(0) : roundedValue.toFixed(1)}%`;
}
