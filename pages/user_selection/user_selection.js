(() => {
    const { readUrlParams, fetchCurrentUserDocument } = window.comidas.exports;

    const params = readUrlParams();
    const formRef = document.querySelector('form#user-settings');

    function processForm(e) {
        e.preventDefault();
        const formData = Object.fromEntries($(formRef).serializeArray().map(Object.values));
        const { activity_type: activityType, person_type: personType, bio } = formData;

        fetchCurrentUserDocument()
            .then(userDoc => userDoc.ref.update({
                userType: personType,
                type: activityType,
                bio,
            }))
            .then(() => window.location.assign(params.redirect))
            .catch(console.error);
        
        return false;
    }

    formRef.addEventListener('submit', processForm);
})();
