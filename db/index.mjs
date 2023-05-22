import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

// db.json file path
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, "db.json");

// Configure lowdb to write data to JSON file
const adapter = new JSONFile(file);
const defaultData = { users: [] };
export default new Low(adapter, defaultData);
