export function Navbar() {
  const current = location.hash;
  console.log("Current hash:", current);
  const isActive = (route) => {
    if (route === "#/materi") {
      return current.startsWith("#/materi") ? "active" : "";
    }
    return current === route ? "active" : "";
  };

  return `
    <header class="navbar">
      <div class="navbar-inner">

        <div class="nav-left">
          <h1>SiswaRoom</h1>
        </div>

        <nav class="nav-menu">
          <a href="#/" class="${isActive("#/")}">Beranda</a>
          <a href="#/materi" class="${isActive("#/materi")}">Materi</a>
          <a href="#/kuis" class="${isActive("#/kuis")}">Kuis</a>
        </nav>

      </div>
    </header>
  `;
}
