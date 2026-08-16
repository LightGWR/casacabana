import { supabase, requireConfiguration } from "./supabase.js";

const views = [...document.querySelectorAll(".site-view")];

const showView = (id, updateHash = true) => {
  const target = document.getElementById(id) || document.getElementById("inicio");
  views.forEach((view) => view.classList.toggle("active", view === target));
  if (updateHash) {
    history.pushState({ view: target.id }, "", target.id === "inicio" ? location.pathname : `#${target.id}`);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
};

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});
document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => showView("inicio"));
});
window.addEventListener("popstate", () => showView(location.hash.slice(1) || "inicio", false));
if (location.hash) showView(location.hash.slice(1), false);

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character]));
const image = (url, alt) => url ? `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">` : "";
const empty = (message) => `<div class="empty">${message}</div>`;

if (requireConfiguration()) {
  const [{ data: settings }, { data: menu, error: menuError }, { data: places, error: placesError }] = await Promise.all([
    supabase.from("house_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("menu_items").select("*").eq("active", true).order("sort_order"),
    supabase.from("eateries").select("*").eq("active", true).order("sort_order"),
  ]);

  document.querySelector("#house-location").innerHTML = settings ? `
    ${image(settings.image_url, "Casa Cabana")}<h3>${escapeHtml(settings.title || "Casa Cabana")}</h3>
    <p>${escapeHtml(settings.address || "Endereço ainda não informado.")}</p><p>${escapeHtml(settings.directions || "")}</p>
    ${settings.maps_url ? `<a class="btn" target="_blank" rel="noopener noreferrer" href="${escapeHtml(settings.maps_url)}">Abrir no Google Maps</a>` : ""}
  ` : empty("Localização ainda não cadastrada.");

  document.querySelector("#menu-list").innerHTML = !menuError && menu?.length ? menu.map((item) => `
    <article class="card">${image(item.image_url, item.name)}<div class="card-body"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description || "")}</p>${item.price != null ? `<strong>R$ ${Number(item.price).toFixed(2).replace(".", ",")}</strong>` : ""}</div></article>
  `).join("") : empty(menuError ? "Não foi possível carregar o cardápio." : "Cardápio ainda não cadastrado.");

  document.querySelector("#places-list").innerHTML = !placesError && places?.length ? places.map((place) => `
    <article class="card">${image(place.image_url, place.name)}<div class="card-body"><h3>${escapeHtml(place.name)}</h3><p>${escapeHtml(place.description || "")}</p>${place.maps_url ? `<a class="map-link" target="_blank" rel="noopener noreferrer" href="${escapeHtml(place.maps_url)}">Ver no Google Maps →</a>` : ""}</div></article>
  `).join("") : empty(placesError ? "Não foi possível carregar os locais." : "Locais ainda não cadastrados.");
}
