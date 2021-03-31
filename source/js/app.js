
/* ================================================================= */
/* ####################   MAIN FUNCTION GAME   ##################### */
/* ================================================================= */
    
    function quitGame(){
        clickSound();
        setTimeout(()=> location.href = location.origin, 300);
        
    }


    function getNameFirst(){
        const inputName = document.getElementById('playerName');
        return inputName.value;
    }


    function inputName(){
        const enterGame = document.getElementById('enterGame');
        const value = getNameFirst();

        if (value.length >= 15) {
            enterGame.classList.add('disabled');
            validSetup('Nama lebih dari 15 karakter!');
        } else{
            validSetup('');
            enterGame.classList.remove('disabled');
        }

    }


    function displayLoad() {
        const preload = document.querySelector('.overlay');
        preload.classList.toggle('gone'); 
    }


    function validSetup(string){
        const validation = document.querySelector('.validation-name');
        return validation.innerText = string;
    }


    function setPlayer( { name, coin } ) {
        // console.log(name, coin)
        document.querySelectorAll('.player-name')[0].innerText = name;
        document.querySelectorAll('.player-name')[1].innerText = name;
        document.querySelectorAll('.player-coin')[0].innerText = coin;
        document.querySelectorAll('.player-coin')[1].innerText = coin;

    }


    function randomLimitNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    function getCategoryValue( arrElems, arrValues ) {
        arrElems.forEach(ctg => {
            if (ctg.checked) {
                arrValues.push(ctg.value);
            }
        });
        if (arrValues.length < 3) {
            return false;
        }
        return SETTINGS_GAME.categories = arrValues;
    }


    function selectCategory() {
        let count = -1;
        return function( { categories }, reset = false ) {
            if (reset) {
                count = -1;
                return count;
            }
            if (count === categories.length - 1) {
                count = 0;
                return count;
            }
            count++;
            return count;
        }
    }


    function checkedCategory( arrElems, arrVal ) { 
        return arrElems.map(el => arrVal.map(val => el.value === val ? el.checked = true : '' ));
    }


    function saveSettings() {
        let values = [];
        let check = getCategoryValue(categories, values);
        return check ? alert('Berhasil diterapkan!') : alert('Pilih minimal 3 kategori diatas!');
    }


    function getQuestion( amount, diff, categories ) {
        // const idCategory = randomLimitNumber( 9, 9 );
        const currentCategory = countCategory( SETTINGS_GAME );
        const URL = `https://opentdb.com/api.php?amount=${amount}&category=${categories[currentCategory]}&difficulty=${diff}&type=multiple`;
        // const URL = 'test.json'; // Only For Testing Api
        return fetch(URL, { 
                method : 'GET' 
            })
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                // console.log(response); 
                return response.json();
            })
            .then(result => {
                if (result.response_code === 0) return result.results;
                throw new Error(result.response_code);
            });
    }


    function translateQuiz( word, codeLang ) {
        const URL = `https://amm-api-translate.herokuapp.com/translate?engine=google&text=${word}&to=${codeLang}`;
        return fetch(URL, {
            method: 'GET'
        })
        .then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        })
        .then(word => word.status ? word.data.result : word.message);

    }


    function clearBoard(){
        const questionText = document.querySelector('.question-text p');
        const choiceTexts = Array.from(document.querySelectorAll('.choice-text'));
        const choiceButtons = Array.from(document.querySelectorAll('.multiple-choice'));

        questionText.innerText = '';
        choiceTexts.forEach( choiceText => choiceText.innerText = '');
        choiceButtons.forEach( choiceButton => {
            choiceButton.classList.remove('correct');
            choiceButton.classList.remove('wrong');
        });
       
    }


    function clearCheckpoint() {
        const chkPoints = document.querySelectorAll('.checkpoint'); 
        chkPoints.forEach(cPoint => cPoint.classList.remove('checked'));
    }
    

    function checkpoint( pos ){
        const chkPoints = document.querySelectorAll('.checkpoint'); 
        chkPoints[chkPoints.length - pos].classList.toggle('checked');
        return chkPoints[chkPoints.length - pos].dataset.level;
    }


    function getCurrentCoin(currentPos) {
        const chkPoints = document.querySelectorAll('.checkpoint'); 
        const coin = chkPoints[chkPoints.length - currentPos].dataset.coin;
        return parseFloat(coin);
    }


    function randomChoice() {
        let _temp = [];

        for (let i = 0; i <= 3; i++) {
            const indexPos = randomLimitNumber( 0, 3 );
            // Check same random number
            _temp.includes(indexPos) ? i-- : _temp.push(indexPos);        
        }
        return _temp;
    }


    function switchLanguage() {
        let count = 0;
        count++;
        return function( { question, choices } ) {
            const questionText = document.querySelector('.question-text p');
            const optTexts = Array.from(document.querySelectorAll('.choice-text'));
            if (count == 1) {
                questionText.innerText = question[0].question;
                optTexts.forEach((cb, index) => cb.innerText = choices[0][QUESTION_GAME.choices[2][index]]);
                QUESTION_GAME.activeLanguage = 'en';
                return count++;
            }
            questionText.innerText = question[1].question;
            optTexts.forEach((cb, index) => cb.innerText = choices[1][QUESTION_GAME.choices[2][index]]);
            QUESTION_GAME.activeLanguage = SETTINGS_GAME.language;
            return count--;
        }
    }


    function setSearchLink( keyword ) {
        document.getElementById('googleSearch').setAttribute('href', `https://www.google.com/search?q=${keyword}`);
    }

    
    function setQuiz( { question, choices } ) {
        const questionText = document.querySelector('.question-text p');
        const optTexts = Array.from(document.querySelectorAll('.choice-text'));
        const randVal = randomChoice();
        QUESTION_GAME.choices[2] = randVal;     // Save random value to keep the choice option position when switching languages

        questionText.innerText = question[1].question;
        optTexts.forEach((cb, index) => cb.innerText = choices[1][randVal[index]]);
    }


    function setLevelGame( currentPos ) {
        const level = checkpoint( currentPos );
        
        switch (level) {
            case '1':
            case '2':
                SETTINGS_GAME.difficulties = 'easy';
                break;
            case '3':
                SETTINGS_GAME.difficulties = 'medium';
                break;
            case '4':
            case '5':
                SETTINGS_GAME.difficulties = 'hard';
                break;
        }
    }

    // ASYNC FUNCTION
    async function gameStart( { requestPerCall, difficulties, language, categories } ){
        try{
            // Request question to API
            // The results are in english
            const result = await getQuestion( requestPerCall, difficulties, categories );

            // Decode HTML characters code
            let enResultQt = result.map(data => convertHTMLEntity(data.question)).join('').trim();
            let enResultCorr = result.map(data => convertHTMLEntity(data.correct_answer)).join('').trim();
            let enResultIncorr = result.map(data => data.incorrect_answers).map(c => c.map(b => convertHTMLEntity(b))).join('');
            
            // Encode string to URL Encoding (RFC 3986)
            let enCodeResultQt = encodeURIComponent(enResultQt);  
            let enCodeResultCorr = encodeURIComponent(enResultCorr);
            let enCodeResultIncorr = encodeURIComponent(enResultIncorr);
            
            // Pass the encode strings to temporary variables
            let _tempQ = enCodeResultQt;
            let _tempC = [enCodeResultCorr,enCodeResultIncorr];

            // Translate to Other Language (default is Indonesia)
            _tempQ = await translateQuiz( _tempQ, language );
            _tempC = await translateQuiz( _tempC, language );
            
            let idResultQt = _tempQ;
            [idResultCorr, ...idChoices] = _tempC.split(',').map(text => text.trim());      // Breaks the strings into arrays & Clear empty space
            let enChoices = enResultIncorr.split(',').map(text => text.trim());             // Breaks the strings into arrays & Clear empty space
           
            enChoices.push(enResultCorr);                  // Push all choice option in english language
            idChoices.push(idResultCorr);                  // Push all choice option in other language (default is Indonesia)

            // Pass all the values above to main variable
            QUESTION_GAME.question = [
                {   id : 'en',
                    question : enResultQt
                },
                {   id : language,
                    question : idResultQt
                }
            ];
            QUESTION_GAME.correctAnswer = [
                {   id : 'en',
                    correct : enResultCorr
                },
                {   id : language,
                    correct : idResultCorr
                }
             ];
            QUESTION_GAME.choices = [ enChoices, idChoices, corrPosition = 0 ];
            QUESTION_GAME.activeLanguage = language;
            
            setQuiz(QUESTION_GAME);
            setHighlightText({ mainText:'', captionText:''});
            setSearchLink(QUESTION_GAME.question[1].question.split(' ').join('+'));
            muteInteraction(choiceButtons, optionHelperButtons, [translateButton]);
            setEmoji(false);
            return;
        }
        catch(error){
            // Show error to console
            console.error(error.message);
            // Show error to alert
            alert('Internal Error! Please try again later or refresh the page.');
            // Reset all value and variable to default
            resetGame();
            CHECKPOINT_GAME = 0;
            CURRENT_COIN = 0;
            document.body.classList.toggle('playing');
            transitionSound();
            setTimeout(transitionSound, 1000);
        }
    }


    function convertHTMLEntity(text){
        const span = document.createElement('span');
        return text
        .replace(/&[#A-Za-z0-9]+;/gi, (entity,position,text)=> {
            span.innerHTML = entity;
            return span.innerText;
        });
    }


    function setHighlightText( { mainText, captionText } ) {
        const mt = document.querySelector('.answer-text');
        const ct = document.querySelector('.caption-text');
        if (typeof(mainText) !== "string" && typeof(captionText) !== "string") {
            return;
        }
        mt.innerText = mainText;
        ct.innerText = captionText;
    }


    function randomHighlightText( arrTxt ) {
        const randVal = randomLimitNumber( 0, 4 );
        setHighlightText( arrTxt[randVal] );
    }


    function setEmoji(show = true) {
        if (show) {
            const randVal = randomLimitNumber( 1, 4 );
            document.querySelector('.emoticon').innerHTML = `<img src="./dist/icon/emoji-${randVal}.svg" width="90" height="80"></img>`;
            return document.querySelector('.emoticon').classList.add('show-up');
        }
        return document.querySelector('.emoticon').classList.remove('show-up');    // Emoji toggle show up
    }
    

    function checkActiveLanguage() {
        return QUESTION_GAME.activeLanguage !== SETTINGS_GAME.language;
    }


    function getCorrectAnswer( action, arrElems1, arrElems2, arrElms3 ) {
        const enLang = checkActiveLanguage();
        if (action === 'correct') {
            if (enLang) {
                // console.log('true : en');
                arrElems1.forEach(el => el.lastElementChild.innerText === QUESTION_GAME.correctAnswer[0].correct ? el.classList.add(action) : el.classList.add('wrong'));
            } else {
                // console.log('false : id');
                arrElems1.forEach(el => el.lastElementChild.innerText === QUESTION_GAME.correctAnswer[1].correct ? el.classList.add(action) : el.classList.add('wrong'));
            }
            muteInteraction( arrElems1, arrElems2, arrElms3 );
            return;
        } 
        else{
            if (enLang) {
                // console.log('true : en')
                return arrElems1.forEach(el => el.lastElementChild.innerText === QUESTION_GAME.correctAnswer[0].correct ? el.classList.toggle(action) : '');
            }
            // console.log('false : id')
            return arrElems1.forEach(el => el.lastElementChild.innerText === QUESTION_GAME.correctAnswer[1].correct ? el.classList.toggle(action) : '');
        }
    }


    function muteInteraction( ...arrElems ) {
        // console.log(arrElems);
        arrElems.forEach( arrElem => arrElem.forEach(el => el.classList.toggle('disabled')));
    }


    function getFFifty( arrElems ) {
        let enLang = checkActiveLanguage();
        let corr;
        if (enLang) {
            arrElems.forEach((el, index) => el.lastElementChild.innerText === QUESTION_GAME.correctAnswer[0].correct ? corr = index : '');
            return corr;
        }
        arrElems.forEach((el, index) => el.lastElementChild.innerText === QUESTION_GAME.correctAnswer[1].correct ? corr = index : '');
        return corr;
    }


    function setFFifty( arrElems ) {
        const optTexts = Array.from(document.querySelectorAll('.choice-text'));
        const corrAnswerPos = getFFifty(arrElems);
        let incorrAnswerPos = corrAnswerPos;
        // console.log(corrAnswerPos);
        corrAnswerPos >= 0 && corrAnswerPos <= 1 ? incorrAnswerPos++ : incorrAnswerPos--;
        
        optTexts.forEach((c, index) => {
            if (index !== incorrAnswerPos && index !== corrAnswerPos) {
                c.innerText = '';
            }
        });
        return;
    }


    function transitionsBoard() {
        document.body.classList.toggle('playing');
    }

    
    function modalToggle( string = '', winner = false) {
        document.querySelector('.modal-body').innerHTML = `<p class="mb-0">${string}</p>`;
        document.getElementById('modalGame').classList.toggle('show');
        document.querySelector('.modal-backdrop').classList.toggle('show');
        

        if (winner) {
            document.querySelector('.modal-footer #finishGame').innerHTML = `<img src="./dist/icon/icTakeCoin_btn.svg">`
            document.querySelector('.modal-footer #finishGame').classList.add('m-auto');
            document.querySelector('.modal-footer #repeatGame').classList.add('d-none');
        }
    }


    function resetModal() {
        document.getElementById('finishGame').classList.remove('m-auto');
        document.getElementById('finishGame').classList.remove('d-none');
        document.getElementById('repeatGame').classList.remove('d-none');
        document.getElementById('closeModal').classList.add('d-none');
        document.getElementById('escapeGame').classList.add('d-none');
    }


    function resetOptionHelper() {
        const helpButtons = Array.from(document.querySelectorAll('.option-helper'));
        helpButtons.forEach( b => b.classList.remove('selected'));
    }


    function resetGame() {
        clearBoard();
        clearCheckpoint();
        setHighlightText({ mainText:'', captionText:''});
        resetOptionHelper();
        setEmoji(false);
        countCategory( SETTINGS_GAME, true);    // Reset count of category arrays
    }


    function leftGame() {
        resetGame();
        modalToggle();
        muteInteraction(choiceButtons, optionHelperButtons, [translateButton]);
        setTimeout(resetModal, 300);
        
    }


    function playSound(audio) {
        if (!audio) return;
        audio.currentTime = 0;
        audio.play();
    }


    function transitionSound() {
        const audio = document.querySelector('audio[data-audio="transition"]');
        playSound(audio);
    }


    function clickSound() {
        const audio = document.querySelector('audio[data-audio="click"]');
        playSound(audio);
    }


    function trueSound() {
        const audio = document.querySelector('audio[data-audio="correct-answer"]');
        playSound(audio);
    }
    
    
    function gameOverSound() {
        const audio = document.querySelector('audio[data-audio="game-over"]');
        playSound(audio);
    }


    function winnerSound() {
        const audio = document.querySelector('audio[data-audio="winner-game"]');
        playSound(audio);
    }


    function applauseSound() {
        const audio = document.querySelector('audio[data-audio="applause"]');
        playSound(audio);
    }


    /* ================================================== */
    /*                SESSION STORAGE                     */
    /* ================================================== */

    function syncSessionStorage(action, ...dataPlayer){
        switch (action) {
            case 'SAVE':
                PLAYER_GAME.name = dataPlayer[0];
                PLAYER_GAME.coin = dataPlayer[1];
                PLAYER_GAME.highestLevel = dataPlayer[2];
            break;
            case 'UPDATE':
                PLAYER_GAME.coin += dataPlayer[0];
                PLAYER_GAME.highestLevel = dataPlayer[1] < PLAYER_GAME.highestLevel ? PLAYER_GAME.highestLevel : dataPlayer[1];
            break;
        }
        sessionStorage.setItem(GGQUIZ_SESSION, JSON.stringify(PLAYER_GAME));
        return;
    }


    function getFromSessionStorage(){
        let getSession = sessionStorage.getItem(GGQUIZ_SESSION);
        return getSession ? PLAYER_GAME = JSON.parse(getSession) : false;
    }

        /*  CHECK THE BROWSER SUPPORT SESSION STORAGE  */

        if (!typeof(Storage)) {
            console.warn("Session storage doesn't support on your browser! Your data will gone when the page are reload");
        } 


