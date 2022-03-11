(() => {
    const saveBtnRef = document.querySelector('#saveIcon');
    const suggestionCode = saveBtnRef.getAttribute('data-id');

    saveBtnRef.onclick = () => {
        if (!suggestionCode) return console.warn("This button does not contain a data-id code");

        firebase.auth().onAuthStateChanged(async (user) => {
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