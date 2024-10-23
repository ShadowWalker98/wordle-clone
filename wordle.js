const geturl = "https://words.dev-apis.com/word-of-the-day";
const posturl = "https://words.dev-apis.com/validate-word";

let responseFromApi;
let row = 1;
let col = 0;
const maxRows = 6;
const maxCols = 5;
const numberMap = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
}

let wordOfTheDay;
let wordOfTheDayDict = {};

let word = "";

function getParaClassString(row, col) {
    return ".input-" + numberMap[row] + "-" + numberMap[col] + " p";
}

function getDivClassString(row, col) {
    return ".input-" + numberMap[row] + "-" + numberMap[col];
}

async function checkIfWordIsValid() {
    // make a POST call to the API

    let res = await fetch(posturl, {
        body: JSON.stringify({word: word}),
        method: "POST",
    })

    res = await res.json();

    return res["validWord"];
}

function playInvalidWordAnimation() {
    for(let i = 1; i <= maxCols; i++) {
        let divRef = document.querySelector(getDivClassString(row, i));
        divRef.classList.add("row-" + numberMap[row]);
        divRef.addEventListener("animationend", () => {
            divRef.classList.remove("row-" + numberMap[row]);
        });
    }
}

function verifyWord() {

    let wordDict = {};
    // go through the word and convert it to a dictionary
    for(let i = 0; i < word.length; i++) {
        if(word[i] in wordDict) {
            wordDict[word[i]] += 1;
        } else {
            wordDict[word[i]] = 1;
        }
    }

    let temp = structuredClone(wordOfTheDayDict);

    let valid = new Set();
    let misplaced = new Set();
    let wrong = new Set();

    for(let i = 0; i < word.length; i++) {
        if(word[i] === wordOfTheDay[i]) {
            // valid 
            temp[word[i]] -= 1;
            valid.add(i);
        }
    }


    for(let i = 0; i < word.length; i++) {
        if(valid.has(i)) continue;
        if(temp[word[i]] > 0) {
            temp[word[i]] -= 1;
            misplaced.add(i);
        } else {
            wrong.add(i);
        }
    }
    
    for(let i = 0; i < word.length; i++) {
        let divRef = document.querySelector(getDivClassString(row - 1, i + 1));
        if(valid.has(i)) {
            divRef.classList.add("correct");
        } else if(misplaced.has(i)) {
            divRef.classList.add("misplaced");
        } else {
            divRef.classList.add("wrong");
        }
    }
}

async function handleInput(keystroke) {
    if(keystroke >= "a" && keystroke <= "z") {
        let letter = keystroke.toUpperCase();
        // the key goes in the div [row, col];
        // we then increment the col
        if(col < maxCols) {
            col += 1;
        }

        let paraReference = getParaClassString(row, col);
        let div = document.querySelector(paraReference);
        div.innerText = letter;

        if(word.length < 5) {
            word += letter;
        } else {
            if(word[4] !== letter)
                word = word.substring(0, 4) + letter;
        }

    } else {
        if(keystroke == 'Backspace') {
            // delete the last character if there is one
            if(col > 0) {
                let paraReference = getParaClassString(row, col);
                document.querySelector(paraReference).innerText = "";
                col -= 1;
                word = word.substring(0, word.length - 1);
            }
        } else if(keystroke === 'Enter') {
            if(col == maxCols && row <= maxRows) {
                let isValid = await checkIfWordIsValid(word);
                if(!isValid) {
                    playInvalidWordAnimation();
                    return;
                }
                row += 1;
                col = 0;
                // check if the word is valid by making a call to the api
                // TODO: call api 
                
                // then check if it is correct or not and colour accordingly
                verifyWord();
                if(word === wordOfTheDay) {
                    console.log("Congratulations! You won!");
                    alert("You won!");
                    let headerText = document.querySelector(".header-text");
                    headerText.classList.add("winning");
                    document.removeEventListener("keyup", keyUpHandler);
                }
                // set word to empty string
                word = ""
            }

            if(row > maxRows) {
                console.log("game over!");
                document.removeEventListener("keyup", keyUpHandler);
            }
        }
    }
}

async function init() {
    // set up the game by fetching the API
    let res = await fetch(geturl);
    res = await res.json();
    responseFromApi = res;
    wordOfTheDay = responseFromApi["word"].toUpperCase();
    for(let i = 0; i < wordOfTheDay.length; i++) {
        if(wordOfTheDay[i] in wordOfTheDayDict) {
            wordOfTheDayDict[wordOfTheDay[i]] += 1;
        } else {
            wordOfTheDayDict[wordOfTheDay[i]] = 1;
        }
    }
    document.addEventListener('keyup', keyUpHandler);
}

async function keyUpHandler(event) {
    await handleInput(event.key);
}

init();