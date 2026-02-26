import { hash } from "bcrypt";
hash("admin123", 10).then(console.log);