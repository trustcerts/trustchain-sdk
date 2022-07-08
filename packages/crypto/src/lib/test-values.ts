import { defaultCryptoKeyService } from '..';
import { DecryptedKeyPair } from './decrypted-key-pair';

export const testKey: DecryptedKeyPair<RsaHashedKeyGenParams> = {
  identifier: 'testKey',
  algorithm: defaultCryptoKeyService.algorithm,
  privateKey: {
    key_ops: ['sign'],
    ext: true,
    kty: 'RSA',
    n: '3oyB2RQWMtIgWnBMY16bSLgdLYx6IR8GOURqrhIjqAU4w4W_SubyNSGUxkZKVx-8lurmc6E9Z_hXL2gYH9bd2mCLWVY2CP0RvF3wAyIVfApV1AYaN2aSHsGRK-fMV5cIdjVOl2DZu-OwCIQZgpdOJ_j_bKXAaFqaf8Nu0U48PtgGI1uo8YBm9whtEMF1OfVHknaOezHYnKXVJPbLW710lLfnDbgP8jWXlO85R25XVmgYDEvYksIKrrKXyXhOLBviXwRAtkI7gj2qE0t75JiR1DKkMF88XmcWJguLAqeLWZBnHEGKpHOThAUNyPhccsKe36Y9jWpZmloEHZMtwqkc_Q',
    e: 'AQAB',
    d: 'RahTCEA6RoPwrn4R2tSE5DkEoPokS_Oq_gfFIGD7Gh8wSjq1ylsJGso9B-Z-ZFDBtbcmlLC2SLG5kFQToPufCzhGxZqvZRbZE02Pz1s-wEl33dpfIFIRkGDj8IsoMY5LjrxWshkVbbLxqWi3l2GGjApq4HXtCHy7eRwRtp-3Sa-8k1ghSVFCKzowomQkmQlPff3CVyzX828pDKPnzCDbXRzYLwJSnh58DUAw-OOZtpNe6N6otUgidYLlI42HuysZ0KBbkW5wSRhtjnnO5e8YHbSQ9zF0kNxBmQnJu1BqLo5JbThim4SxTXDlb6GATqP7rjCcDuQ1LRAKQ3x_WVk9wQ',
    p: '9rj82QHlgtj3hBdHABbSsuOLIKnjnMhshteFNdZziVRcLLe8q4YaJSpJ1xqQKLgmydLjdrBL6QDUXFCrhMUJyKlaToMGKaouDg4bbBPZhkIiCRodXfor0yj3m0VlhnhnPcZc6yJX1EvAncPS0GG9zdh1QOb7EsdWkolgdhF5Re0',
    q: '5urRK4uVmyQ202CHD_kXaswIN0gDFAb0BiJAWG5hRnE9TFcGJGHo7RwVA2oZfdNrG22Xb9NM44Vw-ajp_6TcWYkCNsRs9PvbXEliw03uoWG1kbFNXZ69S-IRC0TGcxCafdfPolFCIyg3ORCHc-DxUaTIpuUBalOA8yncJYeSUVE',
    dp: 's6rAzpL3_NJdZP7CgIkeRJE5Zr7w9uJpTcSyyCL0HgSl3xaqOUo9zeS-wvsgEdcQwBZn-K2nifVFsDg6v0PxvQO-tL_rg_ne8fNJ-ul1lbShLnmq-x3MPkhuD894gHU70ZubXMu0o-_KQ9kvsvoKi1VfBbVvDxzEqY-LBE_zPX0',
    dq: 'e_rpcVrRaWmpMhZqjc3sn7-KTbwRQwh0rnJnX9Nr0PltsvYqaxBSkjP4qEuoAiGoKSLPIxAtAR-dR75EXKi0UjI4iRUvdt1eqo8QQtIt5GHkraOnaTOYaQyooAc-EXuBpz1e0sSUIPIvrCjOwQ2uI2q4_LqJ5v-MhYIdG91NVvE',
    qi: '3ObyvIPT9F5U0zSJHItHCw1SoqH6ZCtLjiQEPCsmEce6-WVqzhqcQkxHinZNVHhF0Mv1PuKmKXYchUmG5QJzh7W0Yu1vxZfzrPkUj5WtQRVpHtiFf1cORpDGTDcC4bvA2KQUWrB9-DpqE_VqyUPkfiFpnNflkA_v0SwiSZpl2OY',
    alg: 'RS256',
  },
  publicKey: {
    key_ops: ['verify'],
    ext: true,
    kty: 'RSA',
    n: '3oyB2RQWMtIgWnBMY16bSLgdLYx6IR8GOURqrhIjqAU4w4W_SubyNSGUxkZKVx-8lurmc6E9Z_hXL2gYH9bd2mCLWVY2CP0RvF3wAyIVfApV1AYaN2aSHsGRK-fMV5cIdjVOl2DZu-OwCIQZgpdOJ_j_bKXAaFqaf8Nu0U48PtgGI1uo8YBm9whtEMF1OfVHknaOezHYnKXVJPbLW710lLfnDbgP8jWXlO85R25XVmgYDEvYksIKrrKXyXhOLBviXwRAtkI7gj2qE0t75JiR1DKkMF88XmcWJguLAqeLWZBnHEGKpHOThAUNyPhccsKe36Y9jWpZmloEHZMtwqkc_Q',
    e: 'AQAB',
    alg: 'RS256',
  },
};
export const content = 'Content to be signed';
export const differentContent = 'Different content';
export const contentSignature =
  '5WxXWt5En68FuQ24fPd14kzJmft4pjVDwMijZYpUeJTQh56mWjoWfyuFghhkQUL3u1qUZRxT62H93ipy4Fx5NUSx5fdUfdcRExdFNsngL9zG9xHo52EeBDQf87iiPUa4zvBLraRNt4jcRnuEphbZQhm58gNbgFckUivW8wyX2wvza5M9v16XVSvH5kMT1ULBxu6qhFdzaGRyVCnPeqYGgTdFFHryKX8wsgzoz8Q5K9VXV6kHRHepu7h5ZUZhZJHK6T5LSTBvKuWZzAZaaFXmq7BT3kq4SqGNyPN633CgGEec6YKaqYCFvHuFeV7SKvHrVYgyQJKCsZx22uipnP4E3n5bN2j6wT';
export const differentContentSignature =
  'B7Nmy9KSw4dPWgUAdXumuRRUkYzzwzPFYh4L59EuTueZFLayg4ZG9g2tSRaJUEPQ6QP5h9WgdhKRVBSumnrXii5QvX3tGmUXLw4dEPDT4m1399HNdphzUHY2LQm3FVnCpA34schmsiSkSbTiy1objQjpWjdVLiiPyLkqtWG23RM7ENbwV6vUjSN3JBejgi8VKTdsVpZuB73LZ1UtMWcZQSgECDNoQSULtugfjGamiUP6prpe5RdTLcaCavgcbzwTtSJ4iABENpcvE8B3QrWJQQyg4KJniQsHVVNfjHPQiCiiXwnXoyAu3YRAhexcnNCBcqL4zhjpE9ubfEaHPKQhimJxpTUhtR';
export const hashContent = 'Content to be hashed';
export const hashContentHash = '9ZmsGxYnoHgZsaHhGeusbhkR6YjMeYRk2HN2NZUM28DX';
