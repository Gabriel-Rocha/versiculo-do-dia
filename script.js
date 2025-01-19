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
        verseReferenceElement.innerHTML = `<span class="verse-reference">${reference}</span>`;  // Aqui fazemos a mudança para incluir o span
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
                verseReferenceElement.innerHTML = `<span class="verse-reference">${reference}</span>`;  // Aqui fazemos a mudança para incluir o span

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
});
