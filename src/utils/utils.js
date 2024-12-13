import { fileURLToPath } from 'url';
import path from 'path';

/** basePath */
export const getBasePath = (metaUrl) => {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = path.dirname(__filename);
  return path.join(__dirname, '../../../public');
};
