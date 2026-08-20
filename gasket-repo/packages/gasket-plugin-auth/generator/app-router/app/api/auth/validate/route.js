import gasket from '../../../../gasket.js';
import { NextResponse } from 'next/server';
import { makeGasketRequest } from '@gasket/request';

export async function GET(req) {
  const gasketReq = await makeGasketRequest(req);
  const auth = await gasket.actions.checkAuth(gasketReq, gasketReq.query);
  return NextResponse.json(auth);
}
