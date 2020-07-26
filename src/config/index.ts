/** Check node enviorenent and sends keys accordingly */
import { production_config } from "./production";
import { development_config } from "./development";
let keysToExport =
  process.env.NODE_ENV === "production"
    ? production_config
    : development_config;

export = keysToExport;
