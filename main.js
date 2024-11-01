
import debounce from 'lodash.debounce'

function createView() {
    const view = document.createElement('div');
    view.setAttribute("id", "scnid")
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
    view.style.borderRadius = '3px';
    view.style.overflowY = 'auto';


    view.style.background = styles.getPropertyValue("--readerSettings-theme") || '#292832'
    view.style.color = styles.getPropertyValue("--readerSettings-textColor") || '#CCCCCC'
    view.style.padding = styles.getPropertyValue("--readerSettings-padding") || '4px'
    view.style.marginBottom = styles.getPropertyValue("--readerSettings-padding") || '4px'
    view.style.border = `3px double ${styles.getPropertyValue("--readerSettings-textColor") || '#CCCCCC'}`;

    return view;
}

let d = createView()
const p = (e) => {
    const l = window.getSelection().toString().trim()
    if (l && !/\s/.test(l)) {
        getDefinition(l)
    } else {
        clearDiv()
    }
}

document.body.appendChild(d)
document.addEventListener('selectionchange', debounce(p, 700))

let clearDiv = () => {
    d.textContent = '';
    d.style.display = 'none';
}

let setErrorTimeout = null;

function setData(data) {
    if (!data || data?.error) {
        d.textContent = data?.error ? 
        `
        <h3>${data.word}</h3>
        <hr>
        <p>${data.error}</p>
        `
        : 'No data found'
        setErrorTimeout = setTimeout(clearDiv, 3000);
    } else {
        clearTimeout(setErrorTimeout);
        d.style.display = 'block';
        d.innerHTML = 
        `<h3>${data.word}</h3>` + (data?.phonetic ? `<p>${data.phonetic}</p>` : '') +
        `<hr>` +
        (data?.def ? `<p>${data.def}</p>` : 'No defination found') +
        (data?.eg ? `<p>Eg: ${data.eg}</p>` : '')
    }
}



async function getDefinition(word) {
    let url =
        "https://api.dictionaryapi.dev/api/v2/entries/en/" + word;

    try {
        const response = await fetch(url);
        const fetchedData = await response.json();
        if (response.status === 200) {
            let rWord = fetchedData[0]?.word;
            let phonetic = fetchedData[0]?.phonetic;
            let def = fetchedData[0]?.meanings[0]?.definitions[0]?.definition;
            let eg = fetchedData[0]?.meanings[0]?.definitions[0]?.example;
            setData({ word: rWord , def, eg, phonetic })
        } else {
            setData( { word, error: "Word not found in the database" });
        }
    } catch (error) {
        setData({ word, error })
    }
}