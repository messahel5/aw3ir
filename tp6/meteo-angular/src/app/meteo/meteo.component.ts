import { Component, OnInit } from '@angular/core';
import { MeteoItem } from '../meteoItem';

@Component({
  selector: 'app-meteo',
  templateUrl: './meteo.component.html',
  styleUrls: ['./meteo.component.css']
})
export class MeteoComponent implements OnInit {

  city: MeteoItem = { name: '', id: 0, weather: null };
  cityList: MeteoItem[] = [];

  constructor() { }

  ngOnInit(): void {
    const stored = localStorage.getItem('cityList');
    if (stored) {
      this.cityList = JSON.parse(stored);
    } else {
      this.cityList = [];
    }
  }

  onSubmit(): void {
    if (!this.city.name) return;
    if (!this.isCityExist(this.city.name)) {
      const c = new MeteoItem();
      c.name = this.city.name.trim();
      this.cityList.push(c);
      this.saveCityList();
      this.city.name = '';
    } else {
      console.log(`${this.city.name} existe déjà`);
    }
  }

  remove(_city: MeteoItem) {
    this.cityList = this.cityList.filter(item => item.name?.toUpperCase() !== _city.name?.toUpperCase());
    this.saveCityList();
  }

  isCityExist(_cityName: string): boolean {
    return this.cityList.some(item => item.name?.toUpperCase() === _cityName.toUpperCase());
  }

  saveCityList() {
    localStorage.setItem('cityList', JSON.stringify(this.cityList));
  }
}
