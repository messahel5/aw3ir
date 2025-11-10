// ===============================
// form-validation.js
// ===============================

// variables globales pour la carte
let map;
let marker;

// -------------------------
// compteur de caractères
// -------------------------
function calcNbChar(id) {
  const input = document.getElementById(id);
  const row = input.closest(".row");
  const counter = row ? row.querySelector("[data-count]") : null;
  if (counter) {
    counter.textContent = input.value.length + " car.";
  }
}

// -------------------------
// localStorage : CRUD simple
// -------------------------
function getContactList() {
  const str = localStorage.getItem("contactList");
  return str ? JSON.parse(str) : [];
}

function saveContactList(list) {
  localStorage.setItem("contactList", JSON.stringify(list));
}

function addContact(name, firstname, birth, adress, mail) {
  const list = getContactList();
  list.push({
    name: name,
    firstname: firstname,
    date: birth,
    adress: adress,
    mail: mail,
  });
  saveContactList(list);
  return list;
}

function resetContacts() {
  localStorage.removeItem("contactList");
}

// -------------------------
// affichage du tableau
// -------------------------
function displayContactList() {
  const list = getContactList();
  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = "";
  list.forEach((contact) => {
    tbody.innerHTML += `
      <tr>
        <td>${contact.name}</td>
        <td>${contact.firstname}</td>
        <td>${contact.date || ""}</td>
        <td>${contact.adress || ""}</td>
        <td>${contact.mail ? `<a href="mailto:${contact.mail}">${contact.mail}</a>` : ""}</td>
      </tr>
    `;
  });
}

// -------------------------
// validation du formulaire
// -------------------------
function isValidForm() {
  const name = document.getElementById("name");
  const firstname = document.getElementById("firstname");
  const birth = document.getElementById("birth");
  const adress = document.getElementById("adresse");
  const mail = document.getElementById("mail");

  let ok = true;

  // nom
  if (name.value.trim().length < 5) {
    name.classList.add("is-invalid");
    ok = false;
  } else {
    name.classList.remove("is-invalid");
  }

  // prénom
  if (firstname.value.trim().length < 5) {
    firstname.classList.add("is-invalid");
    ok = false;
  } else {
    firstname.classList.remove("is-invalid");
  }

  // date pas dans le futur
  if (birth.value) {
    const today = new Date().toISOString().split("T")[0];
    if (birth.value > today) {
      birth.classList.add("is-invalid");
      ok = false;
    } else {
      birth.classList.remove("is-invalid");
    }
  } else {
    birth.classList.add("is-invalid");
    ok = false;
  }

  // adresse
  if (adress.value.trim().length < 5) {
    adress.classList.add("is-invalid");
    ok = false;
  } else {
    adress.classList.remove("is-invalid");
  }

  // mail (on laisse le navigateur faire une partie du boulot)
  if (!mail.checkValidity()) {
    mail.classList.add("is-invalid");
    ok = false;
  } else {
    mail.classList.remove("is-invalid");
  }

  return ok;
}

// -------------------------
// géolocalisation + Leaflet
// -------------------------

// bouton 📍 → demande la géolocalisation
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("La géolocalisation n'est pas supportée par ce navigateur.");
  }
}

// appelé quand la géoloc réussit
function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  initOrMoveMap(lat, lon);

  // placer un marqueur sur la position actuelle
  placeMarker(lat, lon);

  // on peut pré-remplir au moins avec les coords
  // (le clic sur la carte fera le reverse geocoding plus propre)
  // document.getElementById("adresse").value = lat.toFixed(5) + ", " + lon.toFixed(5);
}

// crée la carte si elle n'existe pas, sinon déplace la vue
function initOrMoveMap(lat, lon) {
  if (!map) {
    // #map doit exister dans le HTML
    map = L.map("map").setView([lat, lon], 13);

    // fond de carte OSM
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // clic sur la carte → on récupère l'adresse
    map.on("click", onMapClick);
  } else {
    map.setView([lat, lon], 13);
  }
}

// place ou déplace le marker
function placeMarker(lat, lon) {
  if (marker) {
    marker.setLatLng([lat, lon]);
  } else {
    marker = L.marker([lat, lon]).addTo(map);
  }
}

// quand on clique sur la carte
function onMapClick(e) {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  placeMarker(lat, lon);

  // reverse geocoding via Nominatim
  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data && data.display_name) {
        document.getElementById("adresse").value = data.display_name;
      } else {
        document.getElementById("adresse").value =
          lat.toFixed(5) + ", " + lon.toFixed(5);
      }
    })
    .catch((err) => {
      console.error("Erreur reverse geocoding :", err);
      document.getElementById("adresse").value =
        lat.toFixed(5) + ", " + lon.toFixed(5);
    });
}

// si la géoloc échoue
function showError(error) {
  console.warn("Géolocalisation échouée :", error);
  // on peut afficher une carte sur Paris par défaut pour ne pas laisser vide
  const lat = 48.8566;
  const lon = 2.3522;
  initOrMoveMap(lat, lon);
  placeMarker(lat, lon);
}

// -------------------------
// au chargement de la page
// -------------------------
window.addEventListener("DOMContentLoaded", function () {
  // afficher ce qu'il y a dans le localStorage
  displayContactList();

  // formulaire
  const form = document.getElementById("contactForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!isValidForm()) {
      return;
    }

    const name = document.getElementById("name").value.trim();
    const firstname = document.getElementById("firstname").value.trim();
    const birth = document.getElementById("birth").value;
    const adress = document.getElementById("adresse").value.trim();
    const mail = document.getElementById("mail").value.trim();

    addContact(name, firstname, birth, adress, mail);
    displayContactList();

    // vider le formulaire
    form.reset();

    // remettre les compteurs à 0
    document.querySelectorAll("[data-count]").forEach((el) => {
      el.textContent = "0 car.";
    });
  });

  // bouton reset
  document.getElementById("reset").addEventListener("click", function () {
    resetContacts();
    displayContactList();
  });

  // bouton gps
  document.getElementById("gps").addEventListener("click", function () {
    getLocation();
  });
});
