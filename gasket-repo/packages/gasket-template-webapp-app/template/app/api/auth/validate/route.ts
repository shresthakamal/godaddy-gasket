import gasket from '@/gasket'; // tsconfig alias
import { NextResponse } from 'next/server';
import { makeGasketRequest } from '@gasket/request';

export async function GET(req: Request) {
  const gasketReq = await makeGasketRequest(req);
  const auth = await gasket.actions.checkAuth(gasketReq, gasketReq.query);
  return NextResponse.json(auth);
}
