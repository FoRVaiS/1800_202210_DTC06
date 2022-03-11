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
