const fs = require('fs');
const path = require('path');

const screensDir = [
  'dashboard', 'employees', 'orders', 'products', 'wallet', 'branches', 'customers', 'commissions'
].map(d => path.join(__dirname, 'src', 'features', d, 'screens'));

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('ScreenContainer')) return;
  
  if (filePath.includes('LoginScreen')) return;
  if (filePath.includes('HomeScreen')) return;

  const screenNameMatch = content.match(/export const (\w+) =/);
  if (!screenNameMatch) return;
  const screenName = screenNameMatch[1];

  const titleMatch = content.match(/<Typography[^>]*>(.*?)<\/Typography>/);
  const title = titleMatch ? titleMatch[1] : screenName;

  const descMatch = content.match(/<Text>(.*?)<\/Text>/);
  const desc = descMatch ? descMatch[1] : '';

  const newContent = `import React from 'react';
import { Text } from 'react-native';
import { Typography } from '../../../shared/components/Typography';
import { colors } from '../../../shared/theme/colors';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';

export const ${screenName} = () => {
  return (
    <ScreenContainer>
      <Typography variant="h2" color={colors.primary}>${title}</Typography>
      <Text style={{ marginTop: 8 }}>${desc}</Text>
    </ScreenContainer>
  );
};
`;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Updated', filePath);
}

screensDir.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (file.endsWith('.tsx')) {
        processFile(path.join(dir, file));
      }
    });
  }
});
