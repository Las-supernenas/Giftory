import 'dotenv/config';
import { createApi } from './ui/api';

const PORT = Number(process.env.PORT ?? 3000);

const api = createApi();

api.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
