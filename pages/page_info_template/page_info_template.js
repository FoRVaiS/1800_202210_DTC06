//** function to display additional information when clicking the readmore button on the suggestion card */
(() => {
    const { fetchCurrentUserDocument, fetchDocuments, fetchDocument } = window.comidas.exports;
    const params = Object.fromEntries(window.location.search.substring(1).split('&').map(param => param.split('=')));
    // populate cards based on user type
    async function populateCardsDynamically(type) {

        const snapshot = await db.collection(type).where('id', '==', params.code).get();
        const bookmarkRef = document.querySelector('.bookmark');

        const [doc] = snapshot.docs;
        // set vars for each piece of info we want to get from firestore db colelction
        const infoCardImage = doc.data().image;
        const infoCardName = doc.data().name;
        const infoCardAddress = doc.data().address;
        const infoCardHours = doc.data().hours;
        const infoCardWebsite = doc.data().website;
        const infoCardPhone = doc.data().phone;
        // attach the selected info from firestore to html divs

        displayBookmarkState(bookmarkRef, await fetchBookmarkState(params.code));

        document.querySelector('#picture').setAttribute("src", infoCardImage);
        document.querySelector('.card-title').innerHTML = infoCardName;
        document.querySelector('.card-address').innerHTML = infoCardAddress;
        document.querySelector('.card-hours').innerHTML = infoCardHours;
        document.querySelector('.card-website').innerHTML = infoCardWebsite;
        document.querySelector('.card-phone').innerHTML = infoCardPhone;

        bookmarkRef.onclick = () => toggleBookmarkState(bookmarkRef, params.code);
    }
    //** function to check which "type" the user is */
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {
                const data = doc.data();
                if (data.type === 'activities') {
                    populateCardsDynamically(data.type);
                }

                if (data.type === 'restaurants') {
                    populateCardsDynamically(data.type);
                }

                if (data.type === 'sightsee') {
                    populateCardsDynamically(data.type);
                }
            });
        }
    });
    // function to check the state of the bookmark and if it should be filled or not
    function displayBookmarkState(ref, shouldToggle) {
        if (shouldToggle) {
            ref.classList.remove('bi-bookmark');
            ref.classList.add('bi-bookmark-fill');
        } else {
            ref.classList.remove('bi-bookmark-fill');
            ref.classList.add('bi-bookmark');
        }
    }

    async function fetchBookmarkState(id) {
        const snapshot = await fetchCurrentUserDocument();

        return snapshot.data().favourites.includes(id.toUpperCase());
    }

    async function toggleBookmarkState(ref, id) {
        const snapshot = await fetchCurrentUserDocument();
        const currentState = await fetchBookmarkState(id);

        if (!currentState) {
            displayBookmarkState(ref, true);
            await snapshot.ref.update({ favourites: firebase.firestore.FieldValue.arrayUnion(id.toUpperCase()) })
        } else {
            displayBookmarkState(ref, false)
            await snapshot.ref.update({ favourites: firebase.firestore.FieldValue.arrayRemove(id.toUpperCase()) })
        }
    }
})();