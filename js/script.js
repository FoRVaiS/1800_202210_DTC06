/** Query the database to fetch the user document */
function fetchUserDoc(uid) {
    return db.collection("users").doc(uid).get();
}

/** Stores public user data in LocalStorage */
function storeUserData(doc) {
    const { name } = doc.data();

    window.localStorage.setItem('username', name);
}

/** When the user successfully logs in, execute any post-login tasks */
async function handleUserSession(user) {
    const isUserLoggedIn = !!user;

    if (isUserLoggedIn) {
        if (!window.localStorage.getItem('username')) storeUserData(await fetchUserDoc(user.uid));

        const username = window.localStorage.getItem('username');

        $('#username').text(username);
        $('.navbar__profile').attr('data-signed-in', true);
    }
}

(() => {
    const auth = firebase.auth();

    auth.onAuthStateChanged(user => {
        handleUserSession(user);
    });
})();

function populateCardsDynamically() {
    let hikeCardTemplate = document.getElementById("hikeCardTemplate");
    let hikeCardGroup = document.getElementById("hikeCardGroup");

    db.collection("Restaurants").get()
        .then(allHikes => {
            allHikes.forEach(doc => {
                var hikeName = doc.data().name; //gets the name field
                var hikeID = doc.data().id; //gets the unique ID field
                var description = doc.data().description; //gets the length field
                let testHikeCard = hikeCardTemplate.content.cloneNode(true);
                testHikeCard.querySelector('.card-title').innerHTML = hikeName;
                testHikeCard.querySelector('.card-length').innerHTML = description;
                testHikeCard.querySelector('a').onclick = () => setHikeData(hikeID);
                // testHikeCard.querySelector('img').src = `./images/${hikeID}.jpg`;
                hikeCardGroup.appendChild(testHikeCard);
            })
        })
}

populateCardsDynamically();

function setHikeData(id) {
    localStorage.setItem('hikeID', id);
}

// called on page startup and waits for function to be implemented
$(document).ready(main);

// in js functions are from bottom --> top