import {
  Configuration,
  DidGatewayApi,
  AxiosError,
  InviteRequest,
} from '@trustcerts/gateway';
import { promisify } from 'util';
import { Invite } from '@trustcerts/config';

export class DidCreator {
  /**
   * creates a fresh did with a unique identifier. Add controller when they are passed.
   *
   * @param values
   */

  private api: DidGatewayApi;
  private apiConfiguration: Configuration;

  constructor(gateways: string[], accessToken: string) {
    this.apiConfiguration = new Configuration({
      basePath: gateways[0],
      accessToken: accessToken,
    });
    this.api = new DidGatewayApi(this.apiConfiguration);
  }

  public async createNewInviteForDid(
    id: string,
    name: string,
    secret: string
  ): Promise<Invite> {
    // generate random DID

    const inviteValues: InviteRequest = {
      id: id,
      secret: secret,
      name: name,
      role: 'Client',
      force: true,
    };

    await this.api
      .gatewayDidControllerInvite(inviteValues)
      .then((res) => res.data)
      .catch((err: AxiosError) => {
        if (err.response) {
          throw Error(JSON.stringify(err.response.data));
        } else {
          throw Error('error');
        }
      });
    // wait a bit so the observers have time to sync. Otherwhise only the gateway has the new transaction already passed
    await promisify(setTimeout)(500);

    return {
      id: id,
      secret: secret,
      endpoint: this.apiConfiguration.basePath,
    };
  }
}
