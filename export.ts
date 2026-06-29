import { Glob } from "bun";

const glob = new Glob("**/*");
let output = "";

// Scan all files, skipping common dependency and build folders
for await (const file of glob.scan({ 
  cwd: ".", 
  onlyFiles: true, 
  ignore: ["node_modules/**", ".git/**", "dist/**", "bun.lockb", "codebase.txt"] 
})) {
  output += `\n\n=== FILE: ${file} ===\n`;
  output += await Bun.file(file).text();
}

await Bun.write("codebase.txt", output);
console.log("Codebase exported to codebase.txt successfully!");
