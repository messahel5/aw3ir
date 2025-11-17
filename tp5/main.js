// main.js

// Clé API OpenWeatherMap fournie ////////
const API_KEY = "cb3ec9c1be3b82f8b8f080e96244e8d2";

var app;
window.onload = function () {
  app = new Vue({
    el: "#weatherApp",

    data: {
      loaded: false,

      // champ du formulaire
      formCityName: "",

      message: "WebApp Loaded.",
      messageForm: "",

      // liste des villes
      cityList: [
        { name: "Paris" }
      ],

      // météo de la ville sélectionnée
      cityWeather: null,

      // indicateur de chargement
      cityWeatherLoading: false
    },

    // exécuté quand Vue est prêt
    mounted: function () {
      this.loaded = true;
      this.readData();
    },

    methods: {
      // juste pour voir dans la console
      readData: function () {
        console.log("JSON.stringify(this.cityList)", JSON.stringify(this.cityList));
        console.log("this.loaded:", this.loaded);
      },

      // ajout d'une ville
      addCity: function (event) {
        event.preventDefault(); // éviter le rechargement

        if (this.isCityExist(this.formCityName)) {
          this.messageForm = "Cette ville existe déjà dans la liste.";
        } else {
          this.cityList.push({ name: this.formCityName.trim() });
          this.messageForm = "";
          this.formCityName = "";
        }
      },

      // vérifie si une ville existe déjà
      isCityExist: function (_cityName) {
        if (
          this.cityList.filter(
            (item) =>
              item.name.toUpperCase() == _cityName.toUpperCase().trim()
          ).length > 0
        ) {
          return true;
        } else {
          return false;
        }
      },

      // supprimer une ville
      remove: function (_city) {
        this.cityList = this.cityList.filter(
          (item) => item.name != _city.name
        );
      },

      // récupérer la météo d'une ville par son nom
      meteo: function (_city) {
        this.cityWeatherLoading = true;
        this.message = "Chargement de la météo pour " + _city.name + "...";

        const url =
          "https://api.openweathermap.org/data/2.5/weather?q=" +
          encodeURIComponent(_city.name) +
          "&units=metric&lang=fr&appid=" +
          API_KEY;

        fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(function (json) {
            app.cityWeatherLoading = false;

            if (json.cod == 200) {
              app.cityWeather = json;
              app.message = null;
              console.log("Réponse météo : ", json);
            } else {
              app.cityWeather = null;
              app.message =
                "Météo introuvable pour " +
                _city.name +
                " (" +
                json.message +
                ")";
            }
          })
          .catch(function (err) {
            app.cityWeatherLoading = false;
            app.cityWeather = null;
            app.message =
              "Erreur lors de l'appel OpenWeatherMap : " + err;
          });
      },

      // récupérer la météo à partir de la position GPS de l'utilisateur
      maPosition: function () {
        if (!navigator.geolocation) {
          this.message =
            "La géolocalisation n'est pas supportée par ce navigateur.";
          return;
        }

        this.cityWeatherLoading = true;
        this.message = "Recherche de votre position...";

        var self = this;

        navigator.geolocation.getCurrentPosition(
          function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            self.message =
              "Chargement de la météo pour vos coordonnées (" +
              lat.toFixed(3) +
              ", " +
              lon.toFixed(3) +
              ")...";

            const url =
              "https://api.openweathermap.org/data/2.5/weather?lat=" +
              lat +
              "&lon=" +
              lon +
              "&units=metric&lang=fr&appid=" +
              API_KEY;

            fetch(url)
              .then(function (response) {
                return response.json();
              })
              .then(function (json) {
                self.cityWeatherLoading = false;

                if (json.cod == 200) {
                  self.cityWeather = json;
                  self.message = null;

                  // ajouter la ville à la liste si absente
                  if (!self.isCityExist(json.name)) {
                    self.cityList.push({ name: json.name });
                  }

                  console.log("Météo position actuelle :", json);
                } else {
                  self.cityWeather = null;
                  self.message =
                    "Météo introuvable pour vos coordonnées (" +
                    json.message +
                    ")";
                }
              })
              .catch(function (err) {
                self.cityWeatherLoading = false;
                self.cityWeather = null;
                self.message =
                  "Erreur lors de l'appel OpenWeatherMap pour votre position : " +
                  err;
              });
          },
          function (error) {
            self.cityWeatherLoading = false;
            switch (error.code) {
              case error.PERMISSION_DENIED:
                self.message = "Permission refusée pour la géolocalisation.";
                break;
              case error.POSITION_UNAVAILABLE:
                self.message = "Position indisponible.";
                break;
              case error.TIMEOUT:
                self.message = "Délai dépassé pour la géolocalisation.";
                break;
              default:
                self.message = "Erreur de géolocalisation inconnue.";
            }
          }
        );
      }
    },

    // propriétés calculées
    computed: {
      cityWheaterDate: function () {
        if (this.cityWeather !== null) {
          var date = new Date(this.cityWeather.dt * 1000);
          var minutes =
            date.getMinutes() < 10
              ? "0" + date.getMinutes()
              : date.getMinutes();
          return date.getHours() + ":" + minutes;
        } else {
          return "";
        }
      },
      cityWheaterSunrise: function () {
        if (this.cityWeather !== null) {
          var date = new Date(this.cityWeather.sys.sunrise * 1000);
          var minutes =
            date.getMinutes() < 10
              ? "0" + date.getMinutes()
              : date.getMinutes();
          return date.getHours() + ":" + minutes;
        } else {
          return "";
        }
      },
      cityWheaterSunset: function () {
        if (this.cityWeather !== null) {
          var date = new Date(this.cityWeather.sys.sunset * 1000);
          var minutes =
            date.getMinutes() < 10
              ? "0" + date.getMinutes()
              : date.getMinutes();
          return date.getHours() + ":" + minutes;
        } else {
          return "";
        }
      },

      // zone d'affichage de la carte openstreetmap
      openStreetMapArea: function () {
        if (this.cityWeather !== null) {
          const zoom = 8;
          const delta = 0.05 / Math.pow(2, zoom - 10);

          const bboxEdges = {
            south: this.cityWeather.coord.lat - delta,
            north: this.cityWeather.coord.lat + delta,
            west: this.cityWeather.coord.lon - delta,
            east: this.cityWeather.coord.lon + delta
          };

          return (
            bboxEdges.west +
            "%2C" +
            bboxEdges.south +
            "%2C" +
            bboxEdges.east +
            "%2C" +
            bboxEdges.north
          );
        } else {
          return "";
        }
      }
    }
  });
};
