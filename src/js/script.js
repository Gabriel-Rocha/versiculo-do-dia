document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://raw.githubusercontent.com/thiagobodruk/biblia/refs/heads/master/json/nvi.json";
    const dateElement = document.getElementById("date");
    const verseTextElement = document.getElementById("verse-text");
    const verseReferenceElement = document.getElementById("verse-reference");

    // Atualizar data
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString("pt-BR", options);
    dateElement.textContent = formattedDate;

    // Verificar se o versículo do dia já está armazenado
    const storedData = JSON.parse(localStorage.getItem("verseOfTheDay"));
    const storedDate = storedData?.date;
    const isSameDay = storedDate === formattedDate;

    if (isSameDay) {
        // Usar versículo armazenado
        const { verse, reference } = storedData;
        verseTextElement.textContent = verse;
        verseReferenceElement.innerHTML = `<span class="verse-reference">${reference}</span>`;
    } else {
        // Buscar novo versículo e armazenar
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Selecionar aleatoriamente um livro, capítulo e versículo
                const bookIndex = Math.floor(Math.random() * data.length);
                const book = data[bookIndex];
                const chapterIndex = Math.floor(Math.random() * book.chapters.length);
                const chapter = book.chapters[chapterIndex];
                const verseIndex = Math.floor(Math.random() * chapter.length);
                const verse = chapter[verseIndex];
                const reference = `${book.name} ${chapterIndex + 1}:${verseIndex + 1}`;

                // Atualizar a página
                verseTextElement.textContent = verse;
                verseReferenceElement.innerHTML = `<span class="verse-reference">${reference}</span>`;
                // Salvar no localStorage
                localStorage.setItem(
                    "verseOfTheDay",
                    JSON.stringify({ date: formattedDate, verse, reference })
                );
            })
            .catch(error => {
                verseTextElement.textContent = "Erro ao carregar o versículo.";
                console.error("Erro ao buscar dados da API:", error);
            });
    }

    // Validação e feedback acessível para o formulário de e-mail
    const form = document.getElementById("subscription-form");
    const emailInput = document.getElementById("email-input");

    if (form && emailInput) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const email = emailInput.value.trim();
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (regex.test(email)) {
                mostrarMensagemFeedback("E-mail cadastrado com sucesso!", "success");
                emailInput.value = "";
                emailInput.setAttribute('aria-invalid', 'false');
                // Exibir modal de agradecimento
                const thankYouModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
                thankYouModal.show();
            } else {
                mostrarMensagemFeedback("Por favor, insira um e-mail válido.", "error");
                emailInput.setAttribute('aria-invalid', 'true');
                emailInput.focus();
            }
        });
    }

    // Função de feedback acessível
    function mostrarMensagemFeedback(mensagem, tipo) {
        // Remover qualquer mensagem existente
        const mensagemExistente = document.querySelector(".feedback-message");
        if (mensagemExistente) {
            mensagemExistente.remove();
        }
        // Criar nova mensagem
        const feedbackMessage = document.createElement("div");
        feedbackMessage.className = `feedback-message ${tipo}`;
        feedbackMessage.textContent = mensagem;
        feedbackMessage.setAttribute('role', 'alert');
        feedbackMessage.setAttribute('aria-live', 'assertive');
        // Adicionar ao corpo do documento
        document.body.appendChild(feedbackMessage);
        // Remover mensagem após 5 segundos
        setTimeout(() => feedbackMessage.remove(), 5000);
    }

    // Busca de versículos por tema ou palavra-chave
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchBtn = searchForm ? searchForm.querySelector('button[type="submit"]') : null;
    let bibliaData = null;
    let currentLang = 'pt';
    let bibliaLoaded = false;

    // Mensagem inicial de carregamento
    if (searchResults) {
        searchResults.innerHTML = '<div class="alert alert-info">Carregando dados da Bíblia...</div>';
    }
    if (searchBtn) searchBtn.disabled = true;

    // Carregar a bíblia uma vez para busca
    fetch("https://raw.githubusercontent.com/thiagobodruk/biblia/refs/heads/master/json/nvi.json")
        .then(response => response.json())
        .then(data => {
            bibliaData = data;
            bibliaLoaded = true;
            if (searchBtn) searchBtn.disabled = false;
            if (searchResults) searchResults.innerHTML = '';
            console.log('Bíblia carregada com sucesso!');
        })
        .catch((err) => {
            bibliaData = null;
            bibliaLoaded = false;
            if (searchBtn) searchBtn.disabled = true;
            if (searchResults) searchResults.innerHTML = '<div class="alert alert-danger">Erro ao carregar dados da Bíblia.</div>';
            console.error('Erro ao carregar a Bíblia:', err);
        });

    function getSearchTranslation(key) {
        return (translations[currentLang] && translations[currentLang][key]) || translations['pt'][key] || '';
    }

    if (searchForm && searchInput && searchResults) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!bibliaLoaded) {
                searchResults.innerHTML = '<div class="alert alert-warning">Aguarde o carregamento dos dados da Bíblia.</div>';
                return;
            }
            const termo = searchInput.value.trim().toLowerCase();
            searchResults.innerHTML = '';
            if (!termo || !bibliaData) {
                searchResults.innerHTML = `<div class="alert alert-warning">${getSearchTranslation('searchType')}</div>`;
                return;
            }
            let resultados = [];
            for (const livro of bibliaData) {
                for (let cap = 0; cap < livro.chapters.length; cap++) {
                    for (let v = 0; v < livro.chapters[cap].length; v++) {
                        const texto = livro.chapters[cap][v];
                        if (texto.toLowerCase().includes(termo)) {
                            resultados.push({
                                referencia: `${livro.name} ${cap + 1}:${v + 1}`,
                                texto
                            });
                            if (resultados.length >= 10) break;
                        }
                    }
                    if (resultados.length >= 10) break;
                }
                if (resultados.length >= 10) break;
            }
            console.log('Busca realizada:', termo, 'Resultados:', resultados.length);
            if (resultados.length === 0) {
                searchResults.innerHTML = `<div class="alert alert-info">${getSearchTranslation('searchNoResults')}</div>`;
            } else {
                searchResults.innerHTML = resultados.map(r =>
                    `<div class='card mb-2'><div class='card-body'><strong>${r.referencia}</strong><br><span>${r.texto}</span></div></div>`
                ).join('');
            }
        });
    }

    // Internacionalização
    const translations = {
        pt: {
            title: 'Versículo do Dia',
            subtitle: 'Diariamente um versículo ou passagem bíblica para melhorar e inspirar o seu dia.',
            verseToday: 'Versículo de Hoje',
            like: 'Gostei',
            dislike: 'Não Gostei',
            share: 'Compartilhe e nos ajude a espalhar a palavra de Deus:',
            rate: 'Avalie o versículo:',
            subscribe: 'Receba o versículo diário no seu e-mail!',
            subscribeBtn: 'Inscrever-se',
            searchPlaceholder: 'Buscar por tema ou palavra-chave...',
            searchBtn: 'Buscar',
            searchNoResults: 'Nenhum versículo encontrado para sua busca.',
            searchType: 'Digite uma palavra-chave para buscar.',
            thankYouTitle: 'Obrigado pela sua inscrição!',
            thankYouMsg: 'Seu e-mail foi cadastrado com sucesso.<br>Você começará a receber o versículo do dia em breve.',
            testimonialsTitle: 'Depoimentos de quem foi abençoado',
        },
        en: {
            title: 'Verse of the Day',
            subtitle: 'Every day a Bible verse or passage to improve and inspire your day.',
            verseToday: 'Todays Verse',
            like: 'Like',
            dislike: 'Dislike',
            share: 'Share and help us spread the Word of God:',
            rate: 'Rate the verse:',
            subscribe: 'Receive the daily verse in your email!',
            subscribeBtn: 'Subscribe',
            searchPlaceholder: 'Search by theme or keyword...',
            searchBtn: 'Search',
            searchNoResults: 'No verses found for your search.',
            searchType: 'Type a keyword to search.',
            thankYouTitle: 'Thank you for subscribing!',
            thankYouMsg: 'Your email has been successfully registered.<br>You will soon receive the verse of the day.',
            testimonialsTitle: 'Testimonies from those who were blessed',
        },
        es: {
            title: 'Versículo del Día',
            subtitle: 'Cada día un versículo o pasaje bíblico para mejorar e inspirar tu día.',
            verseToday: 'Versículo de Hoy',
            like: 'Me gusta',
            dislike: 'No me gusta',
            share: 'Comparte y ayúdanos a difundir la palabra de Dios:',
            rate: 'Califica el versículo:',
            subscribe: '¡Recibe el versículo diario en tu correo!',
            subscribeBtn: 'Suscribirse',
            searchPlaceholder: 'Buscar por tema o palabra clave...',
            searchBtn: 'Buscar',
            searchNoResults: 'No se encontraron versículos para tu búsqueda.',
            searchType: 'Escribe una palabra clave para buscar.',
            thankYouTitle: '¡Gracias por suscribirte!',
            thankYouMsg: 'Tu correo ha sido registrado con éxito.<br>Pronto recibirás el versículo del día.',
            testimonialsTitle: 'Testimonios de quienes fueron bendecidos',
        }
    };

    function setLanguage(lang) {
        currentLang = lang;
        const t = translations[lang] || translations.pt;
        document.querySelector('h2').textContent = t.title;
        document.querySelector('main p').textContent = t.subtitle;
        document.querySelector('#verse-box h3').textContent = t.verseToday;
        document.querySelector('#like-button').innerHTML = `<i class="fas fa-thumbs-up"></i> ${t.like}`;
        document.querySelector('#dislike-button').innerHTML = `<i class="fas fa-thumbs-down"></i> ${t.dislike}`;
        document.querySelector('#verse-box .mt-4').textContent = t.share;
        document.querySelector('#verse-box .d-flex.gap-2.mb-3 + p').textContent = t.rate;
        document.querySelector('#email-container h4').textContent = t.subscribe;
        document.querySelector('#email-container button[type="submit"]').textContent = t.subscribeBtn;
        document.getElementById('search-input').placeholder = t.searchPlaceholder;
        document.querySelector('#search-form button').textContent = t.searchBtn;
        document.getElementById('thankYouModalLabel').textContent = t.thankYouTitle;
        document.querySelector('#thankYouModal .modal-body p').innerHTML = t.thankYouMsg;
        document.querySelector('#depoimentos h3').textContent = t.testimonialsTitle;
    }

    document.getElementById('language-selector').addEventListener('change', function() {
        setLanguage(this.value);
    });

    // Overlay de loading
    function criarLoadingOverlay() {
        if (document.getElementById('loading-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner-border text-warning" role="status" aria-label="Carregando..."><span class="visually-hidden">Carregando...</span></div>';
        document.body.appendChild(overlay);
    }
    let loadingStart = null;
    function mostrarLoading() {
        criarLoadingOverlay();
        const overlay = document.getElementById('loading-overlay');
        overlay.style.display = 'flex';
        overlay.classList.remove('fade-out');
        loadingStart = Date.now();
    }
    function esconderLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            const elapsed = Date.now() - (loadingStart || 0);
            const minTime = 1000;
            const delay = Math.max(0, minTime - elapsed);
            setTimeout(() => {
                overlay.classList.add('fade-out');
                setTimeout(() => { overlay.style.display = 'none'; }, 400);
            }, delay);
        }
    }
    // Exibir loading ao carregar a página
    window.addEventListener('DOMContentLoaded', mostrarLoading);
    window.addEventListener('load', esconderLoading);
    // Exibir loading ao clicar em links internos
    function ativarLoadingLinks() {
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
                link.addEventListener('click', function(e) {
                    mostrarLoading();
                });
            }
        });
    }
    window.addEventListener('DOMContentLoaded', ativarLoadingLinks);
});
