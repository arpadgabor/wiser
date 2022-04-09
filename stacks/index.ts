
import MainStack from "./main.stack";
import * as sst from "@serverless-stack/resources";

const baseDomain = process.env.BASE_DOMAIN

export default function main(app: sst.App): void {
  console.log(app.stage)
  new MainStack(app, "api");
}
