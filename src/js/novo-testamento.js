document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = "https://raw.githubusercontent.com/thiagobodruk/biblia/refs/heads/master/json/nvi.json";
    const container = document.getElementById('testamento-dinamico');
    let biblia = [];
    let livroAtual = null;
    let capituloAtual = null;

    function renderLivros() {
        container.innerHTML = '<h2 class="mb-4">Livros do Novo Testamento</h2>';
        const livros = biblia.slice(39); // Novo Testamento
        container.innerHTML += `<div class='row g-3'>${livros.map((livro, idx) =>
            `<div class='col-6 col-md-4 col-lg-3'>
                <button class='btn btn-dark w-100 py-3 rounded-4 shadow-sm livro-btn' data-livro='${idx}'>${livro.name}</button>
            </div>`
        ).join('')}</div>`;
        Array.from(container.querySelectorAll('button[data-livro]')).forEach(btn => {
            btn.onclick = function() {
                livroAtual = Number(this.getAttribute('data-livro'));
                renderCapitulos();
            };
        });
    }

    function renderCapitulos() {
        const livro = biblia[livroAtual + 39];
        container.innerHTML = `<h2 class='mb-3'>${livro.name}</h2>
            <button class='btn btn-outline-secondary rounded-pill shadow-sm mb-4 px-4 py-2 d-inline-flex align-items-center' id='voltar-livros'>
                <i class="fas fa-arrow-left me-2"></i> Voltar aos livros
            </button>`;
        container.innerHTML += `<div class='row g-3 justify-content-center'>${livro.chapters.map((_, idx) =>
            `<div class='col-3 col-sm-2 col-md-1 mb-2 d-flex justify-content-center'>
                <button class='btn btn-dark w-100 rounded-4 shadow-sm cap-btn' style='min-width:48px;' data-capitulo='${idx}'>${idx+1}</button>
            </div>`
        ).join('')}</div>`;
        document.getElementById('voltar-livros').onclick = renderLivros;
        Array.from(container.querySelectorAll('button[data-capitulo]')).forEach(btn => {
            btn.onclick = function() {
                capituloAtual = Number(this.getAttribute('data-capitulo'));
                renderVersiculos();
            };
        });
        // Efeito hover customizado
        Array.from(container.querySelectorAll('.cap-btn')).forEach(btn => {
            btn.onmouseover = () => btn.classList.add('shadow-lg');
            btn.onmouseout = () => btn.classList.remove('shadow-lg');
        });
    }

    function renderVersiculos() {
        const livro = biblia[livroAtual + 39];
        const capitulo = livro.chapters[capituloAtual];
        container.innerHTML = `<h2 class='mb-3'>${livro.name} ${capituloAtual+1}</h2>
            <button class='btn btn-outline-secondary rounded-pill shadow-sm mb-4 px-4 py-2 d-inline-flex align-items-center' id='voltar-capitulos'>
                <i class="fas fa-arrow-left me-2"></i> Voltar aos capítulos
            </button>`;
        container.innerHTML += `<div class='list-group'>${capitulo.map((vers, idx) =>
            `<div class='list-group-item'><strong>Versículo ${idx+1}:</strong> ${vers}</div>`
        ).join('')}</div>`;
        document.getElementById('voltar-capitulos').onclick = renderCapitulos;
    }

    container.innerHTML = '<div class="text-center text-info">Carregando livros...</div>';
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            biblia = data;
            renderLivros();
        })
        .catch(() => {
            container.innerHTML = '<div class="alert alert-danger">Erro ao carregar os livros do Novo Testamento.</div>';
        });
}); 