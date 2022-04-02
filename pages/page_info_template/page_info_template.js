//** function to display additional information when clicking the readmore button on the suggestion card */
(() => {
    const params = Object.fromEntries(window.location.search.substring(1).split('&').map(param => param.split('=')));
    // populate cards based on user type
    async function populateCardsDynamically(type) {

        const snapshot = await db.collection(type).where('id', '==', params.code).get();

        const [doc] = snapshot.docs;
        // set vars for each piece of info we want to get from firestore db colelction
        const infoCardImage = doc.data().image;
        const infoCardName = doc.data().name;
        const infoCardAddress = doc.data().address;
        const infoCardHours = doc.data().hours;
        const infoCardWebsite = doc.data().website;
        const infoCardPhone = doc.data().phone;
        // attach the selected info from firestore to html divs
        document.querySelector('#picture').setAttribute("src", infoCardImage);
        document.querySelector('.card-title').innerHTML = infoCardName;
        document.querySelector('.card-address').innerHTML = infoCardAddress;
        document.querySelector('.card-hours').innerHTML = infoCardHours;
        document.querySelector('.card-website').innerHTML = infoCardWebsite;
        document.querySelector('.card-phone').innerHTML = infoCardPhone;
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
    // code for the bookmark/save button
    const saveBtnRef = document.querySelector('#saveIcon');

    saveBtnRef.setAttribute('data-id', params.code);

    const suggestionCode = saveBtnRef.getAttribute('data-id');

    saveBtnRef.onclick = () => {
        if (!suggestionCode) return console.warn("This button does not contain a data-id code");

        firebase.auth().onAuthStateChanged(async(user) => {
            if (user) { // This should only work if the user is signed in
                const userDoc = db.collection("users").doc(user.uid);

                try {
                    // Add TYPE_ID to user's favourites
                    const result = await userDoc.update({
                        favourites: firebase.firestore.FieldValue.arrayUnion(suggestionCode)
                    });
                    // Success
                } catch (e) {
                    // Failure
                    // Error stored in 'e'
                }
            }
        });
    }
})();