/* ================================================================== */
/* #####################     END FUNCTION    ######################## */
/* ================================================================== */


    

/* ================================================================= */
/*                          MAIN CODE HERE                           */
/* ================================================================= */

let PLAYER_GAME = {};
let QUESTION_GAME = {};
let CHECKPOINT_GAME = 0;
let CURRENT_COIN = 0;
let SETTINGS_GAME = {
    requestPerCall : 1,     // Do not change!
    language : 'id',        // Default language (indonesia)
    difficulties : 'easy',   // Default first difficulity
    categories : []
}

const GGQUIZ_SESSION = "GGQUIZ_SESSION"; // Session Storage Name


// When the Document loaded
window.addEventListener('load', ()=> {
    displayLoad();
    // GET Data First From Session Storage
    const getDataFromSessionStorage = getFromSessionStorage();
        if (getDataFromSessionStorage) {
            setPlayer(PLAYER_GAME);
            document.querySelector('#gameplay').style.display = 'flex';
            return;
        }
    document.querySelector('.player-input').classList.toggle('asked');
});



const randomText = [
    {
        mainText : 'Bagus!',
        captionText : 'Tetap Fokus.'
    },
    {
        mainText : 'Hebattt!',
        captionText : 'Ayoo Lanjutkan...'
    },
    {
        mainText : 'GG Sekali!',
        captionText : 'Kamu pasti bisa menang...'
    },
    {
        mainText : 'Sipp!',
        captionText : 'Ayo ayo.. kamu bisa melakukanya'
    },
    {
        mainText : 'Teruskan!',
        captionText : 'Jangan menyerahh.'
    }
]


