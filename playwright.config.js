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
    // 대기 연결 수를 늘린 정적 서버 (python 기본 서버는 동시 요청에서 연결을 끊음)
    command: `python3 tests/support/serve.py ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
