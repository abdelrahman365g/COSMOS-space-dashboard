let apodImage = document.querySelector("#apod-image");
let apodTitle = document.querySelector("#apod-title");
let apodExplanation = document.querySelector("#apod-explanation");
let apodDateDetail = document.querySelector("#apod-date-detail");
let apodDate = document.querySelector("#todays-date");
let apodDateInfo = document.querySelector("#apod-date-info");
let inputDate = document.querySelector("#input-date");
let apodMediaType = document.querySelector("#apod-media-type");
let apodCopyright = document.querySelector("#apod-copyright");
let apodLoading = document.querySelector("#apod-loading");
let dateInput = document.querySelector("#apod-date-input");
let loadDateBtn = document.querySelector("#load-date-btn");
let todayBtn = document.querySelector("#today-apod-btn");
let viewBtn = document.querySelector("#view-btn");
let navButtons = document.querySelectorAll(".nav-link");
let sections = document.querySelectorAll(".app-section");
let launchesGrid = document.querySelector("#launches-grid");
let highResolutionImage;

const key = "MJhDosaSqI2E8eY5SrFCHDDTGVn95QchzjwkL5h6";

let planetsList = [];

async function loadApod(d = null) {
  apodLoading.classList.remove("hidden");
  apodImage.classList.add("hidden");
  let date = new Date();
  let formattedDate = d ? d : date.toISOString().split("T")[0];
  let longDate = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const url = new URL(`https://api.nasa.gov/planetary/apod?api_key=${key}`);
  if (d) url.searchParams.set("date", formattedDate);

  try {
    const res = await fetch(url);
    const data = await res.json();
    highResolutionImage = data.hdurl;
    apodTitle.textContent = data.title;
    apodExplanation.textContent = data.explanation;
    apodDateDetail.textContent = longDate;
    apodDate.textContent = longDate;
    apodDateInfo.textContent = longDate;
    inputDate.textContent = formattedDate;
    apodMediaType.textContent = data.media_type;
    apodCopyright.innerHTML = data.copyright
      ? `&copy; ${data.copyright}`
      : "&copy; NASA";

    if (data.media_type === "image") {
      apodImage.src = data.url;
    } else {
      apodImage.src = "./assets/images/launch-placeholder.png";
    }
    apodImage.classList.remove("hidden");
    apodLoading.classList.add("hidden");
  } catch (err) {
    apodLoading.classList.add("hidden");
    console.error("APOD API error ", err);
  }
}
loadApod();

async function loadLaunches() {
  try {
    const res = await fetch(
      "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=10"
    );
    const data = await res.json();
    const launches = data.results;

    if (launches && launches.length > 0) {
      firstLaunch(launches[0]);
      launchCards(launches);

      const count = data.count || launches.length;
      document.querySelector(
        "#launches-count"
      ).textContent = `${count} Launches`;
      document.querySelector("#launches-count-mobile").textContent = count;
    }
  } catch (err) {
    console.error("Launch API error:", err);
  }
}

async function firstLaunch(launch) {
  let currentDate = new Date(launch.net);
  let now = new Date().getTime();
  let remain = currentDate.getTime() - now;
  let days = Math.floor(remain / (1000 * 60 * 60 * 24));
  document.querySelector("#remaining").textContent = days > 0 ? days : 0;
  document.querySelector("#first-launch-name").textContent =
    launch.name || "Unknown Mission";
  document.querySelector("#first-launch-type").textContent =
    launch.rocket.configuration.name || "Unknown Rocket";
  document.querySelector("#first-launch-date").textContent =
    currentDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) || "TBD";
  document.querySelector("#first-launch-time").textContent =
    currentDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }) + " UTC" || "TBD";
  document.querySelector("#first-launch-location").textContent =
    launch.pad.location.name || "Unknown Location";
  document.querySelector("#first-launch-country").textContent =
    launch.pad.country.name || "N/A";
  document.querySelector("#first-launch-description").textContent =
    launch.mission?.description || "No mission description available.";

  let launchImage = document.querySelector("#first-launch-image");
  if (launch.image.image_url) {
    launchImage.innerHTML = `<img class="w-full h-full object-cover rounded-2xl" src="${launch.image.image_url}" />`;
  } else {
    launchImage.innerHTML = `<div class="flex items-center justify-center h-full bg-slate-800"><i class="fas fa-rocket text-9xl text-slate-700/50"></i></div>`;
  }
}

