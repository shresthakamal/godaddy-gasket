import { NextApiRequest, NextApiResponse } from 'next';
import gasket from '@/gasket';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const checkAuth = gasket.actions.getCheckAuth(req);
  const auth = await checkAuth(req.query);
  res.json(auth);
}
