import {
  DecryptedKeyPair,
  hashAlgorithm,
  RSACryptoKeyService,
} from '@trustcerts/crypto';

// TODO: Refactor RSA & EC cryptoKeyService tests / code reuse?
describe('test rsa-crypto-key-service.ts', () => {
  const testKey: DecryptedKeyPair<RsaHashedKeyGenParams> = {
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
    algorithm: {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: hashAlgorithm,
    },
  };

  const testKeyFingerPrint = '3HhobuvkEoemuVQnTCa5jz1k1KPajifg98DEVSGZ1vC4';

  let rsaCryptoKeyService: RSACryptoKeyService;

  beforeAll(async () => {
    rsaCryptoKeyService = new RSACryptoKeyService();
  }, 10000);
  it('test generateKeyPair', async () => {
    const keyPair = await rsaCryptoKeyService.generateKeyPair('testKey');

    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKey).toBeDefined();
  }, 7000);
  it('test getFingerPrint', async () => {
    const fingerPrintPrivateKey = await rsaCryptoKeyService.getFingerPrint(
      testKey.privateKey
    );
    expect(fingerPrintPrivateKey).toEqual(testKeyFingerPrint);

    const fingerPrintPublicKey = await rsaCryptoKeyService.getFingerPrint(
      testKey.publicKey
    );
    expect(fingerPrintPublicKey).toEqual(testKeyFingerPrint);
  }, 7000);
  it('test isCorrectKeyType', async () => {
    expect(
      await rsaCryptoKeyService.isCorrectKeyType(testKey.privateKey)
    ).toBeTruthy();
    expect(
      await rsaCryptoKeyService.isCorrectKeyType(testKey.publicKey)
    ).toBeTruthy();
  }, 7000);
});