/*  ENTER TO THE GAME  */
const enterGame = document.querySelector('#enterGame');
    enterGame.addEventListener('click', ()=> {
       
        let name = getNameFirst();      // get name from input text
        let coin = 0;                   // default first player coin
        let level = 0;                  // the default player level that has been played
        if (name === '') return validSetup('Mohon isikan nama kamu!');  // check empty string 
        // Session Storage
        syncSessionStorage('SAVE', name, coin, level);   // save data player to session storage
        setPlayer(PLAYER_GAME);                          // set data player to lobby board

        setTimeout(() => document.querySelector('.player-input').classList.toggle('asked'), 500);
        document.querySelector('#gameplay').style.display = 'flex';
    });



/*  START PLAYING THE GAME  */
const playGame = document.querySelector('#playGame');    
    playGame.addEventListener('click', ()=> {
        transitionsBoard();
        transitionSound();
        setTimeout(transitionSound, 1000);
        CHECKPOINT_GAME++
        setTimeout(() => {
            setHighlightText({
                mainText : 'Bersiap!',
                captionText : `Pertanyaan pertama`
            });
            setLevelGame(CHECKPOINT_GAME);
            gameStart(SETTINGS_GAME);
        }, 1300);
    });



/*  MULTIPLE CHOICE BUTTON CLICK EVENT */
const choiceButtons = Array.from(document.querySelectorAll('.multiple-choice'));
    choiceButtons.forEach( choiceButton => {
        choiceButton.addEventListener('click', function () {
            const lang = checkActiveLanguage();
            const playerAnswer = this.lastElementChild.innerText;
            const correctAnswer = lang ? QUESTION_GAME.correctAnswer[0].correct : QUESTION_GAME.correctAnswer[1].correct;
            let lastCoin, lastLevel;
            getCorrectAnswer( 'correct', choiceButtons, optionHelperButtons, [translateButton] );
            // CHECK IF THE PLAYER ANSWERS CORRECTLY  
            // THE CODE BELOW WILL RUN
            if (playerAnswer === correctAnswer) {
                CHECKPOINT_GAME++;
                lastCoin = CURRENT_COIN = getCurrentCoin(CHECKPOINT_GAME);
                setLevelGame(CHECKPOINT_GAME);
                setHighlightText({
                    mainText : 'BENAR!',
                    captionText : `Jawaban yang benar adalah ${correctAnswer}`
                });
                trueSound();
                setEmoji();
                setTimeout(() => {
                    // IF THE GAME IS ALREADY IN THE LAST QUESTION
                    if (CHECKPOINT_GAME === 18) {
                        modalToggle('<img src="./dist/img/winners.png" style="max-width: 480px;">', true);
                        winnerSound(); applauseSound();
                        lastLevel = checkpoint(CHECKPOINT_GAME);
                        // Session Storage
                        syncSessionStorage('UPDATE', lastCoin, lastLevel);    // Save data Game to session storage
                        setPlayer(PLAYER_GAME);                               // Set data player game to lobby board
                        resetGame();                                          // Reset all values and variables to default
                        CHECKPOINT_GAME = CURRENT_COIN = 0;                   // Reset Checkpoint & Current Coin
                        return;
                    }
                    // IF THE GAME IS ON LEVEL POINTS
                    else if (CHECKPOINT_GAME === 4 || CHECKPOINT_GAME === 8 || CHECKPOINT_GAME === 12 || CHECKPOINT_GAME === 15) {
                        CHECKPOINT_GAME++
                        checkpoint(CHECKPOINT_GAME);
                    }
                    clearBoard();
                    randomHighlightText( randomText );
                    gameStart(SETTINGS_GAME);
                }, 2500);
                return; // Do not erase
            }

            // IF THE PLAYER ANSWERS WRONGLY THE CODE BELOW WILL RUN
            setHighlightText({ 
                mainText : 'SALAH!', 
                captionText : `Jawaban yang benar adalah ${correctAnswer}`
            });
            gameOverSound();
            setTimeout(() => {
                lastLevel = checkpoint(CHECKPOINT_GAME);
                lastCoin = CURRENT_COIN;
                modalToggle(`<img src="./dist/icon/emoji-5.svg" width="240" height="220"><br>
                           <span style="font-size:1.5em;font-weight:700;">Game Over!</span><br>
                           Coin yang kamu dapatkan adalah ${CURRENT_COIN} <span><img src="./dist/icon/icCoin_Credit.svg"></span><br>Mau ulangi permainan?`
                            );
                // Session Storage
                syncSessionStorage('UPDATE', lastCoin, lastLevel);    // Save data Game to session storage
                setPlayer(PLAYER_GAME);                               // Set data player game to lobby board
                resetGame();                                          // Reset all values and variables to default
                CHECKPOINT_GAME = CURRENT_COIN = 0;                   // Reset Checkpoint & Current Coin
            }, 2500);
            return;
        })
    });



