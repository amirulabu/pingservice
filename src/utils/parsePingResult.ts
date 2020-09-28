export function parsePingResult(stdout: string) {
  const regexPingResult = /(\d)(?: .+ )(\d)(?: .+ )(\d\.?\d?\%)(?: .+)/;
  const match = regexPingResult.exec(stdout);
  // console.log(match);
  if (match.length === 0) {
    console.error("regexPingResult broke");
    return {
      packetsTransmitted: "0",
      received: "0",
      packetLoss: "0",
    };
  }
  return {
    packetsTransmitted: match[1],
    received: match[2],
    packetLoss: match[3],
  };
}
