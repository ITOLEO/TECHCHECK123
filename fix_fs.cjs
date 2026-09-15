const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes("import fs from 'fs';")) {
  content = content.replace(
    /import express, \{ Request, Response \} from 'express';/,
    "import express, { Request, Response } from 'express';\nimport fs from 'fs';"
  );
}

content = content.replace(/const fs = require\('fs'\);/, '');
fs.writeFileSync('server.ts', content, 'utf8');
