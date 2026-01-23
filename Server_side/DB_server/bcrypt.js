import { hash as _hash } from "bcrypt";

_hash("test123", 10).then(hash => {
  console.log(hash);
});