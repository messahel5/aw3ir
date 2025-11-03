window.onload = function () {
    console.log("DOM ready!");
  
    const form = document.getElementById("form");
  
    form.addEventListener("submit", function (event) {
      event.preventDefault();
  
      // Récupération des champs
      const lastname = document.getElementById("lastname");
      const firstname = document.getElementById("firstname");
      const birthday = document.getElementById("birthday");
      const address = document.getElementById("address");
      const email = document.getElementById("email");
  
      // Fonctions utilitaires
      const isMinLen = (el, n = 5) => (el.value || "").trim().length >= n;
      const setValidity = (el, ok) => {
        el.classList.toggle("is-invalid", !ok);
        el.classList.toggle("is-valid", ok);
      };
  
      // Validation des champs
      const okLast = isMinLen(lastname);
      const okFirst = isMinLen(firstname);
      const okAddr = isMinLen(address);
      const okMail = validateEmail(email.value);
  
      const birthdayDate = birthday.value ? new Date(birthday.value) : null;
      const nowTs = Date.now();
      const okBirth = !!birthdayDate && birthdayDate.getTime() <= nowTs;
  
      setValidity(lastname, okLast);
      setValidity(firstname, okFirst);
      setValidity(address, okAddr);
      setValidity(email, okMail);
      setValidity(birthday, okBirth);
  
      if (!(okLast && okFirst && okAddr && okMail && okBirth)) {
        showModal(
          "Erreur ❌",
          `<p>Veuillez remplir correctement tous les champs.</p>`
        );
        return;
      }
  
      // ✅ Tout est valide : message de bienvenue + carte Google Maps
      const fullName = firstname.value.trim() + " " + lastname.value.trim();
      const birthStr = birthday.value.split("-").reverse().join("/"); // format JJ/MM/AAAA
      const location = address.value.trim();
  
      const googleMapLink = `http://maps.google.com/maps?q=${encodeURIComponent(location)}`;
      const googleMapImage = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
        location
      )}&zoom=5&size=400x250&markers=color:red|${encodeURIComponent(
        location
      )}&key=AIzaSyAkmvI9DazzG9p77IShsz_Di7-5Qn7zkcg`;
  
      const content = `
        <p>Vous êtes né le <strong>${birthStr}</strong> et vous habitez</p>
        <a href="${googleMapLink}" target="_blank">
          <img src="${googleMapImage}" alt="Carte de ${location}" class="img-fluid rounded mb-2"/>
        </a><br/>
        <small>${location}</small>
      `;
  
      showModal(`Bienvenue ${firstname.value.trim()} 👋`, content, true);
    });
  };
  
  // Validation email
  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  // Affichage de la modale avec style dynamique
  function showModal(title, contentHTML, success = false) {
    const modalEl = document.getElementById("myModal");
    const header = modalEl.querySelector(".modal-header");
    const titleEl = modalEl.querySelector(".modal-title");
    const bodyEl = modalEl.querySelector(".modal-body");
  
    // Couleur de l’en-tête selon le résultat
    if (success) {
      header.classList.remove("error");
      header.classList.add("success");
    } else {
      header.classList.remove("success");
      header.classList.add("error");
    }
  
    titleEl.textContent = title;
    bodyEl.innerHTML = contentHTML;
  
    const myModal = new bootstrap.Modal(modalEl);
    myModal.show();
  }
  