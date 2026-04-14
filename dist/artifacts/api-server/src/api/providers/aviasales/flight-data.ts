export class FlightDataProvider {
  private token: string;
  private marker: string;
  
  constructor(token: string, marker: string) {
    this.token = token;
    this.marker = marker;
  }

  async searchFlights(params: {
    origin: string,
    destination: string,
    departDate: string,
    returnDate?: string,
    currency?: string
  }) {
    try {
      const { origin, destination, departDate, returnDate, currency = 'usd' } = params;
      
      // بناء URL مع الباراميترز
      const url = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
      url.searchParams.set('origin', origin);
      url.searchParams.set('destination', destination);
      url.searchParams.set('depart_date', departDate);
      if (returnDate) url.searchParams.set('return_date', returnDate);
      url.searchParams.set('currency', currency);
      url.searchParams.set('token', this.token);
      url.searchParams.set('market', 'ru');
      url.searchParams.set('limit', '30');
      
      const response = await fetch(url.toString(), {
        timeout: 5000
      });

      if (!response.ok) return [];
      
      const data = await response.json();
      if (!data.success || !data.data) return [];

      return data.data.map((flight: any) => ({
        price: flight.price,
        airline: flight.airline,
        flight_number: flight.flight_number,
        departure_at: flight.departure_at,
        return_at: flight.return_at,
        link: this.buildBookingLink(origin, destination, flight.departure_at),
        expires_at: flight.expires_at
      }));
    } catch (error) {
      console.error('Flight search error:', error);
      return [];
    }
  }

  private buildBookingLink(origin: string, destination: string, date: string) {
    const d = date.replace(/-/g, '');
    return `https://www.aviasales.ru/search/${origin}${d.slice(4,8)}${destination}1?marker=${this.marker}`;
  }
}