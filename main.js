// Dictionary Script starts here --------------------------------------------------------------------------
(() => {
    function createView() {
        const view = document.createElement('div');
        const styles = getComputedStyle(document.body)

        view.style.minWidth = '300px';
        view.style.width = '90vw';
        view.style.maxHeight = '280px';
        view.style.height = 'auto';
        view.style.position = 'fixed';
        view.style.bottom = '50px';
        view.style.left = '50%';
        view.style.display = 'none';
        view.style.transform = 'translateX(-50%)';
        view.style.fontFamily = 'inherit';
        view.style.fontSize = 'inherit';
        view.style.borderRadius = '5px';
        view.style.overflowY = 'auto';


        view.style.background = styles.getPropertyValue("--readerSettings-theme") || '#292832'
        view.style.color = styles.getPropertyValue("--readerSettings-textColor") || '#CCCCCC'
        view.style.padding = styles.getPropertyValue("--readerSettings-padding") || '4px'
        view.style.marginBottom = styles.getPropertyValue("--readerSettings-padding") || '4px'
        view.style.border = `3px double ${styles.getPropertyValue("--readerSettings-textColor") || '#CCCCCC'}`;

        return view;
    }

    const debounce = (callback, wait) => {
        let timeoutId = null;
        return (...args) => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                callback(...args);
            }, wait);
        };
    }

    const selectionFilter = (e) => {
        const l = window.getSelection().toString().trim()
        if (l && !/\s/.test(l)) {
            getDefinition(l)
        } else {
            clearDiv()
        }
    }

    let d = createView()
    let setErrorTimeout = null;

    document.body.appendChild(d)
    document.addEventListener('selectionchange', debounce(selectionFilter, 700))

    const clearDiv = () => {
        meanings = [];
        d.innerHTML = '';
        d.style.display = 'none';
    }

    const setData = (data) => {
        if (!Number.isFinite(data?.count) || data?.count === 0) {
            d.style.display = 'block';
            d.innerHTML =
                (data?.word ? `<h3>${data.word}</h3> <hr>` : '') + `<p>${data.error ? data.error : 'No data found'}</p>`;
            setErrorTimeout = setTimeout(clearDiv, 3000);
        } else {
            clearTimeout(setErrorTimeout);
            d.style.display = 'block';
            d.innerHTML = '';

            data.meanings.forEach((wordData) => {
                const wordElement = document.createElement('div');
                wordElement.className = 'word';
                wordElement.innerHTML =
                    `<div style="display: flex; align-items: baseline; gap: 5px">
    <h3>${wordData.word}</h3>
    ${wordData?.phonetic ? `<i>${wordData.phonetic}</i>` : ''}
</div>`;

                wordData.meanings.forEach((meaning) => {
                    const meaningElement = document.createElement('div');
                    meaningElement.className = 'meaning';
                    meaningElement.innerHTML = `<hr><b>${meaning.partOfSpeech}</b>`;

                    meaning.definitions.forEach((definition) => {
                        const definitionElement = document.createElement('div');
                        definitionElement.className = 'definition';
                        definitionElement.innerHTML = `
                            <p>${definition?.definition}</p>
                            ${(definition?.example || definition?.synonyms || definition?.antonyms) ? `<blockquote>
                                ${definition?.example ? `<p>Eg: <q>${definition.example}</q></p>` : ''}
                                ${definition?.synonyms?.length ? `<p>${definition.synonyms.join(', ')}</p>` : ''}
                                ${definition?.antonyms?.length ? `<p>${definition.antonyms.join(', ')}</p>` : ''}
                            </blockquote>`: ''}
                        `;

                        meaningElement.appendChild(definitionElement);
                    });

                    wordElement.appendChild(meaningElement);
                });

                d.appendChild(wordElement);
            });
        }
        d.scrollTop = 0;
    }

    async function getDefinition(word) {
        let url =
            "https://api.dictionaryapi.dev/api/v2/entries/en/" + word;

        try {
            const response = await fetch(url);
            const fetchedData = await response.json();
            if (response.status === 200) {
                const count = fetchedData.length;
                if (count === 0)
                    throw new Error("Word not found in the database");
                setData({ word, meanings: fetchedData, count })
            } else throw new Error('Error fetching data')
        } catch (error) {
            setData({ word, error })
        }
    }
})();
// Dictionary Script ends here --------------------------------------------------------------------------