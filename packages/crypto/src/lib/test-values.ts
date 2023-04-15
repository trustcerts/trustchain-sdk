import { DecryptedKeyPair } from './decrypted-key-pair';

export const testKey: DecryptedKeyPair = {
  identifier: 'testKey',
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

export const RSATestKey: DecryptedKeyPair = {
  privateKey: {
    key_ops: ['sign'],
    ext: true,
    kty: 'RSA',
    n: 'ltZ3mhK1-M-k_dY-l-Y53B-rFiOGI8h2x8H0NHHQWqIHrlv7UT1SDUhVJcsv1ilWQjr6CBaABBrmPzrC_oA05ZPrqKIRNZGBD3iDAlLNTIp1j4hwQ0-rmndIMsgd4pfyLaCXpxMPDIt23J40_sNGy9ViJ6kc6IxQhLmr1FWzpRQCdoXt-YEL4mEINKI61YFRAi2bwxwSEi9rJs4VcS8BJCcDo7dHF4VXHV_KQOkuXC6Oj0XsqeyUlFW7HuAyksszUO4sfubt3JDt6aTpEZ5jcKi0wzUE2U8ItJPkKXzm8LDrPPRTwAczaln43CxuwB2jYrXsQGG_oUZv_bhATkRQ_w',
    e: 'AQAB',
    d: 'Ji7YS-pcokV-ELvBUJZ5Ix3pI0uO01QVrW-NsBD3m1nU8_BY6DHLqY0b8NtEmsQQD-f6Dz4S3fcpPexUHDS8LzmIuEF-db8FmrL5BweK7MtIAzOYp5FtcUaswh4iYo_wQFicyzBp6NUNG7_4zl0EeOjlVgDbTormfxK5SqD_PtQ0ZeAlavpcIT3cPQimowfpKoYlg5Nw3hai1zMkZZLXE454ikFfd1P6xL4k5mRWaKDsNgEoV8pBfdWdoMamHtbJjBE87bSjTYW5zScP8A0ymPD1d69tVRyssKrPYpRYbPTB9a4QMFwH387Bfriq2D4IaL-biM3No99SIfM4WEMpwQ',
    p: 'xc_eUTlepULNGNZzBp5CkYjK9Wy7AphEcZ0wkQZgwJh94xDTw7CaxSOPaYvDD0Z2E7gG5oqwhDBkTofBVVpFbMHHWnbPxwFuGXB9oc7GgTsklJO2D62m49YYKI4zO4HzNzazN3AW4y0uP_BIPRtt0yqG3tWfKIZp5oCo-aQ8nG8',
    q: 'wzU6hrKeydHiDgACxI_nMIPL43LJzJMjxvz6Q4DiPZuH20cIBvyTEzbv_GXgVIXaOtmCREtTvwlwTlbsZBhxZpidOPES-EhnA7WZRADfroNbWct9RoOszqahgc_B3It0i9Xcx8ZaSjFHel9QCEY0asuEwHDhibdBTSI-LoHa_HE',
    dp: 'bH2diR7V8f25Ty4O2EpkaD2GUyTXTI0GvOlhgajl17vLD4ZjHqj1ubnPJiwpR291w0rjPf5C4b1Ixmled9mSyhtdoxgWzSbTo9A2l1A5PxeY8IQzDlZHeh4qEdQr9S9Inbe6g2VOqDpXa2n1tM4eZfqlDgJL0IYn_uwBwSl6tLE',
    dq: 'S2l20K6UlVcVw17Rsun84EsqKxYfS37UZX05mXZi8HXzSAzq1vggQV4J3DHnNf_3zKBWqNeI5NZaookGDa07seznYCYRtAUUduRi71h_EUYBtnDcVq9rxPGulx2RwQfG4HagMjU4kEz1VhsYKfolKdSx1j5FgxRej9PYvdLArKE',
    qi: 'SZQHn8L51zG43bGy0otnHrazwah1TUAdf1TE9NEeBdM2IObVdSbG1pkkFAs_6wlNfn7szvQeKXD7Ce23-wNHq3QqYg1nHvPrZYMOV7VASDagqUvyEdPP8JkovzgPsky0GR9FXPpbVmoDoXD8zjtSuazFAO-wXMBzK2YlkvKC34s',
    alg: 'RS256',
  },
  publicKey: {
    key_ops: ['verify'],
    ext: true,
    kty: 'RSA',
    n: 'ltZ3mhK1-M-k_dY-l-Y53B-rFiOGI8h2x8H0NHHQWqIHrlv7UT1SDUhVJcsv1ilWQjr6CBaABBrmPzrC_oA05ZPrqKIRNZGBD3iDAlLNTIp1j4hwQ0-rmndIMsgd4pfyLaCXpxMPDIt23J40_sNGy9ViJ6kc6IxQhLmr1FWzpRQCdoXt-YEL4mEINKI61YFRAi2bwxwSEi9rJs4VcS8BJCcDo7dHF4VXHV_KQOkuXC6Oj0XsqeyUlFW7HuAyksszUO4sfubt3JDt6aTpEZ5jcKi0wzUE2U8ItJPkKXzm8LDrPPRTwAczaln43CxuwB2jYrXsQGG_oUZv_bhATkRQ_w',
    e: 'AQAB',
    alg: 'RS256',
  },
  identifier: 'testKey#3HhobuvkEoemuVQnTCa5jz1k1KPajifg98DEVSGZ1vC4',
};

export const RSATestKeyFingerPrint =
  '3HhobuvkEoemuVQnTCa5jz1k1KPajifg98DEVSGZ1vC4';
export const ECTestKey: DecryptedKeyPair = {
  privateKey: {
    key_ops: ['sign'],
    ext: true,
    kty: 'EC',
    x: 'Fqjnj008-mC0IgOcbzglbi_NFh-zxryRNt7zPcqlu1I',
    y: 'DR1LuRrxRemGcnVBEzI_mVpBCAZNbOj76ThHIKl0lC0',
    d: '97VNPTBOInX61FuluyfzPcrlFKETig2kKjMDgvVR4so',
    crv: 'P-256',
  },
  publicKey: {
    key_ops: ['verify'],
    ext: true,
    kty: 'EC',
    x: 'Fqjnj008-mC0IgOcbzglbi_NFh-zxryRNt7zPcqlu1I',
    y: 'DR1LuRrxRemGcnVBEzI_mVpBCAZNbOj76ThHIKl0lC0',
    crv: 'P-256',
  },
  identifier: 'testKey#3jC2Vq3YpUBe3uGdUCHAnYz1iZFAKHTXmhs7Ev1QPCpP',
};
export const ECTestKeyFingerPrint =
  '3jC2Vq3YpUBe3uGdUCHAnYz1iZFAKHTXmhs7Ev1QPCpP';
