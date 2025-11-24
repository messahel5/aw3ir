import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeteoService {

  constructor() { }

  /**
   * Appel simple vers l'API OpenWeatherMap (current weather).
   * Retourne une Promise qui résout l'objet JSON si cod == 200, sinon rejection.
   */
  getMeteo(name: string): Promise<any> {
    const apiKey = 'cb3ec9c1be3b82f8b8f080e96244e8d2'; // <-- mettre votre clé ici
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(name)}&units=metric&lang=fr&appid=${apiKey}`;

    return fetch(url)
      .then(response => response.json())
      .then(json => {
        if (json.cod === 200) {
          return Promise.resolve(json);
        } else {
          return Promise.reject(json);
        }
      });
  }

  /**
   * Météo sur 5 jours (forecast)
   */
  getForecast(name: string): Promise<any> {
    const apiKey = 'cb3ec9c1be3b82f8b8f080e96244e8d2';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(name)}&units=metric&lang=fr&appid=${apiKey}`;

    return fetch(url)
      .then(response => response.json())
      .then(json => {
        if (json.cod === "200") {
          return Promise.resolve(json);
        } else {
          return Promise.reject(json);
        }
      });
  }
}
