document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }
  loadSiteSettings();
});

function formatDate(isoDate, lang){
  try{
    const d = new Date(isoDate);
    return d.toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", {
      year: "numeric", month: "long", day: "numeric"
    });
  }catch(e){ return isoDate; }
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

const API_BASE = "/api";

async function apiGet(path){
  const res = await fetch(`${API_BASE}${path}`);
  if(!res.ok){
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur API ${res.status}`);
  }
  return res.json();
}

async function apiPost(path, body){
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if(!res.ok){
    const b = await res.json().catch(() => ({}));
    throw new Error(b.error || `Erreur API ${res.status}`);
  }
  return res.json();
}

async function loadSiteSettings(){
  try{
    const settings = await apiGet("/settings");
    if(settings.site_phone){
      document.querySelectorAll("footer").forEach(f => {
        f.querySelectorAll("p").forEach(p => {
          if(p.textContent.includes("Tél") || p.textContent.includes("05458585525")){
            const telLink = document.createElement("a");
            telLink.href = "tel:+212" + settings.site_phone.replace(/^0/, "");
            telLink.textContent = settings.site_phone;
            p.innerHTML = "";
            p.appendChild(document.createTextNode("Tél : "));
            p.appendChild(telLink);
          }
        });
      });
      document.querySelectorAll(".info-row a[href^='tel:']").forEach(el => {
        el.textContent = settings.site_phone;
        el.href = "tel:+212" + settings.site_phone.replace(/^0/, "");
      });
    }
    if(settings.site_email){
      document.querySelectorAll("footer").forEach(f => {
        f.querySelectorAll("p").forEach(p => {
          if(p.textContent.includes("Email") || p.textContent.includes("contact@tarmigt.ma")){
            p.innerHTML = "Email : <a href='mailto:" + escapeHtml(settings.site_email) + "'>" + escapeHtml(settings.site_email) + "</a>";
          }
        });
      });
      document.querySelectorAll(".info-row a[href^='mailto:']").forEach(el => {
        el.textContent = settings.site_email;
        el.href = "mailto:" + settings.site_email;
      });
    }
    if(settings.site_address){
      document.querySelectorAll("[data-i18n='footer_address']").forEach(el => {
        el.textContent = settings.site_address;
      });
    }
  }catch(e){
    // Settings API unavailable, use defaults
  }
}