function launchCards(launches) {
  launchesGrid.innerHTML = "";
  let cardsHTML = "";
  launches.slice(1, 10).forEach((launch) => {
    const status = launch.status.abbrev;
    cardsHTML += `
      <div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer">
        <div class="relative h-48 bg-slate-900/50 flex items-center justify-center">
          ${
            launch.image?.image_url
              ? `<img src="${launch.image.image_url}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='./assets/images/launch-placeholder.png';"/>`
              : `<img src="./assets/images/launch-placeholder.png" class="w-full h-full object-cover"/>`
          }
          <div class="absolute top-3 right-3">
            <span class="px-3 py-1 bg-green-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold">
              ${status}
            </span>
          </div>
        </div>
        <div class="p-5">
          <div class="mb-3">
            <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
              ${launch.name || "Unknown Mission"}
            </h4>
            <p class="text-sm text-slate-400 flex items-center gap-2">
              <i class="fas fa-building text-xs"></i>
              ${launch.launch_service_provider.name || "Unknown Provider"}
            </p>
          </div>
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-sm">
              <i class="fas fa-calendar text-slate-500 w-4"></i>
              <span class="text-slate-300">
                ${
                  launch.net
                    ? new Date(launch.net).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "TBD"
                }
              </span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <i class="fas fa-clock text-slate-500 w-4"></i>
              <span class="text-slate-300">
                ${
                  launch.net
                    ? new Date(launch.net).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) + " UTC"
                    : "TBD"
                }
              </span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <i class="fas fa-rocket text-slate-500 w-4"></i>
              <span class="text-slate-300">${
                launch.rocket.configuration.name || "Unknown Rocket"
              }</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
              <span class="text-slate-300 line-clamp-1">${
                launch.pad.location.name || "Unknown Location"
              }</span>
            </div>
          </div>
          <div class="flex items-center gap-2 pt-4 border-t border-slate-700">
            <button class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">
              Details
            </button>
            <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });
  launchesGrid.innerHTML = cardsHTML;
}

async function loadPlanets() {
  try {
    const res = await fetch(
      "https://solar-system-opendata-proxy.vercel.app/api/planets"
    );
    const data = await res.json();

    planetsList = data.bodies.filter((body) => body.isPlanet);
  } catch (err) {
    console.error("Planets API error:", err);
  }
}

function updateFacts(planet) {
  const facts = [];

  if (planet.moons?.length) {
    facts.push(`${planet.moons.length} known moons`);
  }

  if (planet.gravity) {
    facts.push(`Surface gravity: ${planet.gravity} m/s²`);
  }

  if (planet.avgTemp) {
    facts.push(`Average temperature: ${planet.avgTemp - 273}°C`);
  }

  const ul = document.querySelector("#planet-facts");
  ul.innerHTML = "";

  facts.forEach((fact) => {
    const li = document.createElement("li");
    li.className = "flex items-start";
    li.innerHTML = `
      <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
      <span class="text-slate-300">${fact}</span>
    `;
    ul.appendChild(li);
  });
}

function setPlanet(planet) {
  const id = planet.englishName.toLowerCase();

  updateFacts(planet);

  document.querySelector("#planet-detail-name").textContent =
    planet.englishName;

  document.querySelector(
    "#planet-detail-image"
  ).src = `./assets/images/${id}.png`;

  document.querySelector("#planet-detail-description").textContent =
    planet.description ||
    `${planet.englishName} is one of the planets in our solar system.`;

  document.querySelector("#planet-distance").textContent = planet.semimajorAxis
    ? `${planet.semimajorAxis.toLocaleString()} km`
    : "N/A";

  document.querySelector("#planet-radius").textContent = planet.meanRadius
    ? `${planet.meanRadius.toLocaleString()} km`
    : "N/A";

  document.querySelector("#planet-mass").textContent = planet.mass
    ? `${planet.mass.massValue} × 10²⁴ kg`
    : "N/A";

  document.querySelector("#planet-density").textContent = planet.density
    ? `${planet.density} g/cm³`
    : "N/A";

  document.querySelector("#planet-gravity").textContent = planet.gravity
    ? `${planet.gravity} m/s²`
    : "N/A";

  document.querySelector("#planet-orbital-period").textContent =
    planet.sideralOrbit ? `${planet.sideralOrbit} days` : "N/A";

  document.querySelector("#planet-rotation").textContent =
    planet.sideralRotation ? `${planet.sideralRotation} hours` : "N/A";

  document.querySelector("#planet-moons").textContent =
    planet.moons?.length || 0;

  document.querySelector("#planet-discoverer").textContent =
    planet.discoveredBy || "Unknown";

  document.querySelector("#planet-discovery-date").textContent =
    planet.discoveryDate || "Ancient";

  document.querySelector("#planet-body-type").textContent = planet.isPlanet
    ? "Planet"
    : "Other";

  document.querySelector("#planet-perihelion").textContent = planet.perihelion
    ? `${planet.perihelion.toLocaleString()} km`
    : "N/A";

  document.querySelector("#planet-aphelion").textContent = planet.aphelion
    ? `${planet.aphelion.toLocaleString()} km`
    : "N/A";

  document.querySelector("#planet-eccentricity").textContent =
    planet.eccentricity ?? "N/A";

  document.querySelector("#planet-inclination").textContent = planet.inclination
    ? `${planet.inclination}°`
    : "0°";

  document.querySelector("#planet-axial-tilt").textContent = planet.axialTilt
    ? `${planet.axialTilt}°`
    : "N/A";

  document.querySelector("#planet-temp").textContent = planet.avgTemp
    ? `${planet.avgTemp - 273}°C`
    : "N/A";

  document.querySelector("#planet-escape").textContent = planet.escape
    ? `${planet.escape} km/s`
    : "N/A";
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const target = btn.dataset.section;
    if (target == "launches") loadLaunches();
    else if (target == "planets") loadPlanets();

    sections.forEach((sec) => {
      if (sec.dataset.section !== target) sec.classList.add("hidden");
      else sec.classList.remove("hidden");
    });

    navButtons.forEach((button) =>
      button.classList.remove("bg-blue-500/10", "text-blue-400")
    );
    btn.classList.add("bg-blue-500/10", "text-blue-400");
  });
});
dateInput.addEventListener("input", () => {
  loadApod(dateInput.value);
});
loadDateBtn.addEventListener("click", () => {
  loadApod(dateInput.value);
});

todayBtn.addEventListener("click", () => {
  loadApod();
});

document.querySelectorAll(".planet-card").forEach((card) => {
  card.addEventListener("click", () => {
    const id = card.dataset.planetId.toLowerCase();
    const planet = planetsList.find((p) => p.englishName.toLowerCase() === id);

    setPlanet(planet);
  });
});
viewBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  window.open(highResolutionImage, "_blank");
});

document.querySelector("#sidebar-toggle").addEventListener("click", () => {
  document.querySelector("#sidebar").classList.toggle("sidebar-mobile");
});
document.addEventListener("click", ({ target }) => {
  let toggleBtn = document.querySelector("#sidebar-toggle");
  let sidebar = document.querySelector("#sidebar");
  if (
    !sidebar.contains(target) &&
    !sidebar.classList.contains("sidebar-mobile") &&
    !toggleBtn.contains(target)
  ) {
    sidebar.classList.add("sidebar-mobile");
  }
});
