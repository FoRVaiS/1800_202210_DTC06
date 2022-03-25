/** Query the database to fetch the user document */
function fetchUserDoc(uid) {
    return db.collection("users").doc(uid).get();
}

/** Stores public user data in LocalStorage */
function storeUserData(doc) {
    const { name } = doc.data();

    window.localStorage.setItem('username', name);
}

function getCurrentUser() {
    return new Promise((resolve, reject) => firebase.auth().onAuthStateChanged(user => {
        if (user) {
            resolve(user);
        } else {
            reject();
        }
    }));
}

async function fetchFirestoreDoc(collection, document) {
    return db.collection(collection).doc(document).get();
}

/** When the user successfully logs in, execute any post-login tasks */
async function handleUserSession(user) {
    const isUserLoggedIn = !!user;

    if (isUserLoggedIn) {
        // if (!window.localStorage.getItem('username')) storeUserData(await fetchUserDoc(user.uid));
        storeUserData(await fetchUserDoc(user.uid));

        const username = window.localStorage.getItem('username');

        $('#username').text(username);
        $('.navbar__profile').attr('data-signed-in', true);
    }
}

(() => {
    $('nav.navbar').load('../_partials/header.html');
    $('footer.footer').load('../_partials/footer.html');

    const auth = firebase.auth();

    auth.onAuthStateChanged(user => {
        handleUserSession(user);
    });
})();
