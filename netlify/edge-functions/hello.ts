import type { Config } from "@netlify/edge-functions";

export default async () => {
  throw new Error("PROBLEM!"); 
}//new Response("Success!");

export const config: Config = {
  path: "/hello",
};