/*  FINISH THE GAME ( redirect to Lobby ) */
const finishGameBtn = document.querySelector('#finishGame'); 
finishGameBtn.addEventListener('click', ()=> {
    modalToggle();   
    resetModal();
    document.querySelector('.modal-footer #finishGame').innerHTML = `<img src="./dist/icon/icNo_btn.svg">`;
    document.body.classList.toggle('playing');
    transitionSound();
    setTimeout(transitionSound, 1500);
});


/*  REPEAT THE GAME (play again) */
const repeatGame = document.querySelector('#repeatGame');
repeatGame.addEventListener('click', ()=> {
    modalToggle();
    CHECKPOINT_GAME++
    setTimeout(() => {
        setHighlightText({
            mainText: 'Bersiap!', 
            captionText: 'Pertanyaan pertama'
        });
        setLevelGame(CHECKPOINT_GAME);
        gameStart(SETTINGS_GAME);
    }, 1300);
});


/*  QUIT THE GAME ( redirect to index ) */
const quitGameBtn = document.querySelector('#quitGame');
quitGameBtn.addEventListener('click', quitGame);


/*  HELP OPTIONS EVENTS */
const optionHelperButtons = Array.from(document.querySelectorAll('.option-helper'));
optionHelperButtons.forEach( optionHelper => {
    optionHelper.addEventListener('click', function() {
        
        this.classList.add('selected');

        /*  FIFTY FIFTY HELP OPTION  */
        if (this.id === 'fiftyOption') setFFifty( choiceButtons );

        /*  HIGHLIGHT HELP OPTION  */
        if (this.id === 'highlightOption') {
            getCorrectAnswer( 'highlight', choiceButtons );
            setTimeout(() => {
                getCorrectAnswer( 'highlight', choiceButtons );
            }, 3000);
        }

        /*  GOOGLING HELP OPTION  */
        
    });
});



