import fs from "fs";
import { Mp3Encoder } from "lamejs";

const pcmData = fs.readFileSync('test.wav').subarray(44); // skip wav header
const numSamples = Math.floor(pcmData.length / 2);
const samples = new Int16Array(numSamples);
for (let i = 0; i < numSamples; i++) {
  samples[i] = pcmData.readInt16LE(i * 2);
}

const encoder = new Mp3Encoder(1, 24000, 128);
const mp3Data = [];
const blockSize = 1152;
for (let i = 0; i < samples.length; i += blockSize) {
  const chunk = samples.subarray(i, i + blockSize);
  const buf = encoder.encodeBuffer(chunk);
  if (buf.length > 0) mp3Data.push(buf);
}
const flushBuf = encoder.flush();
if (flushBuf.length > 0) mp3Data.push(flushBuf);

fs.writeFileSync('test.mp3', Buffer.concat(mp3Data.map(d => Buffer.from(d))));
console.log('Saved test.mp3, size:', fs.statSync('test.mp3').size);
