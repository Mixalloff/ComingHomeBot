import * as config from '../../app.config.json' assert { type: 'json' };
const { COMING_HOME_API_URL, AUTHORIZATION_COMING_HOME_STRING } = config.default;

export class ComingHomeIntegrationService { 
  
  /**
   * Request new data from server
   * @returns Promise with a new data or with null 
   */
  async fetchData(): Promise<IApartmentsListResponse | null> {
    const encodedAuth = Buffer.from(AUTHORIZATION_COMING_HOME_STRING).toString('base64');
    try {
      const response = await fetch(COMING_HOME_API_URL, {
        headers: {
          'Authorization': `Basic ${encodedAuth}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.statusText}`);
      }
      return await response.json() as any;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }
}