/*  SWTICH LANGUAGE BUTTON EVENT */
const translateButton = document.getElementById('switch-lang');
const switchLang = switchLanguage();
translateButton.addEventListener('click', () => {
    setTimeout(()=> switchLang( QUESTION_GAME ), 500);
});



/*  SET CATEGORY EVENT ( it will first set the categories when the document is loaded ) */ 
const categories = Array.from(document.querySelectorAll('input[type="checkbox"]'));
const countCategory = selectCategory();                     // Counter of category array values
getCategoryValue(categories, SETTINGS_GAME.categories);     // retrieve the values from the checked checkbox


/*  APPLY SETTINGS BUTTON EVENT */
document.getElementById('saveSettings').addEventListener('click', saveSettings);

    
/*  SETTINGS BUTTON EVENT */
// const settingsButton = document.getElementById('settingsGame');
document.getElementById('settingsGame').addEventListener('click', ()=> {
    clickSound();
    checkedCategory(categories, SETTINGS_GAME.categories);
});


/*  CLOSE SETTINGS BUTTON EVENT */
// const closeSettingsButton = document.getElementById('closeSettings');
document.getElementById('closeSettings').addEventListener('click', ()=> {
    let validateCount = 0;
    let countCategory = SETTINGS_GAME.categories.length;
    categories.forEach( ctg => {
        ctg.checked ? validateCount++ : '';
    });
    if (validateCount > countCategory || validateCount < countCategory) {
        if(confirm('Ada perubahan yang belum disimpan. Klik "OK" untuk menyimpan!')){
            saveSettings();
            return;
        }
    }
});


