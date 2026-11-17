const { defineConfig } = require('@playwright/test');

// 5500은 VS Code Live Server와 겹칠 수 있어 PW_PORT로 바꿀 수 있게 함 (기본 5500)
const PORT = process.env.PW_PORT || '5500';

module.exports = defineConfig({
  testDir: './tests',
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  // 테스트 시작 시 포트폴리오를 로컬 주소로 자동으로 띄움 (파이썬 내장 서버)
  webServer: {
    command: `python3 -m http.server ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
