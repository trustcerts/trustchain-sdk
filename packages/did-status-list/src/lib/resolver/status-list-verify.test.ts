import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import { CryptoService, defaultCryptoKeyService } from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { DidStatusListRegister } from '../register/did-status-list-register';
import { DidStatusListResolver } from './did-status-list-resolver';
import { StatusListIssuerService } from '../register/status-list-issuer-service';
import { WalletService } from '@trustcerts/wallet';
import { readFileSync } from 'fs';
import { Bitstring } from './bit-string';
import { base64Decode, base64Encode } from '@trustcerts/helpers';

describe('test statuslist service', () => {
  let config: ConfigService;
  let cryptoService: CryptoService;

  const testValues = JSON.parse(readFileSync('./tests/values.json', 'utf-8'));

  beforeAll(async () => {
    DidNetworks.add(testValues.network.namespace, testValues.network);
    Identifier.setNetwork(testValues.network.namespace);
    config = new LocalConfigService(testValues.filePath);
    await config.init(testValues.configValues);

    const wallet = new WalletService(config);
    await wallet.init();

    cryptoService = new CryptoService();
    const key = (
      await wallet.findOrCreate(
        VerificationRelationshipType.assertionMethod,
        defaultCryptoKeyService.algorithm
      )
    )[0];
    await cryptoService.init(key);
  }, 10000);

  it('check string', async () => {
    const decoded = Bitstring.decodeBits('H4sIAAAAAAAAA2NgGEAAAKh0odt9AAAA');
    const f1 = new Bitstring({ buffer: decoded });
    console.log(f1.encodeBits());
  });
  it('verify and read', async () => {
    if (!config.config.invite) throw new Error();
    const clientSchema = new StatusListIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const statusListLength = 1000;
    const statusListDid = DidStatusListRegister.create({
      controllers: [config.config.invite.id],
      length: statusListLength,
    });

    const revokeId = 10;
    for (let i = 0; i < statusListDid.getLength(); i++) {
      expect(statusListDid.isRevoked(i)).toEqual(false);
    }
    statusListDid.setRevoked(revokeId);
    for (let i = 0; i < statusListDid.getLength(); i++) {
      expect(statusListDid.isRevoked(i)).toEqual(i == revokeId);
    }
    await DidStatusListRegister.save(statusListDid, clientSchema);

    // Read DID doc from ledger and expect to get original DID document
    const loadedStatusListByTransactions =
      await new DidStatusListResolver().load(statusListDid.id, { doc: false });
    const loadedStatusListByDoc = await new DidStatusListResolver().load(
      statusListDid.id,
      { doc: true }
    );

    expect(loadedStatusListByTransactions.getDocument()).toEqual(
      statusListDid.getDocument()
    );
    expect(loadedStatusListByDoc.getDocument()).toEqual(
      statusListDid.getDocument()
    );
  }, 10000);

  it('test out of range', async () => {
    if (!config.config.invite) throw new Error();
    const statusListLength = 1000;
    const statusListDid = DidStatusListRegister.create({
      controllers: [config.config.invite.id],
      length: statusListLength,
    });

    expect(() => statusListDid.isRevoked(statusListLength)).toThrowError(
      'is out of range'
    );
  }, 10000);

  it('test invalid did', async () => {
    const invalidDid = `did:trust:${testValues.network.namespace}:statuslist:123456789a123456789a12`;
    await expect(
      new DidStatusListResolver().load(invalidDid, { doc: false })
    ).rejects.toThrowError('no transactions found');
    await expect(
      new DidStatusListResolver().load(invalidDid, { doc: true })
    ).rejects.toThrowError('no did doc found');
  }, 10000);
});
