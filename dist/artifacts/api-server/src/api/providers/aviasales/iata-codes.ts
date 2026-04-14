export class IATACodesProvider {
  private iataDatabase: Map<string, any> = new Map();
  
  async loadDatabase() {
    try {
      // قاعدة بيانات IATA الرسمية من Aviasales
      const response = await fetch('https://www.travelpayouts.com/widgets/iata.json');
      const data = await response.json();
      
      // بناء Index للبحث السريع
      data.forEach((item: any) => {
        this.iataDatabase.set(item.code.toLowerCase(), {
          code: item.code,
          name: item.name,
          country: item.country_code,
          coordinates: item.coordinates,
          timezone: item.timezone
        });
        
        // إضافة الاسم كامل للبحث
        if (item.name) {
          this.iataDatabase.set(item.name.toLowerCase(), item.code);
        }
      });
      
      console.log(`✅ IATA database loaded: ${data.length} airports`);
    } catch (error) {
      console.error('Failed to load IATA database:', error);
    }
  }

  getIATACode(cityName: string): string | null {
    const result = this.iataDatabase.get(cityName.toLowerCase());
    if (typeof result === 'string') return result;
    return result?.code || null;
  }

  searchCity(query: string) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    for (const [key, value] of this.iataDatabase) {
      if (key.includes(lowerQuery)) {
        results.push({
          code: typeof value === 'string' ? value : value.code,
          name: typeof value === 'string' ? key : value.name,
          country: typeof value === 'string' ? null : value.country
        });
      }
      if (results.length >= 10) break;
    }
    
    return results;
  }
}