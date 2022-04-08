(() => {
    const { readUrlParams, fetchCurrentUserDocument } = window.comidas.exports;

    const params = readUrlParams();
    const formRef = document.querySelector('form#user-settings');

    /**
     * Read all the values in the form and save it to the current user's document.
     *
     * @param {Event} e The event propagated from an event listener.
     * @returns {boolean}
     */
    function processForm(e) {
        e.preventDefault();
        // Create a object mapping between each input's name paired with the selected value.
        const formData = Object.fromEntries($(formRef).serializeArray().map(Object.values));
        const { activity_type: activityType, person_type: personType, bio } = formData;

        // Update operation.
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
