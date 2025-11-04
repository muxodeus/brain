/**
 * Devuelve un resumen de parámetros eléctricos clave desde InfluxDB
 */
export async function fetchSummary(bucket: string, range: string = "-24h") {
  const queries = {
    totalConsumption: `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
        |> difference(nonNegative: true)
        |> sum()
    `,
    powerNow: `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
        |> last()
    `,
    voltageNow: `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field =~ /voltage_.*/)
        |> last()
    `,
    currentNow: `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field =~ /current_.*/)
        |> last()
    `,
    maxDemand: `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
        |> max()
    `,
    freqNow: `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "freq_Hz")
        |> last()
    `,
    thdVoltage: `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field =~ /thd_voltage.*/)
        |> last()
    `,
    thdCurrent: `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field =~ /thd_current.*/)
        |> last()
    `,
  };

  const [
    energyRows,
    powerRows,
    voltRows,
    currentRows,
    maxRows,
    freqRows,
    thdVoltRows,
    thdCurrRows,
  ] = await Promise.all([
    runFlux<{ _value: number }>(queries.totalConsumption),
    runFlux<{ _value: number }>(queries.powerNow),
    runFlux<{ _value: number }>(queries.voltageNow),
    runFlux<{ _value: number }>(queries.currentNow),
    runFlux<{ _value: number }>(queries.maxDemand),
    runFlux<{ _value: number }>(queries.freqNow),
    runFlux<{ _value: number }>(queries.thdVoltage),
    runFlux<{ _value: number }>(queries.thdCurrent),
  ]);

  return {
    totalConsumption: energyRows[0]?._value ?? 0,
    powerNow: powerRows[0]?._value ?? 0,
    voltageNow: voltRows[0]?._value ?? 0,
    currentNow: currentRows[0]?._value ?? 0,
    maxDemand: maxRows[0]?._value ?? 0,
    freqNow: freqRows[0]?._value ?? 0,
    thdVoltage: thdVoltRows[0]?._value ?? 0,
    thdCurrent: thdCurrRows[0]?._value ?? 0,
  };
}