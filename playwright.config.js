const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5500',
  },
  // 테스트 시작 시 포트폴리오를 로컬 주소로 자동으로 띄움 (파이썬 내장 서버)
  webServer: {
    command: 'python3 -m http.server 5500',
    url: 'http://localhost:5500',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
