import fs from "node:fs";
import path from "node:path";
// Portable ZIP writer (stored entries, UTF-8). Does not include secrets or generated output.
const excluded = new Set([
  "node_modules",
  ".next",
  "out",
  "dist",
  ".git",
  ".openai",
  "artifacts",
  "test-results",
  "playwright-report",
]);
const entries = [];
function walk(dir = "") {
  for (const entry of fs.readdirSync(dir || ".", { withFileTypes: true })) {
    if (
      excluded.has(entry.name) ||
      entry.name.endsWith(".log") ||
      entry.name.endsWith(".tsbuildinfo") ||
      (entry.name.startsWith(".env") && entry.name !== ".env.example")
    )
      continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.isFile()) entries.push(file);
  }
}
walk();
const table = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
const crc32 = (data) => {
  let crc = 0xffffffff;
  for (const byte of data) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};
const local = [],
  central = [];
let offset = 0;
for (const file of entries) {
  const name = Buffer.from(`PersonaliTatto/${file.replaceAll("\\", "/")}`);
  const data = fs.readFileSync(file);
  const crc = crc32(data);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x800, 6);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(name.length, 26);
  local.push(header, name, data);
  const c = Buffer.alloc(46);
  c.writeUInt32LE(0x02014b50);
  c.writeUInt16LE(20, 4);
  c.writeUInt16LE(20, 6);
  c.writeUInt16LE(0x800, 8);
  c.writeUInt32LE(crc, 16);
  c.writeUInt32LE(data.length, 20);
  c.writeUInt32LE(data.length, 24);
  c.writeUInt16LE(name.length, 28);
  c.writeUInt32LE(offset, 42);
  central.push(c, name);
  offset += header.length + name.length + data.length;
}
const directory = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50);
end.writeUInt16LE(entries.length, 8);
end.writeUInt16LE(entries.length, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);
fs.mkdirSync("artifacts", { recursive: true });
const output = path.resolve("artifacts/PersonaliTatto-MVP.zip");
fs.writeFileSync(output, Buffer.concat([...local, directory, end]));
console.log(
  `${output}\n${entries.length} arquivos · ${(fs.statSync(output).size / 1024 / 1024).toFixed(1)} MB`,
);
