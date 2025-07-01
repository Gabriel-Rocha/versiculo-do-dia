document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = "https://raw.githubusercontent.com/thiagobodruk/biblia/refs/heads/master/json/nvi.json";
    const versiculosLista = document.getElementById('versiculos-lista');
    const paginacao = document.getElementById('versiculos-paginacao');
    const buscaForm = document.getElementById('versiculos-busca-form');
    const buscaInput = document.getElementById('versiculos-busca-input');
    const porPagina = 20;
    let todosVersiculos = [];
    let versiculosFiltrados = [];
    let paginaAtual = 1;
    let totalPaginas = 1;

    function renderVersiculos() {
        versiculosLista.innerHTML = '<div class="text-center text-info">Carregando versículos...</div>';
        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                todosVersiculos = [];
                data.forEach(livro => {
                    livro.chapters.forEach((cap, i) => {
                        cap.forEach((vers, j) => {
                            todosVersiculos.push({
                                referencia: `${livro.name} ${i+1}:${j+1}`,
                                texto: vers
                            });
                        });
                    });
                });
                versiculosFiltrados = todosVersiculos;
                totalPaginas = Math.ceil(versiculosFiltrados.length / porPagina);
                mostrarPagina(1);
            })
            .catch(() => {
                versiculosLista.innerHTML = '<div class="alert alert-danger">Erro ao carregar os versículos.</div>';
            });
    }

    function mostrarPagina(pagina) {
        paginaAtual = pagina;
        const inicio = (paginaAtual - 1) * porPagina;
        const fim = inicio + porPagina;
        const versiculosPagina = versiculosFiltrados.slice(inicio, fim);
        if (versiculosPagina.length === 0) {
            versiculosLista.innerHTML = '<div class="alert alert-warning">Nenhum versículo encontrado.</div>';
        } else {
            versiculosLista.innerHTML = versiculosPagina.map(v =>
                `<div class='card mb-2'><div class='card-body'><strong>${v.referencia}</strong><br><span>${v.texto}</span></div></div>`
            ).join('');
        }
        renderPaginacao();
    }

    function renderPaginacao() {
        totalPaginas = Math.ceil(versiculosFiltrados.length / porPagina);
        if (totalPaginas <= 1) { paginacao.innerHTML = ''; return; }
        paginacao.innerHTML = `
            <button class='btn btn-sm btn-secondary me-2' ${paginaAtual === 1 ? 'disabled' : ''} data-page='1'>&laquo; Primeira</button>
            <button class='btn btn-sm btn-secondary me-2' ${paginaAtual === 1 ? 'disabled' : ''} data-page='${paginaAtual-1}'>&lsaquo; Anterior</button>
            <span class='mx-2'>Página ${paginaAtual} de ${totalPaginas}</span>
            <button class='btn btn-sm btn-secondary ms-2' ${paginaAtual === totalPaginas ? 'disabled' : ''} data-page='${paginaAtual+1}'>Próxima &rsaquo;</button>
            <button class='btn btn-sm btn-secondary ms-2' ${paginaAtual === totalPaginas ? 'disabled' : ''} data-page='${totalPaginas}'>Última &raquo;</button>
        `;
        Array.from(paginacao.querySelectorAll('button[data-page]')).forEach(btn => {
            btn.onclick = function() {
                mostrarPagina(Number(this.getAttribute('data-page')));
            };
        });
    }

    if (buscaForm && buscaInput) {
        buscaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const termo = buscaInput.value.trim().toLowerCase();
            if (!termo) {
                versiculosFiltrados = todosVersiculos;
            } else {
                versiculosFiltrados = todosVersiculos.filter(v =>
                    v.texto.toLowerCase().includes(termo) || v.referencia.toLowerCase().includes(termo)
                );
            }
            mostrarPagina(1);
        });
    }

    renderVersiculos();
}); 