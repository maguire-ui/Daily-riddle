import { ImageResponse } from "next/og";
import TreasureMapIcon from "./treasure-map-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<TreasureMapIcon />, size);
}
