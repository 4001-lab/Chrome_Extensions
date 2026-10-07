import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['storage', 'identity'],
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0ByYjM6dJ0iwKwYcuUaA4sQw0KyFE/esvrAnqtu3Pcaq0zr8yPnkxlmTdbUCFTxwf/Y9crl445n1c1jEot4cwQ6hP7eDqnyJZWJIW9cK6iEdL8LXkigapqWd48fMQrEmiQneg8V1gBtJ69cwf7PvR1MrssDQhom9GIxPwU9DIFoiBn4IyYjaVcCkN/2j2rHXGxWEfg/PVchUvZcGaCeFYQjg155D2PQFjpwRFgphR1KIsxQdhk6DTkrIJFxBZm91PmeTCeiBMDGOSRHUo+qsGlKh0A+pBxVFXdB5AQis3PemDf0R414VWJCGZy6Fcb8b5o3IZEDSo7KKCa/+F4dRVQIDAQAB',
  },
});

