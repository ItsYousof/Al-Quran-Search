const wordInput = document.getElementById('word-input');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results');

// Helper function to remove Tashkeel
function removeTashkeel(word) {
    return word.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
}

// Function to create and display a result
function createResult(word, meaning, num, surah) {
    const result = document.createElement('div');
    result.classList.add('result');

    result.innerHTML = `
            <p id="word">${word}</p>
            <p id="meaning">${meaning}</p>
            <p id="surah">${surah !== null ? surah : 'N/A'} آية: ${num !== null ? num : 'N/A'}</p>
    `;

    resultsContainer.appendChild(result);
}

async function getWord() {
    const word = wordInput.value.trim();
    if (word === '') {
        wordInput.style.borderColor = 'red';
        setTimeout(() => {
            wordInput.style.borderColor = '#ced4da';
        }, 2000);
        return;
    }

    const response = await fetch('../words.json');
    const data = await response.json();

    // Preprocess data to store both the original word and the word without Tashkeel
    const processedData = data.map(entry => ({
        ...entry,
        wordWithoutTashkeel: removeTashkeel(entry.word)
    }));

    const normalizedWord = removeTashkeel(word);

    const results = processedData.filter(entry => entry.wordWithoutTashkeel === normalizedWord);

    // Sort results based on surahNumber
    results.sort((a, b) => a.surahNumber - b.surahNumber);

    resultsContainer.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>لم يتم العثور على نتائج</p>';
    } else {
        results.forEach(entry => {
            createResult(entry.word, entry.meaning, entry.ayaNumber, entry.surahName);
        });
    }
}

// Event listener for 'Enter' key press
wordInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        getWord();
    } else {
        if (wordInput.value.length === 0) {
            resultsContainer.innerHTML = '';
        } else {
            if (wordInput.value.length >= 3) {
                suggest();
            }
        }
    }
});


async function suggest() {
    const words = await fetch("../words.json");
    const data = await words.json();

    const processedData = data.map(entry => ({
        ...entry,
        wordWithoutTashkeel: removeTashkeel(entry.word)
    }));

    const normalizedWord = removeTashkeel(wordInput.value);

    const suggestions = processedData.filter(entry => entry.wordWithoutTashkeel.startsWith(normalizedWord));

    // Sort suggestions based on surahNumber
    suggestions.sort((a, b) => a.surahNumber - b.surahNumber);

    resultsContainer.innerHTML = '';

    if (suggestions.length === 0) {
        resultsContainer.innerHTML = '<p>لم يتم العثور على نتائج</p>';
    } else {
        suggestions.forEach(entry => {
            createResult(entry.word, entry.meaning, entry.ayaNumber, entry.surahName);
        });
    }
}