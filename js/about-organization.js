const organizationChart = document.querySelector("#aboutOrganizationChart");
const personProfile = document.querySelector("#aboutPersonProfile");

function createOrganizationNode(member) {
  const button = document.createElement("button");
  button.className = "about-organization-node";
  button.type = "button";
  button.dataset.memberId = member.id;
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", `${member.jabatan}: ${member.nama}`);

  const role = document.createElement("span");
  role.className = "about-organization-node-role";
  role.textContent = member.jabatan;

  const name = document.createElement("span");
  name.className = "about-organization-node-name";
  name.textContent = member.nama;

  button.append(role, name);
  button.addEventListener("click", () => selectOrganizationMember(member));
  return button;
}

function selectOrganizationMember(member) {
  const photo = personProfile.querySelector(".about-person-photo");
  const placeholder = personProfile.querySelector(
    ".about-person-photo-placeholder",
  );

  personProfile.querySelector(".about-person-name").textContent = member.nama;
  personProfile.querySelector(".about-person-role").textContent =
    member.jabatan;
  personProfile.dataset.memberId = member.id;
  organizationChart
    .querySelectorAll(".about-organization-node")
    .forEach((node) => {
      const selected = node.dataset.memberId === member.id;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", String(selected));
    });

  photo.hidden = true;
  photo.removeAttribute("src");
  placeholder.hidden = false;

  if (!member.foto) return;

  photo.alt = `Foto ${member.nama}`;
  photo.addEventListener(
    "error",
    () => {
      if (personProfile.dataset.memberId !== member.id) return;
      photo.hidden = true;
      placeholder.hidden = false;
      console.error(`Foto anggota tidak dapat dimuat: ${member.foto}`);
    },
    { once: true },
  );
  photo.addEventListener(
    "load",
    () => {
      if (personProfile.dataset.memberId !== member.id) return;
      photo.hidden = false;
      placeholder.hidden = true;
    },
    { once: true },
  );
  photo.src = member.foto;
}

if (organizationChart && personProfile) {
  if (
    typeof strukturOrganisasi === "undefined" ||
    !Array.isArray(strukturOrganisasi)
  ) {
    organizationChart.querySelector(".about-organization-error").textContent =
      "Data struktur organisasi belum dapat dimuat.";
  } else {
    const members = strukturOrganisasi.filter(
      (member) =>
        member &&
        member.id &&
        member.nama &&
        member.jabatan &&
        ["pimpinan", "staff"].includes(member.tingkat),
    );

    if (members.length !== strukturOrganisasi.length) {
      console.error("Sebagian data anggota organisasi tidak lengkap.");
    }

    if (members.length === 0) {
      organizationChart.querySelector(".about-organization-error").textContent =
        "Belum ada data anggota organisasi untuk ditampilkan.";
    } else {
      organizationChart
        .querySelector(".about-organization-error")
        .remove();

      const leaders = document.createElement("div");
      leaders.className = "about-organization-level about-organization-leaders";
      const staff = document.createElement("div");
      staff.className = "about-organization-level about-organization-staff";

      members.forEach((member) => {
        const node = createOrganizationNode(member);
        (member.tingkat === "pimpinan" ? leaders : staff).append(node);
      });

      organizationChart.append(leaders, staff);
      selectOrganizationMember(members[0]);
    }
  }
}
