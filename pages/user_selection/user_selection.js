(() => {
    const formRef = document.querySelector("form#user-settings");
    formRef.addEventListener('submit', processForm);

    const params = Object.fromEntries(window.location.search.substring(1).split('&').map(param => param.split('=')));

    function processForm(e) {
        e.preventDefault();
        const formData = Object.fromEntries($(formRef).serializeArray().map(Object.values));
        const { activity_type: activityType, person_type: personType, bio } = formData;

        firebase.auth().onAuthStateChanged(user => {
            if (!user) return console.warn('User is not signed in!');

            db.collection('users').doc(user.uid).update({
                userType: personType,
                type: activityType,
                bio
            }).then(() => {
                window.location.href = params.redirect;
            });
        });

        return false;
    }
})();