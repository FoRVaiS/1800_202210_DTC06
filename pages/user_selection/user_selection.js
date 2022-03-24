(() => {
    const validateMandatoryData = (form, onFailure) => {

    }
    const formRef = document.querySelector("form#user-settings");
    formRef.addEventListener('submit', processForm);

    function processForm(e) {
        e.preventDefault();
        const formData = Object.fromEntries($(formRef).serializeArray().map(Object.values));
        const { activity_type: activityType, person_type: personType, bio } = formData;
        // debugger;

        firebase.auth().onAuthStateChanged(user => {
            if (!user) return console.warn('User is not signed in!');

            db.collection('users').doc(user.uid).update({
                userType: personType,
                type: activityType,
                bio
            }).then(() => {
                window.location.href = "../main/main.html"
            });
        });


        return false;
    }
})();