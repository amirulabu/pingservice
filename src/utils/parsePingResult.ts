export function parsePingResult(stdout: string) {
  const regexPingResult = /(\d)(?: packets transmitted, )(\d)(?: received, )(\d+\%)(?: packet loss)/;
  const match = regexPingResult.exec(stdout);
  // console.log(match);
  return {
    packetsTransmitted: match[1],
    received: match[2],
    packetLoss: match[3],
  };
}
