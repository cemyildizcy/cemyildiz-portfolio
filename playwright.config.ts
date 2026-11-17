import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {command: "npm run start -- --hostname 127.0.0.1 --port 3000", url: "http://127.0.0.1:3000", reuseExistingServer: false},
  use: {baseURL: "http://127.0.0.1:3000", channel: process.env.PLAYWRIGHT_CHANNEL, trace: "retain-on-failure", screenshot: "only-on-failure"},
  projects: [
    {name: "chromium", use: {...devices["Desktop Chrome"]}},
    {name: "mobile", use: {...devices["Desktop Chrome"], viewport: {width:390, height:844}, isMobile:true, hasTouch:true}},
  ],
});
