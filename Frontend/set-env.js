const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src/environments/environment.ts');

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || 'PLACEHOLDER_API_URL'}',
  googleClientId: '${process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_GOOGLE_CLIENT_ID'}'
};
`;

console.log('Generating environment.ts with actual variables...');
fs.writeFileSync(targetPath, envConfigFile);
console.log('environment.ts generated successfully.');