/*  LEFT THE GAME MODAL TRIGGER  ( AFK ) */ 
const leftGameButton = document.getElementById('leftGame');
leftGameButton.addEventListener('click', function() {
    finishGameBtn.classList.add('d-none');          //  Hide finish button in modal footer
    repeatGame.classList.add('d-none');             //  Hide repeat game button in modal footer

    document.getElementById('closeModal').classList.remove('d-none');
    document.getElementById('escapeGame').classList.remove('d-none');
    modalToggle('Mau kabur? Renungin pepatah berikut<br>"Lebih Baik Kalah Bertanding Daripada Menyerah Tanpa Thingking!"<br>Masih mau kabur?');
});


/*  CANCEL LEFT GAME BUTTON */ 
document.getElementById('closeModal').addEventListener('click',()=> {
    modalToggle();
    setTimeout(resetModal, 200);
});


/*  CONFIRM LEFT GAME BUTTON */ 
document.getElementById('escapeGame').addEventListener('click', ()=> {
    const questionText = document.querySelector('.question-text p');
    let timing = 3500;
    CHECKPOINT_GAME = CURRENT_COIN = 0;   
    
    if (questionText.innerText !== "") {
        timing = 0;
    }

    setTimeout(()=>{
        transitionsBoard();
        transitionSound();
        leftGame();
        setTimeout(transitionSound, 1500);
        document.getElementById('escapeGame').innerHTML = '<img src="./dist/icon/icConfirmAfk_btn.svg">';
    }, timing);

    document.getElementById('escapeGame').innerHTML = '<img src="./dist/icon/icWait.svg">';
});