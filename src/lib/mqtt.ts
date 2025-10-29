import mqtt from "mqtt";

const brokerUrl = "mqtt://tu-broker.mqtt.com"; // o ws://localhost:1883 si es local
const client = mqtt.connect(brokerUrl, {
  username: "usuario",
  password: "contraseña",
});

export function publishMeterUpdate(meter: any) {
  const topic = `config/gateway/${meter.gateway_out}/meters`;
  const payload = JSON.stringify({
    gateway_id: meter.gateway_out,
    timestamp: new Date().toISOString(),
    action: "update_meters",
    meters: [meter],
  });

  client.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) console.error("Error publicando en MQTT:", err);
    else console.log("Configuración publicada en MQTT:", topic);
  });
}