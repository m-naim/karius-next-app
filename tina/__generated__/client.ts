import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: '/home/naim/Projets/boursehorus/boursehorus-front/tina/__generated__/.cache/1785685815168', url: 'http://localhost:4001/graphql', token: 'undefined', queries,  });
export default client;
  