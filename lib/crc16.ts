/** CCITT-FALSE CRC16 used by EMVCo DuitNow/TNG QR payloads */
export function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

/** Build a dynamic TNG/DuitNow EMVCo payload with a specific amount injected */
export function buildTngPayload(baseQrData: string, amount: number): string {
  // Remove existing CRC (everything after 6304)
  let payload = baseQrData.split("6304")[0];

  // Remove existing Amount (Tag 54) if present
  const tag54 = payload.indexOf("540");
  if (tag54 !== -1) {
    const len = parseInt(payload.substring(tag54 + 2, tag54 + 4));
    payload = payload.substring(0, tag54) + payload.substring(tag54 + 4 + len);
  }

  // Inject new amount
  const amtStr = amount.toFixed(2);
  payload += `54${amtStr.length.toString().padStart(2, "0")}${amtStr}6304`;
  return payload + crc16(payload);
}
